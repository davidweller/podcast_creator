import { NextResponse } from "next/server";
import {
  getRealImages,
  getFlaggedRealImages,
  addRealImage,
  updateRealImage,
  deleteRealImage,
  toggleRealImageFlag,
  getRealImageById,
} from "@/lib/db/real-images";
import { extractKeywordsFromScript } from "@/lib/archival";
import { getProjectData, getProject } from "@/lib/db/projects";
import type { ArchivalSource, ImageSlot } from "@/types/database";

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
    const flaggedOnly = url.searchParams.get("flagged") === "true";
    const includeKeywords = url.searchParams.get("keywords") === "true";

    const images = flaggedOnly
      ? getFlaggedRealImages(projectId)
      : getRealImages(projectId);

    let keywords: string[] = [];
    if (includeKeywords) {
      const project = getProject(projectId);
      const data = getProjectData(projectId);
      if (project && data?.script_90min) {
        keywords = await extractKeywordsFromScript(
          data.script_90min,
          project.title,
          project.era_location
        );
      } else if (project) {
        keywords = [project.title, project.era_location];
      }
    }

    return NextResponse.json({
      images,
      keywords: includeKeywords ? keywords : undefined,
    });
  } catch (error: any) {
    console.error("Failed to get real images:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get real images" },
      { status: 500 }
    );
  }
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

    const body = await request.json();
    const { source, source_id, title, thumbnail_url, full_url, rights_info, attribution, metadata_json } = body;

    if (!source || !source_id || !thumbnail_url || !full_url) {
      return NextResponse.json(
        { error: "Missing required fields: source, source_id, thumbnail_url, full_url" },
        { status: 400 }
      );
    }

    const image = addRealImage({
      project_id: projectId,
      source: source as ArchivalSource,
      source_id,
      title: title || null,
      thumbnail_url,
      full_url,
      rights_info: rights_info || null,
      attribution: attribution || null,
      metadata_json: metadata_json ? JSON.stringify(metadata_json) : null,
    });

    return NextResponse.json(image);
  } catch (error: any) {
    console.error("Failed to add real image:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add real image" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id, 10);
    if (isNaN(projectId)) {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    const body = await request.json();
    const { image_id, action, scene_slot, flagged } = body;

    if (!image_id) {
      return NextResponse.json({ error: "image_id is required" }, { status: 400 });
    }

    const image = getRealImageById(image_id);
    if (!image || image.project_id !== projectId) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    if (action === "toggle_flag") {
      const updated = toggleRealImageFlag(image_id);
      return NextResponse.json(updated);
    }

    const updates: { flagged?: boolean; scene_slot?: ImageSlot | null } = {};
    if (flagged !== undefined) updates.flagged = flagged;
    if (scene_slot !== undefined) updates.scene_slot = scene_slot as ImageSlot | null;

    updateRealImage(image_id, updates);
    const updated = getRealImageById(image_id);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Failed to update real image:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update real image" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    deleteRealImage(parseInt(imageId, 10));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete real image:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete real image" },
      { status: 500 }
    );
  }
}
