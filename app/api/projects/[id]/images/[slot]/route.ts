import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/db/projects";
import { readProjectImage } from "@/lib/images/storage";

const VALID_SLOTS = new Set(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "thumbnail"]);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; slot: string }> }
) {
  try {
    const { id, slot } = await params;
    const projectId = parseInt(id);
    if (!VALID_SLOTS.has(slot)) {
      return NextResponse.json({ error: "Invalid slot" }, { status: 400 });
    }
    const project = getProject(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const buffer = readProjectImage(projectId, slot);
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
