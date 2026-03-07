import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/db/projects";
import { getProjectData } from "@/lib/db/projects";
import { getProjectImages, setProjectImagesPrompts } from "@/lib/db/project-images";
import { callClaude } from "@/lib/claude/client";
import { PROMPT_IMAGE_SET } from "@/lib/prompts/image-set";

interface ImageSetResponse {
  characters?: { name: string; appearance: string }[];
  images: { slot: string; prompt: string }[];
  thumbnail: { slot: string; prompt: string; title: string };
}

function parseImageSetResponse(text: string): ImageSetResponse {
  let jsonStr = text.trim();
  const codeBlock = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) {
    jsonStr = codeBlock[1].trim();
  }
  return JSON.parse(jsonStr) as ImageSetResponse;
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

    const prompt = `${PROMPT_IMAGE_SET}

Case title: ${project.title}
Era and location: ${project.era_location}

Research:
${projectData.research_text}`;

    const raw = await callClaude(prompt, {
      maxTokens: 16384, // Increased to ensure all 36 prompts fit
      temperature: 0.6,
    });

    const parsed = parseImageSetResponse(raw);
    const items: { slot: string; prompt: string; thumbnail_title?: string | null }[] = [];

    if (Array.isArray(parsed.images)) {
      for (const item of parsed.images) {
        if (item?.slot && typeof item.prompt === "string") {
          items.push({ slot: String(item.slot), prompt: item.prompt });
        }
      }
    }
    if (parsed.thumbnail?.slot === "thumbnail" && typeof parsed.thumbnail.prompt === "string") {
      items.push({
        slot: "thumbnail",
        prompt: parsed.thumbnail.prompt,
        thumbnail_title: parsed.thumbnail.title ?? null,
      });
    }

    if (items.length === 0) {
      return NextResponse.json(
        { error: "Could not parse image set from Claude response" },
        { status: 500 }
      );
    }

    // Log what we received
    const sceneSlots = items.filter((i) => i.slot !== "thumbnail").map((i) => i.slot).sort((a, b) => {
      const aNum = parseInt(a);
      const bNum = parseInt(b);
      return isNaN(aNum) || isNaN(bNum) ? a.localeCompare(b) : aNum - bNum;
    });
    console.log(`Generated prompts for ${items.length} slots. Scene slots: ${sceneSlots.join(", ")}`);
    
    if (sceneSlots.length < 36) {
      console.warn(`Warning: Only ${sceneSlots.length} scene slots generated, expected 36. Missing slots may not have prompts.`);
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
