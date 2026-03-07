import { NextRequest, NextResponse } from "next/server";
import { getProjectImage, updateProjectImage } from "@/lib/db/project-images";
import { generateImage } from "@/lib/gemini/client";
import { ensure16x9 } from "@/lib/images/ensure-16-9";
import { saveProjectImage } from "@/lib/images/storage";
import { IMAGE_SLOTS, type ImageSlot } from "@/types/database";

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

    if (!slot || !VALID_SLOTS.has(slot as ImageSlot)) {
      return NextResponse.json(
        { error: "Invalid or missing slot. Use 1-36 or 'thumbnail'." },
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
      const buffer = await generateImage(prompt);
      console.log(`Generated image buffer for slot ${slotKey}, size: ${buffer.length} bytes`);
      const buffer16x9 = await ensure16x9(buffer);
      console.log(`Processed 16:9 image for slot ${slotKey}, size: ${buffer16x9.length} bytes`);
      const relativePath = saveProjectImage(projectId, slotKey, buffer16x9);
      console.log(`Saved image for slot ${slotKey} to: ${relativePath}`);
      updateProjectImage(projectId, slotKey, { image_path: relativePath });
      console.log(`Updated database for slot ${slotKey}`);

      return NextResponse.json({ slot: slotKey, image_path: relativePath });
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
            : error.message || "Failed to generate image",
      },
      { status: 500 }
    );
  }
}
