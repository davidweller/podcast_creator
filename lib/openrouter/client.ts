import { resolveProviderApiKey } from "@/lib/keys/resolve";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

function formatOpenRouterError(status: number, errText: string, fallbackStatusText: string): string {
  const fallback = `OpenRouter error ${status}: ${errText.slice(0, 500) || fallbackStatusText}`;
  if (!errText) return fallback;

  try {
    const parsed = JSON.parse(errText) as {
      error?: {
        message?: string;
        code?: number | string;
        metadata?: { raw?: string; is_byok?: boolean };
      };
    };

    const providerMessage = parsed.error?.metadata?.raw || parsed.error?.message || "";
    const normalized = providerMessage.toLowerCase();
    const isRateLimit =
      status === 429 ||
      parsed.error?.code === 429 ||
      normalized.includes("rate-limit") ||
      normalized.includes("rate limited");

    if (isRateLimit) {
      const isFreeTier =
        normalized.includes(":free") || parsed.error?.metadata?.is_byok === false;
      if (isFreeTier) {
        return "OpenRouter free model is temporarily rate-limited. Please retry shortly, or add your own provider key in Settings -> Integrations to get your own rate limits.";
      }
      return "OpenRouter is currently rate-limiting this model. Please retry shortly, or switch to another model/provider.";
    }

    if (providerMessage) {
      return `OpenRouter error ${status}: ${providerMessage.slice(0, 500)}`;
    }
  } catch {
    // Non-JSON errors use the fallback message.
  }

  return fallback;
}

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

/** OpenRouter unified reasoning control (e.g. Alibaba `thinking_budget` mapping). */
export type OpenRouterReasoningBody = {
  max_tokens?: number;
  enabled?: boolean;
  exclude?: boolean;
};

export async function openRouterChatCompletion(params: {
  model: string;
  messages: OpenRouterMessage[];
  maxTokens: number;
  temperature: number;
  apiKey?: string;
  reasoning?: OpenRouterReasoningBody;
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
      ...(params.reasoning ? { reasoning: params.reasoning } : {}),
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(formatOpenRouterError(res.status, errText, res.statusText));
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
  reasoning?: OpenRouterReasoningBody;
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
      ...(params.reasoning ? { reasoning: params.reasoning } : {}),
    }),
  });

  if (!res.ok || !res.body) {
    const errText = await res.text().catch(() => "");
    throw new Error(formatOpenRouterError(res.status, errText, res.statusText));
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
