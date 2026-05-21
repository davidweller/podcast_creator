import { NextRequest, NextResponse } from "next/server";
import { getProjectImages, updateProjectImage } from "@/lib/db/project-images";
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

/** Batch image generation can exceed default serverless / proxy limits. */
export const maxDuration = 800;

const MAX_CONCURRENT_GENERATIONS = 4;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);
    const body = await request.json().catch(() => ({}));
    const rawImageModel =
      typeof body.imageModel === "string"
        ? body.imageModel
        : typeof body.geminiImageModel === "string"
          ? body.geminiImageModel
          : "";
    const requestedImageModel =
      normalizeLegacyImageModelId(rawImageModel.trim()) || DEFAULT_IMAGE_MODEL;
    const imageModel = getImageModelOrThrow(requestedImageModel);
    const images = getProjectImages(projectId);
    console.log(`Processing ${images.length} image slots for project ${projectId}`);

    const results: { slot: string; ok: boolean; error?: string }[] = [];
    const imagesBySlot = new Map(images.map((img) => [img.slot, img]));
    
    // Log which slots have prompts
    const slotsWithPrompts = Array.from(imagesBySlot.values())
      .filter((img) => img.prompt?.trim())
      .map((img) => img.slot)
      .sort((a, b) => {
        const aNum = parseInt(a);
        const bNum = parseInt(b);
        return isNaN(aNum) || isNaN(bNum) ? a.localeCompare(b) : aNum - bNum;
      });
    console.log(`Slots with prompts: ${slotsWithPrompts.length} (${slotsWithPrompts.slice(0, 10).join(", ")}${slotsWithPrompts.length > 10 ? "..." : ""})`);
    
    const generationSlots: ImageSlot[] = [];
    const slotResultIndex = new Map<ImageSlot, number>();

    for (const slot of IMAGE_SLOTS) {
      const row = imagesBySlot.get(slot);
      const prompt = row?.prompt?.trim();
      if (!prompt) {
        const idx = results.push({ slot, ok: false, error: "No prompt" }) - 1;
        slotResultIndex.set(slot, idx);
        console.log(`Skipping slot ${slot}: no prompt`);
        continue;
      }
      const idx = results.push({ slot, ok: false, error: "Queued" }) - 1;
      slotResultIndex.set(slot, idx);
      generationSlots.push(slot);
    }

    let nextSlotIndex = 0;
    const workerCount = Math.min(MAX_CONCURRENT_GENERATIONS, generationSlots.length);

    const runWorker = async () => {
      while (true) {
        const currentIndex = nextSlotIndex++;
        if (currentIndex >= generationSlots.length) break;

        const slot = generationSlots[currentIndex];
        const row = imagesBySlot.get(slot);
        const prompt = row?.prompt?.trim();
        const resultIndex = slotResultIndex.get(slot);

        if (!prompt || resultIndex == null) continue;

        try {
          const isThumbnail = slot === "thumbnail_cozy" || slot === "thumbnail_cinematic";
          const sourceGenerator = async (effectivePrompt: string) =>
            imageModel.provider === "google_gemini"
              ? generateImage(effectivePrompt, { model: imageModel.id })
              : generateOpenAiImage(effectivePrompt, {
                  model: imageModel.apiModel,
                  purpose: isThumbnail ? "thumbnail" : "scene",
                });
          let finalBuffer: Buffer;
          let metaJson: string | null = null;
          let warning: string | undefined;
          if (isThumbnail) {
            const thumbnailResult = await generateThumbnailWithRetries({
              prompt,
              generateSourceImage: sourceGenerator,
            });
            finalBuffer = thumbnailResult.imageBuffer;
            metaJson = JSON.stringify(thumbnailResult.meta);
            if (!thumbnailResult.meta.pass) {
              warning = `Low framing safety score (${thumbnailResult.meta.score}) after retries`;
            }
          } else {
            const buffer = await sourceGenerator(prompt);
            finalBuffer = await ensure16x9(buffer, { mode: "crop" });
          }
          const relativePath = saveProjectImage(projectId, slot, finalBuffer);
          updateProjectImage(projectId, slot, {
            image_path: relativePath,
            thumbnail_meta_json: metaJson,
          });
          results[resultIndex] = { slot, ok: true };
          if (warning) {
            results[resultIndex].error = warning;
          }
        } catch (err: any) {
          results[resultIndex] = {
            slot,
            ok: false,
            error: err?.message || "Generation failed",
          };
        }
      }
    };

    await Promise.all(Array.from({ length: workerCount }, () => runWorker()));

    const generated = results.filter((r) => r.ok).length;
    const failed = results.filter((r) => !r.ok);
    if (failed.length > 0) {
      console.log(`Failed slots: ${failed.map((r) => `${r.slot} (${r.error})`).join(", ")}`);
    }
    return NextResponse.json({ generated, total: IMAGE_SLOTS.length, results, failed: failed.length > 0 ? failed : undefined });
  } catch (error: any) {
    console.error("Error generating all images:", error);
    return NextResponse.json(
      {
        error:
          error.message?.includes("GOOGLE_GEMINI_API_KEY")
            ? "Gemini API key not configured. Set GOOGLE_GEMINI_API_KEY in .env"
            : error.message?.includes("OPENAI_API_KEY")
              ? "OpenAI API key not configured. Set OPENAI_API_KEY in .env"
            : error.message || "Failed to generate images",
      },
      { status: 500 }
    );
  }
}
