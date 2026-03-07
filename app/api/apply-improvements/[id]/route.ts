import { NextRequest, NextResponse } from "next/server";
import { getProjectData, updateProjectData } from "@/lib/db/projects";
import { applyImprovements } from "@/lib/generation/improvement";
import type { ImprovementSuggestion } from "@/types/improvements";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);
    const body = await request.json();
    const { suggestions } = body;

    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      return NextResponse.json(
        { error: "Suggestions array is required and must not be empty" },
        { status: 400 }
      );
    }

    // Get current script
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

    // Validate suggestions format
    const validSuggestions: ImprovementSuggestion[] = suggestions.map((s: any) => ({
      type: s.type || "copyedit",
      description: s.description || "",
      location: s.location,
      suggestion: s.suggestion,
      original: s.original,
      improved: s.improved,
    }));

    // Apply improvements
    const improvedScript = await applyImprovements(script, validSuggestions, "90min");

    // Update project data
    updateProjectData(projectId, { script_90min: improvedScript });

    return NextResponse.json({ script: improvedScript });
  } catch (error: any) {
    console.error("Error applying improvements:", error);
    return NextResponse.json(
      {
        error:
          error.message?.includes("ANTHROPIC_API_KEY") ||
          error.message?.includes("api key")
            ? "Claude API key not configured. Please set ANTHROPIC_API_KEY in your .env file."
            : error.message || "Failed to apply improvements. Please try again.",
      },
      { status: 500 }
    );
  }
}
