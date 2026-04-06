import { CLAUDE_MODELS, type ClaudeModelId } from "@/lib/claude/client";
import {
  DEFAULT_LLM_BY_STAGE,
  getLlmModelOrThrow,
} from "@/lib/models/registry";
import type { LlmStage } from "@/lib/models/types";

export function parseLlmModelId(
  body: unknown,
  stage: LlmStage,
  fallback: string = DEFAULT_LLM_BY_STAGE[stage]
): string {
  if (!body || typeof body !== "object") {
    return fallback;
  }
  const b = body as Record<string, unknown>;
  const raw = typeof b.llmModelId === "string" ? b.llmModelId.trim() : "";
  if (!raw) {
    return fallback;
  }
  getLlmModelOrThrow(raw);
  return raw;
}

/** Model id + extended thinking flag (only applied if the model supports thinking). */
export function parseLlmCompletionOptions(
  body: unknown,
  stage: LlmStage,
  fallbackModel: string = DEFAULT_LLM_BY_STAGE[stage]
): {
  llmModelId: string;
  useThinking: boolean;
  thinkingBudget: number;
} {
  const llmModelId = parseLlmModelId(body, stage, fallbackModel);
  const entry = getLlmModelOrThrow(llmModelId);
  const b = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const wantThinking = Boolean(b.useThinking);
  const thinkingBudget =
    typeof b.thinkingBudget === "number" && b.thinkingBudget > 0
      ? Math.floor(b.thinkingBudget)
      : 10000;
  return {
    llmModelId,
    useThinking: wantThinking && entry.supportsThinking,
    thinkingBudget,
  };
}

/**
 * Script generation: supports new `llmModelId` or legacy Anthropic `modelId`.
 */
export function parseScriptLlmSelection(body: unknown): {
  llmModelId: string;
  useThinking: boolean;
  thinkingBudget: number;
} {
  const defaults = {
    llmModelId: DEFAULT_LLM_BY_STAGE.script,
    useThinking: false,
    thinkingBudget: 10000,
  };
  if (!body || typeof body !== "object") {
    return defaults;
  }
  const b = body as Record<string, unknown>;
  const useThinking = Boolean(b.useThinking);
  const thinkingBudget =
    typeof b.thinkingBudget === "number" && b.thinkingBudget > 0
      ? Math.floor(b.thinkingBudget)
      : 10000;

  if (typeof b.llmModelId === "string" && b.llmModelId.trim()) {
    const id = b.llmModelId.trim();
    getLlmModelOrThrow(id);
    return { llmModelId: id, useThinking, thinkingBudget };
  }

  if (
    typeof b.modelId === "string" &&
    (b.modelId as ClaudeModelId) in CLAUDE_MODELS
  ) {
    const legacyId = `anthropic/${b.modelId}`;
    getLlmModelOrThrow(legacyId);
    return { llmModelId: legacyId, useThinking, thinkingBudget };
  }

  return { ...defaults, useThinking, thinkingBudget };
}
