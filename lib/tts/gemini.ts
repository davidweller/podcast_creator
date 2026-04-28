import { GoogleGenAI } from "@google/genai";
import { resolveProviderApiKey } from "@/lib/keys/resolve";
import { mergeLinear16AudioChunks } from "@/lib/tts/wav";

const DEFAULT_GEMINI_TTS_MODEL = "gemini-3.1-flash-tts-preview";
const MAX_BYTES = 3800;

export interface GeminiSynthesizeOptions {
  text: string;
  voiceName: string;
  model?: string;
}

function getClient() {
  const apiKey = resolveProviderApiKey("google_gemini");
  if (!apiKey) {
    throw new Error(
      "Google Gemini API key not configured. Set GOOGLE_GEMINI_API_KEY or add your key in Settings."
    );
  }
  return new GoogleGenAI({ apiKey });
}

function splitByWords(text: string, maxBytes: number): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (Buffer.byteLength(next, "utf8") <= maxBytes) {
      current = next;
      continue;
    }

    if (current) {
      chunks.push(current);
    }
    current = word;
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

function splitTextIntoChunks(text: string, maxBytes: number = MAX_BYTES): string[] {
  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    const next = current ? `${current}\n\n${paragraph}` : paragraph;
    if (Buffer.byteLength(next, "utf8") <= maxBytes) {
      current = next;
      continue;
    }

    if (current) {
      chunks.push(current.trim());
      current = "";
    }

    if (Buffer.byteLength(paragraph, "utf8") <= maxBytes) {
      current = paragraph;
      continue;
    }

    chunks.push(...splitByWords(paragraph, maxBytes));
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks.filter(Boolean);
}

async function synthesizeChunk(
  ai: GoogleGenAI,
  text: string,
  voiceName: string,
  model: string
): Promise<Buffer> {
  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName,
          },
        },
      },
    },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts?.length) {
    throw new Error("Gemini TTS returned no audio data.");
  }

  for (const part of parts) {
    const inlineData = (part as { inlineData?: { data?: string } }).inlineData;
    if (inlineData?.data) {
      return Buffer.from(inlineData.data, "base64");
    }
  }

  throw new Error("Gemini TTS response did not contain inline audio data.");
}

export async function synthesizeSpeechWithGemini(
  options: GeminiSynthesizeOptions
): Promise<Buffer> {
  const ai = getClient();
  const model = options.model?.trim() || DEFAULT_GEMINI_TTS_MODEL;
  const chunks = splitTextIntoChunks(options.text);
  const audioChunks: Buffer[] = [];

  for (const chunk of chunks) {
    const audio = await synthesizeChunk(ai, chunk, options.voiceName, model);
    audioChunks.push(audio);
  }

  return mergeLinear16AudioChunks(audioChunks);
}

export { DEFAULT_GEMINI_TTS_MODEL };
