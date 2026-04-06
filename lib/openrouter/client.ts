import { resolveProviderApiKey } from "@/lib/keys/resolve";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

function getOpenRouterKey(apiKeyOverride?: string): string {
  const key = apiKeyOverride?.trim() || resolveProviderApiKey("openrouter");
  if (!key) {
    throw new Error(
      "OpenRouter API key not configured. Set OPENROUTER_API_KEY or add your key in Settings."
    );
  }
  return key;
}

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function openRouterChatCompletion(params: {
  model: string;
  messages: OpenRouterMessage[];
  maxTokens: number;
  temperature: number;
  apiKey?: string;
}): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
  const apiKey = getOpenRouterKey(params.apiKey);
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_HTTP_REFERER || "http://localhost",
      "X-Title": "Cozy Crime Creator Suite",
    },
    body: JSON.stringify({
      model: params.model,
      messages: params.messages,
      max_tokens: params.maxTokens,
      temperature: params.temperature,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(
      `OpenRouter error ${res.status}: ${errText.slice(0, 500) || res.statusText}`
    );
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };
  const text = data.choices?.[0]?.message?.content ?? "";
  return {
    text,
    inputTokens: data.usage?.prompt_tokens ?? 0,
    outputTokens: data.usage?.completion_tokens ?? 0,
  };
}

export interface OpenRouterStreamResult {
  stopReason: string | null;
  inputTokens: number;
  outputTokens: number;
}

/**
 * Streams assistant text deltas only (ignores reasoning blocks).
 */
export async function openRouterChatCompletionStream(params: {
  model: string;
  messages: OpenRouterMessage[];
  maxTokens: number;
  temperature: number;
  apiKey?: string;
  onChunk: (text: string) => void;
}): Promise<OpenRouterStreamResult> {
  const apiKey = getOpenRouterKey(params.apiKey);
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      "HTTP-Referer": process.env.OPENROUTER_HTTP_REFERER || "http://localhost",
      "X-Title": "Cozy Crime Creator Suite",
    },
    body: JSON.stringify({
      model: params.model,
      messages: params.messages,
      max_tokens: params.maxTokens,
      temperature: params.temperature,
      stream: true,
    }),
  });

  if (!res.ok || !res.body) {
    const errText = await res.text().catch(() => "");
    throw new Error(
      `OpenRouter stream error ${res.status}: ${errText.slice(0, 500) || res.statusText}`
    );
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let inputTokens = 0;
  let outputTokens = 0;
  let finishReason: string | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") continue;
      try {
        const json = JSON.parse(payload) as {
          choices?: {
            delta?: { content?: string; reasoning?: string };
            finish_reason?: string | null;
          }[];
          usage?: { prompt_tokens?: number; completion_tokens?: number };
        };
        if (json.usage) {
          inputTokens = json.usage.prompt_tokens ?? inputTokens;
          outputTokens = json.usage.completion_tokens ?? outputTokens;
        }
        const delta = json.choices?.[0]?.delta;
        if (delta?.content) {
          params.onChunk(delta.content);
        }
        const fr = json.choices?.[0]?.finish_reason;
        if (fr) finishReason = fr;
      } catch {
        // ignore malformed SSE lines
      }
    }
  }

  return {
    stopReason: finishReason,
    inputTokens,
    outputTokens,
  };
}
