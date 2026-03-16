import { NextRequest, NextResponse } from "next/server";
import { getProject, getProjectData, updateProjectData } from "@/lib/db/projects";
import { callClaude } from "@/lib/claude/client";
import { PROMPT_SPOTIFY_DESCRIPTION } from "@/lib/prompts/spotify-description";

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

    let prompt = `${PROMPT_SPOTIFY_DESCRIPTION}\n\nResearch:\n${projectData.research_text}`;

    const project = getProject(projectId);
    if (project?.title) {
      prompt += `\n\nEpisode title (use for alignment; do not repeat): ${project.title}`;
    }

    if (projectData.script_90min) {
      prompt += `\n\nScript (for key moments and tone):\n${projectData.script_90min.slice(0, 8000)}`;
    }

    const response = await callClaude(prompt, {
      maxTokens: 512,
      temperature: 0.7,
    });

    const spotify_description = response.trim();

    updateProjectData(projectId, { spotify_description });

    return NextResponse.json({ spotify_description });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Error generating Spotify description:", error);
    return NextResponse.json(
      {
        error:
          err?.message?.includes("ANTHROPIC_API_KEY") ||
          err?.message?.includes("api key")
            ? "Claude API key not configured. Please set ANTHROPIC_API_KEY in your .env file."
            : "Failed to generate Spotify description. Please try again.",
      },
      { status: 500 }
    );
  }
}
