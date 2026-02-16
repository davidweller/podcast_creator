import Anthropic from "@anthropic-ai/sdk";

function getAnthropicClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set");
  }
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
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
  }
): Promise<string> {
  try {
    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: options?.maxTokens || 4096,
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
  } catch (error) {
    console.error("Claude API error:", error);
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
  }
): Promise<void> {
  try {
    const anthropic = getAnthropicClient();
    const stream = await anthropic.messages.stream({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: options?.maxTokens || 4096,
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
  } catch (error) {
    console.error("Claude API streaming error:", error);
    throw error;
  }
}
