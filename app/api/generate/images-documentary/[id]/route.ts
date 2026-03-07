import { NextRequest, NextResponse } from "next/server";
import { getProjectImages, updateProjectImage } from "@/lib/db/project-images";
import { generateImage } from "@/lib/gemini/client";
import { ensure16x9 } from "@/lib/images/ensure-16-9";
import { saveProjectImage } from "@/lib/images/storage";
import { DOCUMENTARY_SLOTS } from "@/types/database";

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
    const images = getProjectImages(projectId);
    console.log(`Processing ${DOCUMENTARY_SLOTS.length} documentary image slots for project ${projectId}`);

    const results: { slot: string; ok: boolean; error?: string }[] = [];
    const imagesBySlot = new Map(images.map((img) => [img.slot, img]));

    const slotsWithPrompts = DOCUMENTARY_SLOTS.filter(
      (slot) => imagesBySlot.get(slot)?.prompt?.trim()
    );
    console.log(`Documentary slots with prompts: ${slotsWithPrompts.length} (${slotsWithPrompts.join(", ")})`);

    for (let i = 0; i < DOCUMENTARY_SLOTS.length; i++) {
      const slot = DOCUMENTARY_SLOTS[i];
      const row = imagesBySlot.get(slot);
      const prompt = row?.prompt?.trim();
      if (!prompt) {
        results.push({ slot, ok: false, error: "No prompt" });
        console.log(`Skipping slot ${slot}: no prompt`);
        continue;
      }
      try {
        console.log(`Generating documentary image for slot ${slot}...`);
        const buffer = await generateImage(prompt);
        const buffer16x9 = await ensure16x9(buffer);
        const relativePath = saveProjectImage(projectId, slot, buffer16x9);
        updateProjectImage(projectId, slot, { image_path: relativePath });
        results.push({ slot, ok: true });
        console.log(`Generated ${slot}: ${relativePath}`);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Generation failed";
        results.push({ slot, ok: false, error: errorMessage });
        console.error(`Failed to generate ${slot}: ${errorMessage}`);
      }
      if (i < DOCUMENTARY_SLOTS.length - 1) {
        await delay(DELAY_MS);
      }
    }

    const generated = results.filter((r) => r.ok).length;
    const failed = results.filter((r) => !r.ok);
    if (failed.length > 0) {
      console.log(`Failed documentary slots: ${failed.map((r) => `${r.slot} (${r.error})`).join(", ")}`);
    }
    return NextResponse.json({ 
      generated, 
      total: DOCUMENTARY_SLOTS.length, 
      results, 
      failed: failed.length > 0 ? failed : undefined 
    });
  } catch (error: unknown) {
    console.error("Error generating documentary images:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error:
          errorMessage.includes("GOOGLE_GEMINI_API_KEY")
            ? "Gemini API key not configured. Set GOOGLE_GEMINI_API_KEY in .env"
            : errorMessage || "Failed to generate documentary images",
      },
      { status: 500 }
    );
  }
}
