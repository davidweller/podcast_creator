import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/db/projects";
import { getProjectData } from "@/lib/db/projects";
import { getProjectImages, setProjectImagesPrompts } from "@/lib/db/project-images";
import { completeLlmText } from "@/lib/llm/unified";
import { parseLlmCompletionOptions } from "@/lib/llm/parse-selection";
import { buildImageSetPrompt, buildThumbnailOnlyPrompt } from "@/lib/prompts/image-set";
import { IMAGE_SLOTS } from "@/types/database";

interface ImageSetResponse {
  characters?: { name: string; appearance: string }[];
  images?: { slot: string; prompt: string }[];
  thumbnails?: {
    cozy?: { slot: string; prompt: string; title?: string; overlay_text?: string };
    cinematic?: { slot: string; prompt: string; title?: string; overlay_text?: string };
  };
  thumbnail?: { slot: string; prompt: string; title?: string; overlay_text?: string };
}

const EXPECTED_SCENE_SLOT_COUNT = IMAGE_SLOTS.length - 2;
type ThumbnailVariant = "cozy" | "cinematic";

function parseImageSetResponse(text: string): ImageSetResponse {
  let jsonStr = text.trim();
  const codeBlock = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) {
    jsonStr = codeBlock[1].trim();
  }
  return JSON.parse(jsonStr) as ImageSetResponse;
}

function countWords(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function ensureHookInPrompt(prompt: string, overlay: string): string {
  if (prompt.toLowerCase().includes(overlay.toLowerCase())) {
    return prompt;
  }
  const suffix = `\n\nAdd large, bold hook text "${overlay}" rendered prominently in the image, center-right, high-contrast against the background.`;
  return prompt.trim() + suffix;
}

interface NormalizedThumbnail {
  slot: "thumbnail_cozy" | "thumbnail_cinematic";
  prompt: string;
  overlay_text: string;
}

function normalizeThumbnail(
  input: { slot: string; prompt: string; overlay_text?: string; title?: string } | undefined,
  expectedSlot: "thumbnail_cozy" | "thumbnail_cinematic"
): { ok: true; value: NormalizedThumbnail } | { ok: false; error: string } {
  if (!input) {
    return { ok: false, error: `Missing ${expectedSlot} thumbnail in response.` };
  }
  if (input.slot !== expectedSlot) {
    return { ok: false, error: `Expected slot "${expectedSlot}" but got "${input.slot}".` };
  }
  if (typeof input.prompt !== "string" || !input.prompt.trim()) {
    return { ok: false, error: `${expectedSlot}: prompt is missing or empty.` };
  }
  const overlay = (input.overlay_text ?? input.title ?? "").trim();
  if (!overlay) {
    return { ok: false, error: `${expectedSlot}: overlay_text is missing.` };
  }
  const words = countWords(overlay);
  if (words < 1 || words > 5) {
    return {
      ok: false,
      error: `${expectedSlot}: overlay_text must be 2-4 words (got ${words}): "${overlay}".`,
    };
  }
  const prompt = ensureHookInPrompt(input.prompt, overlay);
  return { ok: true, value: { slot: expectedSlot, prompt, overlay_text: overlay } };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);
    const body = await request.json().catch(() => ({}));
    const thumbnailVariant: ThumbnailVariant | null =
      body?.thumbnailVariant === "cozy" || body?.thumbnailVariant === "cinematic"
        ? body.thumbnailVariant
        : null;
    const project = getProject(projectId);
    const projectData = getProjectData(projectId);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    if (!projectData?.research_text) {
      return NextResponse.json(
        { error: "Research text not found. Please add research first." },
        { status: 400 }
      );
    }

    const basePrompt = thumbnailVariant
      ? buildThumbnailOnlyPrompt(thumbnailVariant)
      : buildImageSetPrompt();

    const prompt = `${basePrompt}

Case title: ${project.title}
Era and location: ${project.era_location}

Research:
${projectData.research_text}`;

    const { llmModelId, useThinking, thinkingBudget } =
      parseLlmCompletionOptions(body, "imagePrompt");

    const raw = await completeLlmText("imagePrompt", prompt, {
      modelId: llmModelId,
      maxTokens: 16384,
      temperature: 0.6,
      projectId,
      useThinking,
      thinkingBudget,
    });

    const parsed = parseImageSetResponse(raw);
    const items: { slot: string; prompt: string; thumbnail_title?: string | null }[] = [];

    if (thumbnailVariant) {
      const expectedSlot =
        thumbnailVariant === "cozy" ? "thumbnail_cozy" : "thumbnail_cinematic";
      const normalized = normalizeThumbnail(parsed.thumbnail, expectedSlot);
      if (!normalized.ok) {
        return NextResponse.json({ error: normalized.error }, { status: 500 });
      }
      items.push({
        slot: normalized.value.slot,
        prompt: normalized.value.prompt,
        thumbnail_title: normalized.value.overlay_text,
      });
      setProjectImagesPrompts(projectId, items);
      const images = getProjectImages(projectId);
      return NextResponse.json({ images });
    }

    if (Array.isArray(parsed.images)) {
      for (const item of parsed.images) {
        if (item?.slot && typeof item.prompt === "string") {
          items.push({ slot: String(item.slot), prompt: item.prompt });
        }
      }
    }

    const cozyNorm = normalizeThumbnail(parsed.thumbnails?.cozy, "thumbnail_cozy");
    const cinematicNorm = normalizeThumbnail(
      parsed.thumbnails?.cinematic,
      "thumbnail_cinematic"
    );

    if (!cozyNorm.ok || !cinematicNorm.ok) {
      const errors = [
        !cozyNorm.ok ? cozyNorm.error : null,
        !cinematicNorm.ok ? cinematicNorm.error : null,
      ]
        .filter(Boolean)
        .join(" ");
      return NextResponse.json(
        { error: `Could not parse both thumbnail variants. ${errors}` },
        { status: 500 }
      );
    }

    items.push({
      slot: cozyNorm.value.slot,
      prompt: cozyNorm.value.prompt,
      thumbnail_title: cozyNorm.value.overlay_text,
    });
    items.push({
      slot: cinematicNorm.value.slot,
      prompt: cinematicNorm.value.prompt,
      thumbnail_title: cinematicNorm.value.overlay_text,
    });

    if (items.length === 0) {
      return NextResponse.json(
        { error: "Could not parse image set from Claude response" },
        { status: 500 }
      );
    }

    const sceneSlots = items
      .filter((i) => i.slot !== "thumbnail_cozy" && i.slot !== "thumbnail_cinematic")
      .map((i) => i.slot)
      .sort((a, b) => {
        const aNum = parseInt(a);
        const bNum = parseInt(b);
        return isNaN(aNum) || isNaN(bNum) ? a.localeCompare(b) : aNum - bNum;
      });
    console.log(
      `Generated prompts for ${items.length} slots. Scene slots: ${sceneSlots.join(", ")}`
    );

    if (sceneSlots.length < EXPECTED_SCENE_SLOT_COUNT) {
      console.warn(
        `Warning: Only ${sceneSlots.length} scene slots generated, expected ${EXPECTED_SCENE_SLOT_COUNT}. Missing slots may not have prompts.`
      );
    }

    setProjectImagesPrompts(projectId, items);

    const images = getProjectImages(projectId);
    return NextResponse.json({ images });
  } catch (error: any) {
    console.error("Error generating image prompts:", error);
    return NextResponse.json(
      {
        error:
          error.message?.includes("ANTHROPIC_API_KEY") || error.message?.includes("api key")
            ? "Claude API key not configured. Set ANTHROPIC_API_KEY in .env"
            : error.message || "Failed to generate image prompts",
      },
      { status: 500 }
    );
  }
}
