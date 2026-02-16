import { NextRequest, NextResponse } from "next/server";
import { duplicateProject } from "@/lib/db/projects";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const newId = duplicateProject(id);
    return NextResponse.json({ id: newId }, { status: 201 });
  } catch (error) {
    console.error("Error duplicating project:", error);
    return NextResponse.json(
      { error: "Failed to duplicate project" },
      { status: 500 }
    );
  }
}
