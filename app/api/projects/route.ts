import { NextRequest, NextResponse } from "next/server";
import { createProject, getAllProjects } from "@/lib/db/projects";

export async function GET() {
  try {
    const projects = getAllProjects();
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, era_location } = body;

    if (!title || !era_location) {
      return NextResponse.json(
        { error: "Title and era_location are required" },
        { status: 400 }
      );
    }

    const projectId = createProject(title, era_location);
    return NextResponse.json({ id: projectId }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
