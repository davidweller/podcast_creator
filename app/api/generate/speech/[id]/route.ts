import { NextRequest, NextResponse } from "next/server";
import { getProjectData } from "@/lib/db/projects";
import { synthesizeSpeech, getAudioExtension } from "@/lib/tts/client";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

interface SpeechRequestBody {
  scriptSource: "90min" | "shorts" | "custom";
  customText?: string;
  voice: string;
  language: string;
  speed: number;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);
    const body: SpeechRequestBody = await request.json();

    const { scriptSource, customText, voice, language, speed } = body;

    if (!voice || !language) {
      return NextResponse.json(
        { error: "Voice and language are required" },
        { status: 400 }
      );
    }

    if (speed < 0.25 || speed > 2.0) {
      return NextResponse.json(
        { error: "Speed must be between 0.25 and 2.0" },
        { status: 400 }
      );
    }

    let text: string | null | undefined;

    if (scriptSource === "custom") {
      text = customText;
      if (!text || !text.trim()) {
        return NextResponse.json(
          { error: "Custom text is required when using custom script source." },
          { status: 400 }
        );
      }
    } else {
      const projectData = getProjectData(projectId);

      if (!projectData) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }

      text = scriptSource === "90min" 
        ? projectData.script_90min 
        : projectData.shorts;

      if (!text) {
        return NextResponse.json(
          { error: `No ${scriptSource} script found. Please generate a script first.` },
          { status: 400 }
        );
      }
    }

    const audioBuffer = await synthesizeSpeech({
      text,
      voiceName: voice,
      languageCode: language,
      speakingRate: speed,
      audioEncoding: "LINEAR16",
    });

    const audioDir = path.join(process.cwd(), "public", "audio", String(projectId));
    if (!existsSync(audioDir)) {
      mkdirSync(audioDir, { recursive: true });
    }

    const extension = getAudioExtension("LINEAR16");
    const filename = `speech-${scriptSource}.${extension}`;
    const filePath = path.join(audioDir, filename);

    writeFileSync(filePath, audioBuffer);

    const audioUrl = `/audio/${projectId}/${filename}`;

    return NextResponse.json({ audioUrl });
  } catch (error: unknown) {
    const err = error as { message?: string; code?: string };
    console.error("Error generating speech:", error);

    if (err?.message?.includes("Could not load the default credentials") ||
        err?.message?.includes("GOOGLE_APPLICATION_CREDENTIALS")) {
      return NextResponse.json(
        { 
          error: "Google Cloud credentials not configured. Please set GOOGLE_APPLICATION_CREDENTIALS environment variable to point to your service account JSON file." 
        },
        { status: 500 }
      );
    }

    if (err?.code === "PERMISSION_DENIED" || err?.message?.includes("permission")) {
      return NextResponse.json(
        { 
          error: "Permission denied. Please ensure the Cloud Text-to-Speech API is enabled and your service account has the required permissions." 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate speech. Please try again." },
      { status: 500 }
    );
  }
}
