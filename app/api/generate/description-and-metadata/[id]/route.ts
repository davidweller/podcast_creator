import { NextRequest, NextResponse } from "next/server";
import { getProjectData, updateProjectData, updateProjectStatus } from "@/lib/db/projects";
import { completeLlmText } from "@/lib/llm/unified";
import { parseLlmCompletionOptions } from "@/lib/llm/parse-selection";
import {
  PROMPT_DESCRIPTION_AND_METADATA,
  DESCRIPTION_METADATA_DELIMITERS,
} from "@/lib/prompts/description-and-metadata";

function splitDescriptionAndTags(response: string): { description: string; metadata: string } {
  for (const delimiter of DESCRIPTION_METADATA_DELIMITERS) {
    const idx = response.indexOf(delimiter);
    if (idx >= 0) {
      return {
        description: response.slice(0, idx).trim(),
        metadata: response.slice(idx + delimiter.length).trim(),
      };
    }
  }
  return { description: response.trim(), metadata: "" };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);
    const body = await request.json().catch(() => ({}));
    const projectData = getProjectData(projectId);

    if (!projectData || !projectData.research_text) {
      return NextResponse.json(
        { error: "Research text not found. Please add research first." },
        { status: 400 }
      );
    }

    let prompt = `${PROMPT_DESCRIPTION_AND_METADATA}\n\nResearch:\n${projectData.research_text}`;

    if (projectData.script_90min) {
      prompt += `\n\nScript (for tone and detail):\n${projectData.script_90min}`;
    }

    const { llmModelId, useThinking, thinkingBudget } =
      parseLlmCompletionOptions(body, "social");

    const response = await completeLlmText("social", prompt, {
      modelId: llmModelId,
      maxTokens: 4096,
      temperature: 0.7,
      projectId,
      useThinking,
      thinkingBudget,
    });

    const { description, metadata } = splitDescriptionAndTags(response);

    updateProjectData(projectId, {
      description,
      metadata_json: metadata || null,
    });
    updateProjectStatus(projectId, {
      description_generated: true,
      metadata_generated: true,
    });

    return NextResponse.json({ description, metadata });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Error generating description and metadata:", error);
    return NextResponse.json(
      {
        error:
          err?.message?.includes("ANTHROPIC_API_KEY") ||
          err?.message?.includes("api key")
            ? "Claude API key not configured. Please set ANTHROPIC_API_KEY in your .env file."
            : "Failed to generate description and metadata. Please try again.",
      },
      { status: 500 }
    );
  }
}
