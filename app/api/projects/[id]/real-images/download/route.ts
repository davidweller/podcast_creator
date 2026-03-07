import { NextResponse } from "next/server";
import { getFlaggedRealImages, updateRealImage, getRealImageById } from "@/lib/db/real-images";
import { getProject } from "@/lib/db/projects";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import path from "path";

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-z0-9\-_]/gi, "_")
    .replace(/_+/g, "_")
    .slice(0, 100);
}

async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "CozyCrime/1.0 (Historical Research Tool)",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function getImageExtension(url: string, contentType?: string): string {
  if (contentType?.includes("jpeg") || contentType?.includes("jpg")) return ".jpg";
  if (contentType?.includes("png")) return ".png";
  if (contentType?.includes("gif")) return ".gif";
  if (contentType?.includes("webp")) return ".webp";

  const urlLower = url.toLowerCase();
  if (urlLower.includes(".jpg") || urlLower.includes(".jpeg")) return ".jpg";
  if (urlLower.includes(".png")) return ".png";
  if (urlLower.includes(".gif")) return ".gif";
  if (urlLower.includes(".webp")) return ".webp";

  return ".jpg";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id, 10);
    if (isNaN(projectId)) {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    const project = getProject(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const { image_id } = body;

    const imagesToDownload = image_id
      ? [getRealImageById(image_id)].filter(Boolean)
      : getFlaggedRealImages(projectId).filter((img) => !img.downloaded);

    if (imagesToDownload.length === 0) {
      return NextResponse.json({
        success: true,
        downloaded: 0,
        message: "No images to download",
      });
    }

    const projectDir = path.join(process.cwd(), "public", "real-images", String(projectId));
    if (!existsSync(projectDir)) {
      mkdirSync(projectDir, { recursive: true });
    }

    let downloaded = 0;
    const errors: { id: number; error: string }[] = [];

    for (const image of imagesToDownload) {
      if (!image) continue;

      try {
        const buffer = await downloadImage(image.full_url);
        const ext = getImageExtension(image.full_url);
        const filename = `${image.source}_${sanitizeFilename(image.source_id)}${ext}`;
        const filePath = path.join(projectDir, filename);
        const relativePath = `/real-images/${projectId}/${filename}`;

        writeFileSync(filePath, buffer);

        updateRealImage(image.id, {
          downloaded: true,
          local_path: relativePath,
        });

        downloaded++;
      } catch (err: any) {
        console.error(`Failed to download image ${image.id}:`, err);
        errors.push({ id: image.id, error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      downloaded,
      total: imagesToDownload.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Failed to download real images:", error);
    return NextResponse.json(
      { error: error.message || "Failed to download real images" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id, 10);
    if (isNaN(projectId)) {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    const url = new URL(request.url);
    const imageId = url.searchParams.get("image_id");

    if (!imageId) {
      return NextResponse.json({ error: "image_id is required" }, { status: 400 });
    }

    const image = getRealImageById(parseInt(imageId, 10));
    if (!image || image.project_id !== projectId) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    if (image.local_path && existsSync(path.join(process.cwd(), "public", image.local_path))) {
      return NextResponse.json({ local_path: image.local_path });
    }

    const buffer = await downloadImage(image.full_url);
    const ext = getImageExtension(image.full_url);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": `image/${ext.slice(1)}`,
        "Content-Disposition": `attachment; filename="${image.source}_${image.source_id}${ext}"`,
      },
    });
  } catch (error: any) {
    console.error("Failed to get real image:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get real image" },
      { status: 500 }
    );
  }
}
