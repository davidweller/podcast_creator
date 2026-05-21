import { NextRequest, NextResponse } from "next/server";
import { getProjectImage, updateProjectImage } from "@/lib/db/project-images";
import { generateImage } from "@/lib/gemini/client";
import { generateOpenAiImage } from "@/lib/openai/image-client";
import {
  DEFAULT_IMAGE_MODEL,
  getImageModelOrThrow,
  normalizeLegacyImageModelId,
} from "@/lib/models/registry";
import { ensure16x9 } from "@/lib/images/ensure-16-9";
import { generateThumbnailWithRetries } from "@/lib/images/thumbnail-pipeline";
import { saveProjectImage } from "@/lib/images/storage";
import { IMAGE_SLOTS, type ImageSlot } from "@/types/database";

/** Image generation (OpenAI GPT image models) can run for many minutes (matches extended OpenAI client timeouts). */
export const maxDuration = 800;

const VALID_SLOTS = new Set<ImageSlot>(IMAGE_SLOTS);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);
    const body = await request.json().catch(() => ({}));
    const slot = body.slot != null ? String(body.slot) : null;
    const promptOverride = typeof body.prompt === "string" ? body.prompt : undefined;
    const safeMode = body.safeMode === true;
    const rawImageModel =
      typeof body.imageModel === "string"
        ? body.imageModel
        : typeof body.geminiImageModel === "string"
          ? body.geminiImageModel
          : "";
    const requestedImageModel =
      normalizeLegacyImageModelId(rawImageModel.trim()) || DEFAULT_IMAGE_MODEL;
    const imageModel = getImageModelOrThrow(requestedImageModel);

    if (!slot || !VALID_SLOTS.has(slot as ImageSlot)) {
      return NextResponse.json(
        { error: "Invalid or missing slot. Use 1-12, 'thumbnail_cozy', or 'thumbnail_cinematic'." },
        { status: 400 }
      );
    }
    const slotKey = slot as ImageSlot;

    const row = getProjectImage(projectId, slotKey);
    const prompt = promptOverride ?? row?.prompt ?? null;
    if (!prompt?.trim()) {
      console.log(`Slot ${slotKey}: No prompt found. Row exists: ${!!row}, promptOverride: ${!!promptOverride}`);
      return NextResponse.json(
        { error: `No prompt for slot ${slot}. Generate prompts first.` },
        { status: 400 }
      );
    }

    console.log(`Generating image for slot ${slotKey}...`);
    try {
      const isThumbnail = slotKey === "thumbnail_cozy" || slotKey === "thumbnail_cinematic";
      const sourceGenerator = async (effectivePrompt: string) =>
        imageModel.provider === "google_gemini"
          ? generateImage(effectivePrompt, { model: imageModel.id })
          : generateOpenAiImage(effectivePrompt, {
              model: imageModel.apiModel,
              purpose: isThumbnail ? "thumbnail" : "scene",
            });
      let finalBuffer: Buffer;
      let metaJson: string | null = null;
      if (isThumbnail) {
        const thumbnailResult = await generateThumbnailWithRetries({
          prompt,
          strictMode: safeMode,
          maxRetries: safeMode ? 3 : 2,
          generateSourceImage: sourceGenerator,
        });
        finalBuffer = thumbnailResult.imageBuffer;
        metaJson = JSON.stringify(thumbnailResult.meta);
        console.log(
          `Thumbnail quality for slot ${slotKey}: score=${thumbnailResult.meta.score}, pass=${thumbnailResult.meta.pass}, attempts=${thumbnailResult.meta.attemptCount}, strategy=${thumbnailResult.meta.strategy}`
        );
      } else {
        const buffer = await sourceGenerator(prompt);
        console.log(`Generated image buffer for slot ${slotKey}, size: ${buffer.length} bytes`);
        finalBuffer = await ensure16x9(buffer, { mode: "crop" });
      }
      console.log(`Processed 16:9 image for slot ${slotKey}, size: ${finalBuffer.length} bytes`);
      const relativePath = saveProjectImage(projectId, slotKey, finalBuffer);
      console.log(`Saved image for slot ${slotKey} to: ${relativePath}`);
      updateProjectImage(projectId, slotKey, {
        image_path: relativePath,
        thumbnail_meta_json: metaJson,
      });
      console.log(`Updated database for slot ${slotKey}`);

      return NextResponse.json({
        slot: slotKey,
        image_path: relativePath,
        thumbnail_meta_json: metaJson,
      });
    } catch (genError: any) {
      console.error(`Error generating image for slot ${slotKey}:`, genError);
      throw genError;
    }
  } catch (error: any) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      {
        error:
          error.message?.includes("GOOGLE_GEMINI_API_KEY")
            ? "Gemini API key not configured. Set GOOGLE_GEMINI_API_KEY in .env"
            : error.message?.includes("OPENAI_API_KEY")
              ? "OpenAI API key not configured. Set OPENAI_API_KEY in .env"
            : error.message || "Failed to generate image",
      },
      { status: 500 }
    );
  }
}
