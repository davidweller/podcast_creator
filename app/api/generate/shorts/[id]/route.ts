import { NextRequest, NextResponse } from "next/server";
import { getProjectData, getProject } from "@/lib/db/projects";
import { updateProjectData, updateProjectStatus } from "@/lib/db/projects";
import { callClaude } from "@/lib/claude/client";
import { PROMPT_SHORTS } from "@/lib/prompts/shorts";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);
    const project = getProject(projectId);
    const projectData = getProjectData(projectId);

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (!projectData || !projectData.research_text) {
      return NextResponse.json(
        { error: "Research text not found. Please add research first." },
        { status: 400 }
      );
    }

    // Extract compelling details from research (first few sentences)
    const researchLines = projectData.research_text.split("\n").filter(Boolean);
    const compellingDetails = researchLines.slice(0, 3).join(" ");

    const prompt = `${PROMPT_SHORTS}\n\nTitle: ${project.title}\n\nCompelling details:\n${compellingDetails}`;

    const shorts = await callClaude(prompt, {
      maxTokens: 512,
      temperature: 0.7,
    });

    updateProjectData(projectId, { shorts });
    updateProjectStatus(projectId, {
      shorts_generated: true,
      shorts_generated_at: new Date().toISOString(),
    });

    return NextResponse.json({ shorts });
  } catch (error: any) {
    console.error("Error generating shorts:", error);
    return NextResponse.json(
      {
        error:
          error.message?.includes("ANTHROPIC_API_KEY") ||
          error.message?.includes("api key")
            ? "Claude API key not configured. Please set ANTHROPIC_API_KEY in your .env file."
            : "Failed to generate shorts script. Please try again.",
      },
      { status: 500 }
    );
  }
}
