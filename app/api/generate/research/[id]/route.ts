import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";
import { updateProjectData } from "@/lib/db/projects";
import { completeLlmText } from "@/lib/llm/unified";
import { parseLlmCompletionOptions } from "@/lib/llm/parse-selection";

const RESEARCH_PROMPT_PATH = path.join(
  process.cwd(),
  "lib",
  "prompts",
  "Research_Prompt.md"
);

const MAX_TOPIC_LENGTH = 500;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);
    const body = await request.json();

    const topic = typeof body.topic === "string" ? body.topic.trim() : "";
    if (!topic) {
      return NextResponse.json(
        { error: "Topic is required. Please enter a research topic." },
        { status: 400 }
      );
    }
    if (topic.length > MAX_TOPIC_LENGTH) {
      return NextResponse.json(
        { error: `Topic must be ${MAX_TOPIC_LENGTH} characters or less.` },
        { status: 400 }
      );
    }

    const template = readFileSync(RESEARCH_PROMPT_PATH, "utf-8");
    const systemPrompt = template.replace("[Topic]", topic);
    const userMessage =
      "Produce the full research packet for the episode topic in the system prompt. Follow the Output Format: use clearly labeled sections matching the structure given (sections 1–8). Be specific and ground claims in reputable sources.";

    const { llmModelId, useThinking, thinkingBudget } =
      parseLlmCompletionOptions(body, "research");

    const research = await completeLlmText("research", userMessage, {
      system: systemPrompt,
      modelId: llmModelId,
      maxTokens: 16384,
      temperature: 0.4,
      projectId,
      useThinking,
      thinkingBudget,
    });

    updateProjectData(projectId, { research_text: research });

    return NextResponse.json({ research });
  } catch (error: any) {
    console.error("Error generating research:", error);
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });

    let errorMessage = "Failed to generate research. Please try again.";
    let statusCode = 500;

    if (
      error?.message?.includes("ANTHROPIC_API_KEY") ||
      error?.message?.includes("OPENROUTER_API_KEY") ||
      error?.message?.includes("api key") ||
      error?.message?.includes("Invalid API key") ||
      error?.message?.includes("not configured")
    ) {
      errorMessage =
        error.message ||
        "Claude API key not configured or invalid. Please check your ANTHROPIC_API_KEY in the .env file and restart your server.";
    } else if (
      error?.message?.includes("authentication_error") ||
      error?.message?.includes("invalid x-api-key")
    ) {
      errorMessage =
        "Invalid API key. Please verify your ANTHROPIC_API_KEY in the .env file is correct and restart your server.";
    } else if (
      error?.message?.includes("overloaded") ||
      error?.message?.includes("Overloaded") ||
      error?.error?.type === "overloaded_error"
    ) {
      errorMessage =
        error.message ||
        "Claude API is currently overloaded. Please wait a moment and try again. The service is experiencing high demand.";
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
