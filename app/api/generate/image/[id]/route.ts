import { NextRequest, NextResponse } from "next/server";
import { getProjectImage, updateProjectImage } from "@/lib/db/project-images";
import { generateImage } from "@/lib/gemini/client";
import { saveProjectImage } from "@/lib/images/storage";

const VALID_SLOTS = new Set(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "thumbnail"]);

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

    if (!slot || !VALID_SLOTS.has(slot)) {
      return NextResponse.json(
        { error: "Invalid or missing slot. Use 1-20 or 'thumbnail'." },
        { status: 400 }
      );
    }

    const row = getProjectImage(projectId, slot);
    const prompt = promptOverride ?? row?.prompt ?? null;
    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: `No prompt for slot ${slot}. Generate prompts first.` },
        { status: 400 }
      );
    }

    const buffer = await generateImage(prompt);
    const relativePath = saveProjectImage(projectId, slot, buffer);
    updateProjectImage(projectId, slot, { image_path: relativePath });

    return NextResponse.json({ slot, image_path: relativePath });
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
