import { NextRequest, NextResponse } from "next/server";
import { getProjectData } from "@/lib/db/projects";
import { updateProjectData, updateProjectStatus } from "@/lib/db/projects";
import { generateScript90Min } from "@/lib/generation/generator-90min";
import { parseScriptLlmSelection } from "@/lib/llm/parse-selection";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);
    const body = await request.json().catch(() => ({}));

    const { llmModelId, useThinking, thinkingBudget } =
      parseScriptLlmSelection(body);

    // Get research text
    const projectData = getProjectData(projectId);
    if (!projectData || !projectData.research_text) {
      return NextResponse.json(
        { error: "Research text not found. Please add research first." },
        { status: 400 }
      );
    }

    // Generate 90-minute script
    const result = await generateScript90Min(projectData.research_text, {
      llmModelId,
      useThinking,
      thinkingBudget,
      projectId,
    });
    updateProjectData(projectId, { script_90min: result.script });
    updateProjectStatus(projectId, {
      script_90min_generated: true,
      script_90min_generated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      script: result.script,
      attempts: result.attempts,
    });
  } catch (error: any) {
    console.error("Error generating script:", error);
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    
    let errorMessage = "Failed to generate script. Please try again.";
    let statusCode = 500;
    
    if (error?.message?.includes("ANTHROPIC_API_KEY") || error?.message?.includes("OPENROUTER_API_KEY") || error?.message?.includes("api key") || error?.message?.includes("Invalid API key") || error?.message?.includes("not configured")) {
      errorMessage = error.message || "API key not configured or invalid. Check Settings or your .env file.";
    } else if (error?.message?.includes("authentication_error") || error?.message?.includes("invalid x-api-key")) {
      errorMessage = "Invalid API key. Please verify your ANTHROPIC_API_KEY in the .env file is correct and restart your server.";
    } else if (error?.message?.includes("overloaded") || error?.message?.includes("Overloaded") || error?.error?.type === "overloaded_error") {
      errorMessage = error.message || "Claude API is currently overloaded. Please wait a moment and try again. The service is experiencing high demand.";
      statusCode = 503;
    } else if (error?.message) {
      errorMessage = `Error: ${error.message}`;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
