import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/db/projects";
import { getProjectImages, updateProjectImage } from "@/lib/db/project-images";

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
    return NextResponse.json(images);
  } catch (error) {
    console.error("Error fetching project images:", error);
    return NextResponse.json(
      { error: "Failed to fetch project images" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const body = await request.json();
    const { slot, prompt, thumbnail_title } = body;
    if (slot == null || typeof slot !== "string") {
      return NextResponse.json({ error: "Missing or invalid slot" }, { status: 400 });
    }
    updateProjectImage(projectId, slot, { prompt, thumbnail_title });
    const images = getProjectImages(projectId);
    return NextResponse.json(images);
  } catch (error) {
    console.error("Error updating project image:", error);
    return NextResponse.json(
      { error: "Failed to update project image" },
      { status: 500 }
    );
  }
}
