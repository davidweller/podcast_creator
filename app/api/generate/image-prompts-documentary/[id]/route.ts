import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/db/projects";
import { getProjectData } from "@/lib/db/projects";
import { setProjectImagesPrompts } from "@/lib/db/project-images";
import { callClaude } from "@/lib/claude/client";
import { PROMPT_DOCUMENTARY_IMAGE_SET, DOCUMENTARY_IMAGE_TYPES, DocumentarySlotId } from "@/lib/prompts/image-set-documentary";

interface DocumentaryImageSetResponse {
  decade?: string;
  thumbnail?: { slot: string; prompt: string; title: string };
  images: { slot: string; prompt: string }[];
}

function parseDocumentaryResponse(text: string): DocumentaryImageSetResponse {
  let jsonStr = text.trim();
  const codeBlock = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) {
    jsonStr = codeBlock[1].trim();
  }
  return JSON.parse(jsonStr) as DocumentaryImageSetResponse;
}

function isValidDocumentarySlot(slot: string): slot is DocumentarySlotId {
  return DOCUMENTARY_IMAGE_TYPES.some((t) => t.slot === slot);
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
    if (!projectData?.research_text) {
      return NextResponse.json(
        { error: "Research text not found. Please add research first." },
        { status: 400 }
      );
    }

    const prompt = `${PROMPT_DOCUMENTARY_IMAGE_SET}

Case title: ${project.title}
Era and location: ${project.era_location}

Research:
${projectData.research_text}`;

    const raw = await callClaude(prompt, {
      maxTokens: 8192,
      temperature: 0.6,
    });

    const parsed = parseDocumentaryResponse(raw);
    const items: { slot: string; prompt: string; thumbnail_title?: string | null }[] = [];

    // Handle thumbnail separately (it has a title)
    if (parsed.thumbnail?.slot === "doc-thumbnail" && typeof parsed.thumbnail.prompt === "string") {
      items.push({
        slot: "doc-thumbnail",
        prompt: parsed.thumbnail.prompt,
        thumbnail_title: parsed.thumbnail.title ?? null,
      });
    }

    if (Array.isArray(parsed.images)) {
      for (const item of parsed.images) {
        if (item?.slot && typeof item.prompt === "string" && isValidDocumentarySlot(item.slot)) {
          items.push({ slot: item.slot, prompt: item.prompt });
        }
      }
    }

    if (items.length === 0) {
      return NextResponse.json(
        { error: "Could not parse documentary image prompts from Claude response" },
        { status: 500 }
      );
    }

    const receivedSlots = items.map((i) => i.slot).sort();
    console.log(`Generated ${items.length} documentary prompts. Slots: ${receivedSlots.join(", ")}`);

    if (items.length < 11) {
      console.warn(`Warning: Only ${items.length} documentary prompts generated, expected 11.`);
    }

    setProjectImagesPrompts(projectId, items);

    return NextResponse.json({ 
      success: true, 
      count: items.length,
      slots: receivedSlots,
      decade: parsed.decade 
    });
  } catch (error: unknown) {
    console.error("Error generating documentary image prompts:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error:
          errorMessage.includes("ANTHROPIC_API_KEY") || errorMessage.includes("api key")
            ? "Claude API key not configured. Set ANTHROPIC_API_KEY in .env"
            : errorMessage || "Failed to generate documentary image prompts",
      },
      { status: 500 }
    );
  }
}
