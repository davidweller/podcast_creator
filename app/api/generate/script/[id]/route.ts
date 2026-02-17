import { NextRequest, NextResponse } from "next/server";
import { getProjectData } from "@/lib/db/projects";
import { updateProjectData, updateProjectStatus } from "@/lib/db/projects";
import { generateScript30Min, generateScript90Min } from "@/lib/generation/generator";
import { validateResearch } from "@/lib/validation/research";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);
    const body = await request.json();
    const { type } = body;

    if (type !== "30min" && type !== "90min") {
      return NextResponse.json(
        { error: "Invalid script type. Must be '30min' or '90min'" },
        { status: 400 }
      );
    }

    // Get research text
    const projectData = getProjectData(projectId);
    if (!projectData || !projectData.research_text) {
      return NextResponse.json(
        { error: "Research text not found. Please add research first." },
        { status: 400 }
      );
    }

    // Validate research
    const researchValidation = validateResearch(projectData.research_text);
    if (!researchValidation.isValid) {
      return NextResponse.json(
        {
          error: "Research validation failed",
          warnings: researchValidation.warnings,
        },
        { status: 400 }
      );
    }

    // Generate script
    let result;
    if (type === "30min") {
      result = await generateScript30Min(projectData.research_text);
      updateProjectData(projectId, { script_30min: result.script });
      updateProjectStatus(projectId, { script_30min_generated: true });
    } else {
      result = await generateScript90Min(projectData.research_text);
      updateProjectData(projectId, { script_90min: result.script });
      updateProjectStatus(projectId, { script_90min_generated: true });
    }

    return NextResponse.json({
      script: result.script,
      attempts: result.attempts,
      violations: result.violations,
    });
  } catch (error: any) {
    console.error("Error generating script:", error);
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    
    // Provide more specific error messages
    let errorMessage = "Failed to generate script. Please try again.";
    let statusCode = 500;
    
    if (error?.message?.includes("ANTHROPIC_API_KEY") || error?.message?.includes("api key") || error?.message?.includes("Invalid API key")) {
      errorMessage = error.message || "Claude API key not configured or invalid. Please check your ANTHROPIC_API_KEY in the .env file and restart your server.";
    } else if (error?.message?.includes("authentication_error") || error?.message?.includes("invalid x-api-key")) {
      errorMessage = "Invalid API key. Please verify your ANTHROPIC_API_KEY in the .env file is correct and restart your server.";
    } else if (error?.message?.includes("overloaded") || error?.message?.includes("Overloaded") || error?.error?.type === "overloaded_error") {
      errorMessage = error.message || "Claude API is currently overloaded. Please wait a moment and try again. The service is experiencing high demand.";
      statusCode = 503; // Service Unavailable
    } else if (error?.message) {
      errorMessage = `Error: ${error.message}`;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
