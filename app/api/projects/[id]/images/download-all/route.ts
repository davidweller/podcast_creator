import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/db/projects";
import { getProjectImages } from "@/lib/db/project-images";
import { readProjectImage } from "@/lib/images/storage";
import JSZip from "jszip";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);
    const project = getProject(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const images = getProjectImages(projectId);
    const withImages = images.filter((i) => i.image_path);

    if (withImages.length === 0) {
      return NextResponse.json(
        { error: "No images to download. Generate images first." },
        { status: 400 }
      );
    }

    const zip = new JSZip();
    const safeTitle = project.title.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 50) || "project";

    for (const img of withImages) {
      const buffer = readProjectImage(projectId, img.slot);
      if (buffer) {
        const name = img.slot === "thumbnail" ? "thumbnail.png" : `image-${img.slot}.png`;
        zip.file(name, buffer);
      }
    }

    const buffer = await zip.generateAsync({ type: "nodebuffer" });
    const filename = `${safeTitle}-images.zip`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (error) {
    console.error("Error creating images zip:", error);
    return NextResponse.json(
      { error: "Failed to create download" },
      { status: 500 }
    );
  }
}
