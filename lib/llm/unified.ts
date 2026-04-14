import {
  callClaudeStreaming,
  callClaudeWithUsage,
  type StreamingResult,
} from "@/lib/claude/client";
import {
  getLlmModelOrThrow,
  resolveOpenRouterApiModel,
  type LlmModelEntry,
} from "@/lib/models/registry";
import type { LlmStage } from "@/lib/models/types";
import { resolveProviderApiKey } from "@/lib/keys/resolve";
import {
  openRouterChatCompletion,
  openRouterChatCompletionStream,
  type OpenRouterMessage,
  type OpenRouterReasoningBody,
} from "@/lib/openrouter/client";
import { logLlmUsage } from "@/lib/usage/llm-usage";

function openRouterReasoningForEntry(
  entry: LlmModelEntry,
  useThinking: boolean,
  thinkingBudget?: number
): OpenRouterReasoningBody | undefined {
  if (entry.provider !== "openrouter" || !entry.openRouterReasoningViaBody) {
    return undefined;
  }
  if (!useThinking || !entry.supportsThinking) return undefined;
  const max_tokens =
    typeof thinkingBudget === "number" && thinkingBudget > 0
      ? Math.floor(thinkingBudget)
      : 10000;
  return { max_tokens };
}

export async function completeLlmText(
  stage: LlmStage,
  prompt: string,
  options: {
    system?: string;
    modelId: string;
    temperature: number;
    maxTokens: number;
    projectId?: number | null;
    /** When true and the model supports it, uses extended thinking (streaming). */
    useThinking?: boolean;
    thinkingBudget?: number;
  }
): Promise<string> {
  const entry = getLlmModelOrThrow(options.modelId);
  const useThinking = Boolean(
    options.useThinking && entry.supportsThinking
  );

  if (useThinking) {
    const chunks: string[] = [];
    await streamLlmText(stage, prompt, (c) => chunks.push(c), {
      modelId: options.modelId,
      useThinking: true,
      thinkingBudget: options.thinkingBudget ?? 10000,
      maxTokens: options.maxTokens,
      temperature: options.temperature,
      system: options.system,
      projectId: options.projectId ?? undefined,
    });
    return chunks.join("").trim();
  }

  if (entry.provider === "anthropic") {
    const apiKey = resolveProviderApiKey("anthropic") ?? undefined;
    const { text, inputTokens, outputTokens } = await callClaudeWithUsage(
      prompt,
      {
        model: entry.apiModel,
        maxTokens: options.maxTokens,
        temperature: options.temperature,
        system: options.system,
        apiKey,
      }
    );
    logLlmUsage({
      stage,
      provider: "anthropic",
      model: entry.apiModel,
      inputTokens,
      outputTokens,
      projectId: options.projectId ?? undefined,
    });
    return text;
  }

  const apiKey = resolveProviderApiKey("openrouter") ?? undefined;
  const model = resolveOpenRouterApiModel(entry, useThinking);
  const messages: OpenRouterMessage[] = [];
  if (options.system) {
    messages.push({ role: "system", content: options.system });
  }
  messages.push({ role: "user", content: prompt });

  const reasoning = openRouterReasoningForEntry(
    entry,
    useThinking,
    options.thinkingBudget
  );
  const { text, inputTokens, outputTokens } = await openRouterChatCompletion({
    model,
    messages,
    maxTokens: options.maxTokens,
    temperature: useThinking ? 1 : options.temperature,
    apiKey,
    reasoning,
  });
  logLlmUsage({
    stage,
    provider: "openrouter",
    model,
    inputTokens,
    outputTokens,
    projectId: options.projectId ?? undefined,
  });
  return text;
}

export async function streamLlmText(
  stage: LlmStage,
  prompt: string,
  onChunk: (chunk: string) => void,
  options: {
    system?: string;
    modelId: string;
    useThinking: boolean;
    thinkingBudget?: number;
    maxTokens: number;
    temperature: number;
    projectId?: number | null;
  }
): Promise<StreamingResult> {
  const entry = getLlmModelOrThrow(options.modelId);
  const useThinking = Boolean(
    options.useThinking && entry.supportsThinking
  );

  if (entry.provider === "anthropic") {
    const apiKey = resolveProviderApiKey("anthropic") ?? undefined;
    const result = await callClaudeStreaming(prompt, onChunk, {
      model: entry.apiModel,
      maxTokens: options.maxTokens,
      temperature: options.temperature,
      system: options.system,
      useThinking,
      thinkingBudget: options.thinkingBudget ?? 10000,
      apiKey,
    });
    logLlmUsage({
      stage,
      provider: "anthropic",
      model: entry.apiModel,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      projectId: options.projectId ?? undefined,
    });
    return result;
  }

  const apiKey = resolveProviderApiKey("openrouter") ?? undefined;
  const model = resolveOpenRouterApiModel(entry, useThinking);
  const messages: OpenRouterMessage[] = [];
  if (options.system) {
    messages.push({ role: "system", content: options.system });
  }
  messages.push({ role: "user", content: prompt });

  // Past the Anthropic branch, only OpenRouter remains.
  const streamTemp = useThinking ? 1 : options.temperature;
  const reasoning = openRouterReasoningForEntry(
    entry,
    useThinking,
    options.thinkingBudget
  );
  const result = await openRouterChatCompletionStream({
    model,
    messages,
    maxTokens: options.maxTokens,
    temperature: streamTemp,
    apiKey,
    reasoning,
    onChunk,
  });
  logLlmUsage({
    stage,
    provider: "openrouter",
    model,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
    projectId: options.projectId ?? undefined,
  });
  return {
    stopReason: result.stopReason,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
  };
}
