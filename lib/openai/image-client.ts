import { Agent, fetch as undiciFetch } from "undici";
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

type OpenAiImageSize = "1024x1024" | "1536x1024" | "1792x1024";

interface GenerateOpenAiImageOptions {
  model?: string;
  apiKey?: string;
  size?: OpenAiImageSize;
  purpose?: "scene" | "thumbnail";
}

/** Long timeouts: GPT image models can take many minutes; Node's default Undici limits are 300s. */
const openAiImageDispatcher = new Agent({
  connectTimeout: 60_000,
  headersTimeout: 800_000,
  bodyTimeout: 800_000,
});

/**
 * Generate an image from a text prompt using OpenAI's GPT image API.
 * Returns the image as a PNG buffer.
 */
export async function generateOpenAiImage(
  prompt: string,
  options?: GenerateOpenAiImageOptions
): Promise<Buffer> {
  const apiKey = getApiKey(options?.apiKey);
  const model = options?.model ?? "gpt-image-2";
  const explicitSize = options?.size;
  const purpose = options?.purpose ?? "scene";
  const sizeCandidates: OpenAiImageSize[] = explicitSize
    ? [explicitSize]
    : purpose === "thumbnail"
      ? ["1792x1024", "1536x1024", "1024x1024"]
      : ["1024x1024"];

  let lastError: string | null = null;
  for (const size of sizeCandidates) {
    const response = await undiciFetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      dispatcher: openAiImageDispatcher,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        prompt,
        size,
        output_format: "png",
      }),
    });

    const raw = await response.text();
    let payload: OpenAiImageResponse;
    try {
      payload = JSON.parse(raw) as OpenAiImageResponse;
    } catch {
      throw new Error(
        `OpenAI image API returned non-JSON (HTTP ${response.status}). ${raw.slice(0, 240)}`
      );
    }

    if (!response.ok) {
      const message =
        payload.error?.message ||
        `OpenAI image generation failed (HTTP ${response.status}) for size ${size}.`;
      lastError = message;
      const mayBeSizeIssue = /size|invalid.*dimension|dimensions|not supported/i.test(message);
      if (mayBeSizeIssue && size !== sizeCandidates[sizeCandidates.length - 1]) {
        continue;
      }
      throw new Error(message);
    }

    const b64 = payload.data?.[0]?.b64_json;
    if (b64) {
      return Buffer.from(b64, "base64");
    }

    const imageUrl = payload.data?.[0]?.url;
    if (imageUrl) {
      const imageResponse = await undiciFetch(imageUrl, { dispatcher: openAiImageDispatcher });
      if (!imageResponse.ok) {
        throw new Error("OpenAI returned an image URL, but downloading it failed.");
      }
      const bytes = await imageResponse.arrayBuffer();
      return Buffer.from(bytes);
    }

    lastError = "OpenAI image response did not include image data.";
  }

  throw new Error(lastError || "OpenAI image response did not include image data.");
}
