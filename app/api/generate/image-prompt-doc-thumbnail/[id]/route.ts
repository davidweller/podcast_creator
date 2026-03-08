import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/db/projects";
import { getProjectData } from "@/lib/db/projects";
import { updateProjectImage } from "@/lib/db/project-images";
import { callClaude } from "@/lib/claude/client";

const PROMPT_DOC_THUMBNAIL = `You are generating a YouTube thumbnail image prompt for a Cozy Crime documentary-style video. The channel presents historical crime as calm, literary storytelling using authentic Victorian-era photographic aesthetics.

You will be given the full script of the video. Read it carefully to understand the narrative arc, key moments, and most compelling visual elements that would make viewers want to watch.

CRITICAL STYLE REQUIREMENT: The image must NOT be illustrated. It must look like an authentic Victorian-era photograph with monochrome/sepia toning.

Generate ONE documentary-style YouTube thumbnail prompt following these YouTube best practices:
- ONE clear focal point (a face, object, or scene) that draws the eye immediately
- High contrast lighting for drama and visibility at small sizes (thumbnails appear as small as 120x90px)
- Leave negative space on one side (specify left or right) for title text overlay
- Evoke curiosity or intrigue without being graphic
- Feature the most compelling visual element from the script - this could be the central mystery, a key figure, a pivotal object, or a dramatic moment
- Monochrome with slight sepia toning for period authenticity

Template: "Victorian documentary photograph composition, [main subject: e.g. shadowy figure in doorway / woman's face partially lit / evidence item in dramatic spotlight], [dramatic element: e.g. stark contrast / mysterious shadows / fog obscuring details], high contrast, single clear focal point, negative space on [left/right] for title text overlay, mysterious or intriguing atmosphere, monochrome with slight sepia toning, [decade]. No illustration, no painting, photographic only."

Also provide a SHORT TITLE (2-5 words) for the thumbnail overlay - dramatic, curiosity-inducing, works at small font sizes. The title should hook viewers and hint at the mystery without giving away the story.

OUTPUT FORMAT: Respond with a single JSON object, no other text:
{
  "prompt": "Full thumbnail image prompt...",
  "title": "Short Title"
}`;

interface DocThumbnailResponse {
  prompt: string;
  title: string;
}

function parseResponse(text: string): DocThumbnailResponse {
  let jsonStr = text.trim();
  const codeBlock = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) {
    jsonStr = codeBlock[1].trim();
  }
  return JSON.parse(jsonStr) as DocThumbnailResponse;
}

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
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    if (!projectData?.script_90min) {
      return NextResponse.json(
        { error: "Script not found. Please generate the script first." },
        { status: 400 }
      );
    }

    const prompt = `${PROMPT_DOC_THUMBNAIL}

Case title: ${project.title}
Era and location: ${project.era_location}

Script:
${projectData.script_90min}`;

    const raw = await callClaude(prompt, {
      maxTokens: 2048,
      temperature: 0.6,
    });

    const parsed = parseResponse(raw);

    if (!parsed.prompt || typeof parsed.prompt !== "string") {
      return NextResponse.json(
        { error: "Could not parse thumbnail prompt from Claude response" },
        { status: 500 }
      );
    }

    updateProjectImage(projectId, "doc-thumbnail", {
      prompt: parsed.prompt,
      thumbnail_title: parsed.title ?? null,
    });

    return NextResponse.json({
      success: true,
      prompt: parsed.prompt,
      title: parsed.title,
    });
  } catch (error: unknown) {
    console.error("Error generating documentary thumbnail prompt:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error:
          errorMessage.includes("ANTHROPIC_API_KEY") || errorMessage.includes("api key")
            ? "Claude API key not configured. Set ANTHROPIC_API_KEY in .env"
            : errorMessage || "Failed to generate documentary thumbnail prompt",
      },
      { status: 500 }
    );
  }
}
