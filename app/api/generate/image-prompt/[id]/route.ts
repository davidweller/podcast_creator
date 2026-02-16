import { NextRequest, NextResponse } from "next/server";
import { getProjectData } from "@/lib/db/projects";
import { updateProjectData, updateProjectStatus } from "@/lib/db/projects";
import { callClaude } from "@/lib/claude/client";
import { PROMPT_IMAGE_PROMPT } from "@/lib/prompts/image-prompt";

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

    const prompt = `${PROMPT_IMAGE_PROMPT}\n\nResearch:\n${projectData.research_text}`;

    const imagePrompt = await callClaude(prompt, {
      maxTokens: 1024,
      temperature: 0.7,
    });

    updateProjectData(projectId, { image_prompt: imagePrompt });
    updateProjectStatus(projectId, { image_prompt_generated: true });

    return NextResponse.json({ imagePrompt });
  } catch (error: any) {
    console.error("Error generating image prompt:", error);
    return NextResponse.json(
      {
        error:
          error.message?.includes("ANTHROPIC_API_KEY") ||
          error.message?.includes("api key")
            ? "Claude API key not configured. Please set ANTHROPIC_API_KEY in your .env file."
            : "Failed to generate image prompt. Please try again.",
      },
      { status: 500 }
    );
  }
}
