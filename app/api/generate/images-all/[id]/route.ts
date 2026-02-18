import { NextRequest, NextResponse } from "next/server";
import { getProjectImages, updateProjectImage } from "@/lib/db/project-images";
import { generateImage } from "@/lib/gemini/client";
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
    const images = getProjectImages(projectId);

    const results: { slot: string; ok: boolean; error?: string }[] = [];
    for (let i = 0; i < IMAGE_SLOTS.length; i++) {
      const slot = IMAGE_SLOTS[i];
      const row = images[i];
      const prompt = row?.prompt?.trim();
      if (!prompt) {
        results.push({ slot, ok: false, error: "No prompt" });
        continue;
      }
      try {
        const buffer = await generateImage(prompt);
        const relativePath = saveProjectImage(projectId, slot, buffer);
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
    return NextResponse.json({ generated, total: IMAGE_SLOTS.length, results });
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
