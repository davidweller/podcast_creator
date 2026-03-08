import { NextRequest, NextResponse } from "next/server";
import { getProjectData, updateProjectData } from "@/lib/db/projects";
import { applySingleImprovement } from "@/lib/generation/improvement";
import type { ImprovementSuggestion } from "@/types/improvements";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);
    const body = await request.json();
    const { suggestion, type } = body;

    if (!suggestion || !suggestion.description) {
      return NextResponse.json(
        { error: "A valid suggestion is required" },
        { status: 400 }
      );
    }

    const projectData = getProjectData(projectId);
    if (!projectData) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const scriptField = type === "90min" ? "script_90min" : "script_90min";
    const script = projectData[scriptField];

    if (!script) {
      return NextResponse.json(
        { error: "No script found. Please generate a script first." },
        { status: 400 }
      );
    }

    const validSuggestion: ImprovementSuggestion = {
      type: suggestion.type || "copyedit",
      description: suggestion.description || "",
      location: suggestion.location,
      suggestion: suggestion.suggestion,
      original: suggestion.original,
      improved: suggestion.improved,
    };

    console.log(`[Apply Improvement] Starting: ${validSuggestion.type} - ${validSuggestion.description.substring(0, 50)}...`);
    const startTime = Date.now();
    
    const improvedScript = await applySingleImprovement(script, validSuggestion);
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[Apply Improvement] Completed in ${elapsed}s`);

    updateProjectData(projectId, { [scriptField]: improvedScript });

    return NextResponse.json({ script: improvedScript });
  } catch (error: any) {
    console.error("Error applying single improvement:", error);
    return NextResponse.json(
      {
        error:
          error.message?.includes("ANTHROPIC_API_KEY") ||
          error.message?.includes("api key")
            ? "Claude API key not configured. Please set ANTHROPIC_API_KEY in your .env file."
            : error.message || "Failed to apply improvement. Please try again.",
      },
      { status: 500 }
    );
  }
}
