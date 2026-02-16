import { NextRequest, NextResponse } from "next/server";
import { getProjectData } from "@/lib/db/projects";
import { updateProjectData, updateProjectStatus } from "@/lib/db/projects";
import { callClaude } from "@/lib/claude/client";
import { PROMPT_METADATA } from "@/lib/prompts/metadata";

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

    const prompt = `${PROMPT_METADATA}\n\nResearch:\n${projectData.research_text}`;

    const metadata = await callClaude(prompt, {
      maxTokens: 2048,
      temperature: 0.7,
    });

    // Store as JSON string
    updateProjectData(projectId, { metadata_json: metadata });
    updateProjectStatus(projectId, { metadata_generated: true });

    return NextResponse.json({ metadata });
  } catch (error: any) {
    console.error("Error generating metadata:", error);
    return NextResponse.json(
      {
        error:
          error.message?.includes("ANTHROPIC_API_KEY") ||
          error.message?.includes("api key")
            ? "Claude API key not configured. Please set ANTHROPIC_API_KEY in your .env file."
            : "Failed to generate metadata. Please try again.",
      },
      { status: 500 }
    );
  }
}
