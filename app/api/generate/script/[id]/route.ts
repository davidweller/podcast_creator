import { NextRequest, NextResponse } from "next/server";
import {
  getProject,
  getProjectData,
  updateProjectData,
  updateProjectStatus,
} from "@/lib/db/projects";
import { generateScript90Min } from "@/lib/generation/generator-90min";
import {
  generateScriptCarlin,
  type CarlinProgressEvent,
} from "@/lib/generation/generator-carlin";
import { parseScriptLlmSelection } from "@/lib/llm/parse-selection";
import { parseScriptPromptStyle } from "@/lib/prompts/script-styles";

function mapScriptGenerationError(error: unknown): {
  message: string;
  statusCode: number;
} {
  const errorObj = error as {
    message?: string;
    error?: { type?: string };
  };
  let errorMessage = "Failed to generate script. Please try again.";
  let statusCode = 500;

  const msg = errorObj?.message ?? "";

  if (
    msg.includes("ANTHROPIC_API_KEY") ||
    msg.includes("OPENROUTER_API_KEY") ||
    msg.includes("api key") ||
    msg.includes("Invalid API key") ||
    msg.includes("not configured")
  ) {
    errorMessage =
      typeof errorObj.message === "string"
        ? errorObj.message
        : "API key not configured or invalid. Check Settings or your .env file.";
  } else if (
    msg.includes("authentication_error") ||
    msg.includes("invalid x-api-key")
  ) {
    errorMessage =
      "Invalid API key. Please verify your ANTHROPIC_API_KEY in the .env file is correct and restart your server.";
  } else if (
    msg.includes("overloaded") ||
    msg.includes("Overloaded") ||
    errorObj?.error?.type === "overloaded_error"
  ) {
    errorMessage =
      typeof errorObj.message === "string"
        ? errorObj.message
        : "Claude API is currently overloaded. Please wait a moment and try again.";
    statusCode = 503;
  } else if (msg) {
    errorMessage = `Error: ${msg}`;
  }

  return { message: errorMessage, statusCode };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const projectId = parseInt(id, 10);
  const body = await request.json().catch(() => ({}));

  const { llmModelId, useThinking, thinkingBudget } =
    parseScriptLlmSelection(body);
  const promptStyle = parseScriptPromptStyle(body);

  const projectData = getProjectData(projectId);
  const project = getProject(projectId);
  if (!projectData || !projectData.research_text) {
    return NextResponse.json(
      { error: "Research text not found. Please add research first." },
      { status: 400 }
    );
  }

  if (promptStyle === "carlin") {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const push = (evt: CarlinProgressEvent | { type: "done"; script: string; attempts: number } | { type: "error"; message: string }) => {
          controller.enqueue(
            encoder.encode(`${JSON.stringify(evt)}\n`)
          );
        };

        try {
          const result = await generateScriptCarlin(
            projectData.research_text!,
            {
              llmModelId,
              useThinking,
              thinkingBudget,
              projectId,
              episodeTitle: project?.title,
            },
            (evt) => push(evt)
          );

          updateProjectData(projectId, { script_90min: result.script });
          updateProjectStatus(projectId, {
            script_90min_generated: true,
            script_90min_generated_at: new Date().toISOString(),
          });

          push({
            type: "done",
            script: result.script,
            attempts: result.attempts,
          });
        } catch (err) {
          const { message } = mapScriptGenerationError(err);
          console.error("Error generating script (Carlin stream):", err);
          push({ type: "error", message });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  }

  try {
    const result = await generateScript90Min(projectData.research_text, {
      llmModelId,
      useThinking,
      thinkingBudget,
      projectId,
      episodeTitle: project?.title,
    });
    updateProjectData(projectId, { script_90min: result.script });
    updateProjectStatus(projectId, {
      script_90min_generated: true,
      script_90min_generated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      script: result.script,
      attempts: result.attempts,
    });
  } catch (error: unknown) {
    console.error("Error generating script:", error);
    console.error("Error details:", {
      message: (error as { message?: string })?.message,
      stack: (error as { stack?: string })?.stack,
      name: (error as { name?: string })?.name,
    });

    const { message, statusCode } = mapScriptGenerationError(error);

    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
