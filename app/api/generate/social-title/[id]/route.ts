import { NextRequest, NextResponse } from "next/server";
import { getProject, getProjectData, updateProjectData } from "@/lib/db/projects";
import { completeLlmText } from "@/lib/llm/unified";
import { parseLlmCompletionOptions } from "@/lib/llm/parse-selection";
import { PROMPT_SOCIAL_EPISODE_TITLE } from "@/lib/prompts/social-episode-title";
import {
  normalizeCanonicalEpisodeTitle,
  formatEpisodeTitleFromProject,
  parseTitlesJson,
  serializeTitlesJson,
} from "@/lib/social/episode-title";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);
    const body = await request.json().catch(() => ({}));
    const project = getProject(projectId);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const projectData = getProjectData(projectId);
    const episodeNumber = project.id;
    const episodeLabel = String(episodeNumber).padStart(3, "0");

    if (!projectData?.research_text?.trim()) {
      const fallback = formatEpisodeTitleFromProject(
        episodeNumber,
        project.title,
        project.era_location
      );
      const titles = { ...parseTitlesJson(projectData?.titles_json), canonical: fallback };
      updateProjectData(projectId, { titles_json: serializeTitlesJson(titles) });
      return NextResponse.json({
        title: fallback,
        warning:
          "No research text found. Title assembled from project title and era/location only — add research for a richer generated title.",
      });
    }

    let prompt = `${PROMPT_SOCIAL_EPISODE_TITLE}

Episode number (use exactly as NNN): ${episodeLabel}

Era and location (use for the third segment unless research suggests a better primary place): ${project.era_location}

Working project title (may inform the middle segment; refine into canonical form): ${project.title}

Research:
${projectData.research_text}`;

    if (projectData.script_90min) {
      prompt += `\n\nScript excerpt (for names, dates, and key facts only):\n${projectData.script_90min.slice(0, 6000)}`;
    }

    const { llmModelId, useThinking, thinkingBudget } =
      parseLlmCompletionOptions(body, "social");

    const response = await completeLlmText("social", prompt, {
      modelId: llmModelId,
      maxTokens: 256,
      temperature: 0.5,
      projectId,
      useThinking,
      thinkingBudget,
    });

    const title = normalizeCanonicalEpisodeTitle(response, episodeNumber);
    const titles = { ...parseTitlesJson(projectData.titles_json), canonical: title };
    updateProjectData(projectId, { titles_json: serializeTitlesJson(titles) });

    return NextResponse.json({ title });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Error generating social title:", error);
    return NextResponse.json(
      {
        error:
          err?.message?.includes("ANTHROPIC_API_KEY") ||
          err?.message?.includes("api key")
            ? "Claude API key not configured. Please set ANTHROPIC_API_KEY in your .env file."
            : "Failed to generate title. Please try again.",
      },
      { status: 500 }
    );
  }
}
