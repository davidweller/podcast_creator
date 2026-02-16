import Anthropic from "@anthropic-ai/sdk";

/** Model for script generation (long-form, high quality). */
export const SCRIPT_MODEL = "claude-opus-4-5-20251101";

/** Model for non-script activities (improvements, metadata, descriptions, etc.). */
export const DEFAULT_MODEL = "claude-sonnet-4-5-20250929";

function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set");
  }
  return new Anthropic({
    apiKey: apiKey,
  });
}

export interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

export async function callClaude(
  prompt: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
    system?: string;
    /** Use SCRIPT_MODEL for script generation; omit for DEFAULT_MODEL (Claude Sonnet 4.5). */
    model?: string;
  }
): Promise<string> {
  try {
    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: options?.model ?? DEFAULT_MODEL,
      max_tokens: options?.maxTokens || 16384,
      temperature: options?.temperature || 0.7,
      system: options?.system || "",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === "text") {
      return content.text;
    }

    throw new Error("Unexpected response format from Claude");
  } catch (error: any) {
    console.error("Claude API error:", error);
    
    // Handle authentication errors specifically
    if (error?.status === 401 || error?.message?.includes("authentication_error") || error?.message?.includes("invalid x-api-key")) {
      throw new Error("Invalid API key. Please check your ANTHROPIC_API_KEY in the .env file and ensure it's correct. You may need to restart your server after updating it.");
    }
    
    // Handle model not found errors
    if (error?.status === 404 || error?.message?.includes("not_found_error") || error?.message?.includes("model:")) {
      throw new Error("Model not found. The model identifier may have changed. Please check the Anthropic API documentation for the correct model name.");
    }
    
    throw error;
  }
}

export async function callClaudeStreaming(
  prompt: string,
  onChunk: (chunk: string) => void,
  options?: {
    maxTokens?: number;
    temperature?: number;
    system?: string;
    /** Use SCRIPT_MODEL for script generation; omit for DEFAULT_MODEL (Claude Sonnet 4.5). */
    model?: string;
  }
): Promise<void> {
  try {
    const anthropic = getAnthropicClient();
    const stream = await anthropic.messages.stream({
      model: options?.model ?? DEFAULT_MODEL,
      max_tokens: options?.maxTokens || 16384,
      temperature: options?.temperature || 0.7,
      system: options?.system || "",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        onChunk(event.delta.text);
      }
    }
  } catch (error: any) {
    console.error("Claude API streaming error:", error);
    
    // Handle authentication errors specifically
    if (error?.status === 401 || error?.message?.includes("authentication_error") || error?.message?.includes("invalid x-api-key")) {
      throw new Error("Invalid API key. Please check your ANTHROPIC_API_KEY in the .env file and ensure it's correct. You may need to restart your server after updating it.");
    }
    
    // Handle model not found errors
    if (error?.status === 404 || error?.message?.includes("not_found_error") || error?.message?.includes("model:")) {
      throw new Error("Model not found. The model identifier may have changed. Please check the Anthropic API documentation for the correct model name.");
    }
    
    throw error;
  }
}
