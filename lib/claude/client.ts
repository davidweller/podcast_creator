import Anthropic from "@anthropic-ai/sdk";

/** Model for script generation (long-form, high quality). */
export const SCRIPT_MODEL = "claude-sonnet-4-6";

/** Model for non-script activities (improvements, metadata, descriptions, etc.). */
export const DEFAULT_MODEL = "claude-sonnet-4-6";

/** Available Claude models for script generation */
export const CLAUDE_MODELS = {
  "claude-sonnet-4-5-20250514": {
    id: "claude-sonnet-4-5-20250514",
    name: "Claude Sonnet 4.5",
    description: "Fast and capable",
    supportsThinking: true,
  },
  "claude-sonnet-4-6": {
    id: "claude-sonnet-4-6",
    name: "Claude Sonnet 4.6",
    description: "Latest Sonnet model",
    supportsThinking: true,
  },
  "claude-opus-4-5-20250514": {
    id: "claude-opus-4-5-20250514",
    name: "Claude Opus 4.5",
    description: "Most capable, best for complex tasks",
    supportsThinking: true,
  },
  "claude-opus-4-6": {
    id: "claude-opus-4-6",
    name: "Claude Opus 4.6",
    description: "Latest Opus model",
    supportsThinking: true,
  },
} as const;

export type ClaudeModelId = keyof typeof CLAUDE_MODELS;

export interface ScriptModelConfig {
  modelId: ClaudeModelId;
  useThinking: boolean;
  thinkingBudget?: number;
}

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
    /** Use SCRIPT_MODEL for script generation; omit for DEFAULT_MODEL (Claude Sonnet 4.6). */
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
    
    // Handle overloaded/rate limit errors (529, 429, or overloaded_error)
    if (error?.status === 529 || error?.status === 429 || 
        error?.error?.type === "overloaded_error" || 
        error?.message?.includes("overloaded_error") ||
        error?.message?.includes("Overloaded")) {
      throw new Error("Claude API is currently overloaded. Please wait a moment and try again. The service is experiencing high demand.");
    }
    
    throw error;
  }
}

export interface StreamingResult {
  stopReason: string | null;
  inputTokens: number;
  outputTokens: number;
}

export async function callClaudeStreaming(
  prompt: string,
  onChunk: (chunk: string) => void,
  options?: {
    maxTokens?: number;
    temperature?: number;
    system?: string;
    /** Use SCRIPT_MODEL for script generation; omit for DEFAULT_MODEL (Claude Sonnet 4.6). */
    model?: string;
    /** Enable extended thinking mode */
    useThinking?: boolean;
    /** Budget tokens for thinking (default 10000) */
    thinkingBudget?: number;
  }
): Promise<StreamingResult> {
  try {
    const anthropic = getAnthropicClient();
    
    // Build request params
    const useThinking = options?.useThinking ?? false;
    const thinkingBudget = options?.thinkingBudget ?? 10000;
    
    // Extended thinking requires specific parameters
    if (useThinking) {
      const stream = await anthropic.messages.stream({
        model: options?.model ?? DEFAULT_MODEL,
        max_tokens: options?.maxTokens || 16384,
        thinking: {
          type: "enabled",
          budget_tokens: thinkingBudget,
        },
        // Temperature must be 1 for extended thinking
        temperature: 1,
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

      const finalMessage = await stream.finalMessage();
      return {
        stopReason: finalMessage.stop_reason,
        inputTokens: finalMessage.usage.input_tokens,
        outputTokens: finalMessage.usage.output_tokens,
      };
    } else {
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

      const finalMessage = await stream.finalMessage();
      return {
        stopReason: finalMessage.stop_reason,
        inputTokens: finalMessage.usage.input_tokens,
        outputTokens: finalMessage.usage.output_tokens,
      };
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
    
    // Handle overloaded/rate limit errors (529, 429, or overloaded_error)
    if (error?.status === 529 || error?.status === 429 || 
        error?.error?.type === "overloaded_error" || 
        error?.message?.includes("overloaded_error") ||
        error?.message?.includes("Overloaded")) {
      throw new Error("Claude API is currently overloaded. Please wait a moment and try again. The service is experiencing high demand.");
    }
    
    throw error;
  }
}
