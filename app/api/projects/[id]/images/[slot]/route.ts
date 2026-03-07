import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/db/projects";
import { readProjectImage } from "@/lib/images/storage";
import { IMAGE_SLOTS, type ImageSlot } from "@/types/database";

const VALID_SLOTS = new Set<ImageSlot>(IMAGE_SLOTS);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; slot: string }> }
) {
  try {
    const { id, slot } = await params;
    const projectId = parseInt(id);
    if (!VALID_SLOTS.has(slot as ImageSlot)) {
      return NextResponse.json({ error: "Invalid slot" }, { status: 400 });
    }
    const slotKey = slot as ImageSlot;
    const project = getProject(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const buffer = readProjectImage(projectId, slotKey);
    if (!buffer) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error serving project image:", error);
    return NextResponse.json(
      { error: "Failed to serve image" },
      { status: 500 }
    );
  }
}
