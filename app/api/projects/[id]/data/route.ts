import { NextRequest, NextResponse } from "next/server";
import { getProject, getProjectData, getProjectStatus, updateProjectData, updateProjectStatus } from "@/lib/db/projects";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);
    const data = getProjectData(projectId);
    const status = getProjectStatus(projectId);
    const project = getProject(projectId);

    if (!data) {
      return NextResponse.json(
        { error: "Project data not found" },
        { status: 404 }
      );
    }

    // Backfill generation timestamps for existing content (best effort).
    if (project?.updated_at && status) {
      if (status.script_90min_generated && !status.script_90min_generated_at && data.script_90min) {
        updateProjectStatus(projectId, { script_90min_generated_at: project.updated_at });
        (status as any).script_90min_generated_at = project.updated_at;
      }
      if (status.shorts_generated && !status.shorts_generated_at && data.shorts) {
        updateProjectStatus(projectId, { shorts_generated_at: project.updated_at });
        (status as any).shorts_generated_at = project.updated_at;
      }
    }

    return NextResponse.json({ ...data, status });
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
