import { NextRequest, NextResponse } from "next/server";
import { getProjectImages, updateProjectImage } from "@/lib/db/project-images";
import { generateImage } from "@/lib/gemini/client";
import { DEFAULT_GEMINI_IMAGE_MODEL, getGeminiImageModelOrThrow } from "@/lib/models/registry";
import { ensure16x9 } from "@/lib/images/ensure-16-9";
import { saveProjectImage } from "@/lib/images/storage";
import { IMAGE_SLOTS } from "@/types/database";

const DELAY_MS = 1500;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);
    const body = await request.json().catch(() => ({}));
    const geminiImageModel =
      typeof body.geminiImageModel === "string"
        ? getGeminiImageModelOrThrow(body.geminiImageModel)
        : DEFAULT_GEMINI_IMAGE_MODEL;
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
    
    for (let i = 0; i < IMAGE_SLOTS.length; i++) {
      const slot = IMAGE_SLOTS[i];
      const row = imagesBySlot.get(slot);
      const prompt = row?.prompt?.trim();
      if (!prompt) {
        results.push({ slot, ok: false, error: "No prompt" });
        console.log(`Skipping slot ${slot}: no prompt`);
        continue;
      }
      try {
        const buffer = await generateImage(prompt, { model: geminiImageModel });
        const buffer16x9 = await ensure16x9(buffer);
        const relativePath = saveProjectImage(projectId, slot, buffer16x9);
        updateProjectImage(projectId, slot, { image_path: relativePath });
        results.push({ slot, ok: true });
      } catch (err: any) {
        results.push({ slot, ok: false, error: err.message || "Generation failed" });
      }
      if (i < IMAGE_SLOTS.length - 1) {
        await delay(DELAY_MS);
      }
    }

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
            : error.message || "Failed to generate images",
      },
      { status: 500 }
    );
  }
}
