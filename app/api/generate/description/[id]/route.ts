import { NextRequest, NextResponse } from "next/server";
import { getProjectData } from "@/lib/db/projects";
import { updateProjectData, updateProjectStatus } from "@/lib/db/projects";
import { callClaude } from "@/lib/claude/client";
import { PROMPT_DESCRIPTION } from "@/lib/prompts/description";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);
    const projectData = getProjectData(projectId);

    if (!projectData || !projectData.research_text) {
      return NextResponse.json(
        { error: "Research text not found. Please add research first." },
        { status: 400 }
      );
    }

    let prompt = `${PROMPT_DESCRIPTION}\n\nResearch:\n${projectData.research_text}`;

    // Add script if available for timestamps
    if (projectData.script_30min || projectData.script_90min) {
      const script = projectData.script_30min || projectData.script_90min;
      prompt += `\n\nScript (for timestamps):\n${script}`;
    }

    const description = await callClaude(prompt, {
      maxTokens: 2048,
      temperature: 0.7,
    });

    updateProjectData(projectId, { description });
    updateProjectStatus(projectId, { description_generated: true });

    return NextResponse.json({ description });
  } catch (error: any) {
    console.error("Error generating description:", error);
    return NextResponse.json(
      {
        error:
          error.message?.includes("ANTHROPIC_API_KEY") ||
          error.message?.includes("api key")
            ? "Claude API key not configured. Please set ANTHROPIC_API_KEY in your .env file."
            : "Failed to generate description. Please try again.",
      },
      { status: 500 }
    );
  }
}
