import { NextRequest, NextResponse } from "next/server";
import { getProjectData } from "@/lib/db/projects";
import { analyzeScript } from "@/lib/generation/improvement";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);

    // Get script text
    const projectData = getProjectData(projectId);
    if (!projectData) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const script = projectData.script_90min;

    if (!script) {
      return NextResponse.json(
        { error: "No script found. Please generate a script first." },
        { status: 400 }
      );
    }

    // Analyze script for improvements
    const analysis = await analyzeScript(script, "90min");

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error("Error analyzing script:", error);
    return NextResponse.json(
      {
        error:
          error.message?.includes("ANTHROPIC_API_KEY") ||
          error.message?.includes("api key")
            ? "Claude API key not configured. Please set ANTHROPIC_API_KEY in your .env file."
            : "Failed to analyze script. Please try again.",
      },
      { status: 500 }
    );
  }
}
