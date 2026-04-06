import {
  callClaudeStreaming,
  callClaudeWithUsage,
  type StreamingResult,
} from "@/lib/claude/client";
import {
  getLlmModelOrThrow,
  resolveOpenRouterApiModel,
} from "@/lib/models/registry";
import type { LlmStage } from "@/lib/models/types";
import { resolveProviderApiKey } from "@/lib/keys/resolve";
import {
  openRouterChatCompletion,
  openRouterChatCompletionStream,
  type OpenRouterMessage,
} from "@/lib/openrouter/client";
import { logLlmUsage } from "@/lib/usage/llm-usage";

export async function completeLlmText(
  stage: LlmStage,
  prompt: string,
  options: {
    system?: string;
    modelId: string;
    temperature: number;
    maxTokens: number;
    projectId?: number | null;
  }
): Promise<string> {
  const entry = getLlmModelOrThrow(options.modelId);

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
  const model = resolveOpenRouterApiModel(entry, false);
  const messages: OpenRouterMessage[] = [];
  if (options.system) {
    messages.push({ role: "system", content: options.system });
  }
  messages.push({ role: "user", content: prompt });

  const { text, inputTokens, outputTokens } = await openRouterChatCompletion({
    model,
    messages,
    maxTokens: options.maxTokens,
    temperature: options.temperature,
    apiKey,
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

  const streamTemp = useThinking ? 1 : options.temperature;
  const result = await openRouterChatCompletionStream({
    model,
    messages,
    maxTokens: options.maxTokens,
    temperature: streamTemp,
    apiKey,
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
