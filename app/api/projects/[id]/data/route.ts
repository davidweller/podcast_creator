import { NextRequest, NextResponse } from "next/server";
import { getProjectData, updateProjectData } from "@/lib/db/projects";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);
    const data = getProjectData(projectId);

    if (!data) {
      return NextResponse.json(
        { error: "Project data not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching project data:", error);
    return NextResponse.json(
      { error: "Failed to fetch project data" },
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
    const body = await request.json();

    updateProjectData(projectId, body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating project data:", error);
    return NextResponse.json(
      { error: "Failed to update project data" },
      { status: 500 }
    );
  }
}
