import { GoogleGenAI } from "@google/genai";

const IMAGE_MODEL = "gemini-2.5-flash-image";

function getClient() {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GOOGLE_GEMINI_API_KEY environment variable is not set");
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Generate an image from a text prompt using the Gemini image generation model.
 * Returns the image as a Buffer (PNG).
 */
export async function generateImage(prompt: string): Promise<Buffer> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents: prompt,
    config: {
      responseModalities: ["IMAGE"],
      imageConfig: { aspectRatio: "16:9", imageSize: "2K" },
    },
  });

  const candidate = response.candidates?.[0];
  const parts = candidate?.content?.parts;
  if (!parts?.length) {
    const feedback = (response as { promptFeedback?: { blockReason?: string } }).promptFeedback;
    const reason = feedback?.blockReason ? ` (block reason: ${feedback.blockReason})` : "";
    const textPart = parts?.find((p: { text?: string }) => p.text) as { text?: string } | undefined;
    const text = textPart?.text ? textPart.text.slice(0, 200) : "";
    throw new Error(`No image in Gemini response${reason}. ${text ? `Model said: ${text}` : "Check GOOGLE_GEMINI_API_KEY and that the model supports image generation."}`);
  }

  for (const part of parts) {
    const inline = part as { inlineData?: { data?: string; mimeType?: string } };
    if (inline.inlineData?.data) {
      return Buffer.from(inline.inlineData.data, "base64");
    }
  }

  const firstPart = parts[0] as { text?: string };
  const textSnippet = firstPart?.text ? firstPart.text.slice(0, 300) : JSON.stringify(parts[0]).slice(0, 300);
  throw new Error(`Gemini response did not contain image data. First part: ${textSnippet}`);
}
