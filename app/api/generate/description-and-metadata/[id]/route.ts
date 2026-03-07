import { NextRequest, NextResponse } from "next/server";
import { getProjectData, updateProjectData, updateProjectStatus } from "@/lib/db/projects";
import { callClaude } from "@/lib/claude/client";
import {
  PROMPT_DESCRIPTION_AND_METADATA,
  DESCRIPTION_METADATA_DELIMITER,
} from "@/lib/prompts/description-and-metadata";

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

    let prompt = `${PROMPT_DESCRIPTION_AND_METADATA}\n\nResearch:\n${projectData.research_text}`;

    if (projectData.script_90min) {
      prompt += `\n\nScript (for timestamps):\n${projectData.script_90min}`;
    }

    const response = await callClaude(prompt, {
      maxTokens: 4096,
      temperature: 0.7,
    });

    const delimiter = DESCRIPTION_METADATA_DELIMITER;
    const delimiterIndex = response.indexOf(delimiter);

    let description: string;
    let metadata: string;

    if (delimiterIndex >= 0) {
      description = response.slice(0, delimiterIndex).trim();
      metadata = response.slice(delimiterIndex + delimiter.length).trim();
    } else {
      // Fallback: treat whole response as description if delimiter missing
      description = response.trim();
      metadata = "";
    }

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
