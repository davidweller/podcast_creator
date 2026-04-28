import { resolveProviderApiKey } from "@/lib/keys/resolve";

function getApiKey(apiKeyOverride?: string): string {
  const apiKey = apiKeyOverride?.trim() || resolveProviderApiKey("openai");
  if (!apiKey) {
    throw new Error(
      "OpenAI API key not configured. Set OPENAI_API_KEY or add your key in Settings."
    );
  }
  return apiKey;
}

type OpenAiImageResponse = {
  data?: Array<{ b64_json?: string; url?: string }>;
  error?: { message?: string };
};

/**
 * Generate an image from a text prompt using OpenAI's gpt-image-2 model.
 * Returns the image as a PNG buffer.
 */
export async function generateOpenAiImage(
  prompt: string,
  options?: { model?: string; apiKey?: string }
): Promise<Buffer> {
  const apiKey = getApiKey(options?.apiKey);
  const model = options?.model ?? "gpt-image-2";

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      prompt,
      // Square is ~2x faster than 1536×1024 for gpt-image-2.
      // ensure16x9 center-crops the result to 16:9 at 1920×1080.
      size: "1024x1024",
    }),
  });

  const payload = (await response.json()) as OpenAiImageResponse;
  if (!response.ok) {
    throw new Error(payload.error?.message || "OpenAI image generation failed.");
  }

  const b64 = payload.data?.[0]?.b64_json;
  if (b64) {
    return Buffer.from(b64, "base64");
  }

  const imageUrl = payload.data?.[0]?.url;
  if (imageUrl) {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error("OpenAI returned an image URL, but downloading it failed.");
    }
    const bytes = await imageResponse.arrayBuffer();
    return Buffer.from(bytes);
  }

  throw new Error("OpenAI image response did not include image data.");
}
