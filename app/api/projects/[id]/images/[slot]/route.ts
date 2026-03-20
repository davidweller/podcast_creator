import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/db/projects";
import { getProjectImagesDir } from "@/lib/images/storage";
import { IMAGE_SLOTS, type ImageSlot } from "@/types/database";
import path from "path";
import { existsSync, readFileSync, statSync } from "fs";

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

    const dir = getProjectImagesDir(projectId);
    const filename = slotKey === "thumbnail" ? "thumbnail.png" : `${slotKey}.png`;
    const filePath = path.join(dir, filename);
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const stat = statSync(filePath);
    const etag = `W/"${stat.size}-${stat.mtimeMs}"`;
    const ifNoneMatch = request.headers.get("if-none-match");
    if (ifNoneMatch && ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: etag,
          "Cache-Control": "private, max-age=0, must-revalidate",
        },
      });
    }

    const buffer = readFileSync(filePath);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/png",
        ETag: etag,
        "Cache-Control": "private, max-age=0, must-revalidate",
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
