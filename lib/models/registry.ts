import type { LlmStage } from "./types";

export interface LlmModelEntry {
  /** Stable id sent from client and stored in localStorage */
  id: string;
  label: string;
  group: string;
  provider: "anthropic" | "openrouter";
  /** Model id for the provider API (no :thinking suffix; applied at runtime) */
  apiModel: string;
  supportsThinking: boolean;
  /**
   * When true, never append `:thinking` to the OpenRouter model id (paid `qwen/qwen3.6-plus` only).
   * Extended thinking uses OpenRouter's `reasoning` JSON field instead of a `:thinking` slug.
   */
  openRouterReasoningViaBody?: boolean;
  stages: LlmStage[];
}

const ALL_TEXT_STAGES: LlmStage[] = ["research", "script", "imagePrompt", "social"];

export const LLM_MODELS: LlmModelEntry[] = [
  // Anthropic direct
  {
    id: "anthropic/claude-sonnet-4-5-20250514",
    label: "Claude Sonnet 4.5 (Anthropic)",
    group: "Anthropic",
    provider: "anthropic",
    apiModel: "claude-sonnet-4-5-20250514",
    supportsThinking: true,
    stages: ALL_TEXT_STAGES,
  },
  {
    id: "anthropic/claude-sonnet-4-6",
    label: "Claude Sonnet 4.6 (Anthropic)",
    group: "Anthropic",
    provider: "anthropic",
    apiModel: "claude-sonnet-4-6",
    supportsThinking: true,
    stages: ALL_TEXT_STAGES,
  },
  {
    id: "anthropic/claude-opus-4-5-20250514",
    label: "Claude Opus 4.5 (Anthropic)",
    group: "Anthropic",
    provider: "anthropic",
    apiModel: "claude-opus-4-5-20250514",
    supportsThinking: true,
    stages: ALL_TEXT_STAGES,
  },
  {
    id: "anthropic/claude-opus-4-6",
    label: "Claude Opus 4.6 (Anthropic)",
    group: "Anthropic",
    provider: "anthropic",
    apiModel: "claude-opus-4-6",
    supportsThinking: true,
    stages: ALL_TEXT_STAGES,
  },
  // Paid id `qwen/qwen3.6-plus` only — `:thinking` / `:free` slugs hit deprecated or wrong tiers on OpenRouter.
  {
    id: "openrouter/qwen/qwen3.6-plus",
    label: "Qwen 3.6 Plus (OpenRouter, thinking)",
    group: "OpenRouter",
    provider: "openrouter",
    apiModel: "qwen/qwen3.6-plus",
    supportsThinking: true,
    openRouterReasoningViaBody: true,
    stages: ALL_TEXT_STAGES,
  },
];

const byId = new Map(LLM_MODELS.map((m) => [m.id, m]));

export function getLlmModelOrThrow(id: string): LlmModelEntry {
  const m = byId.get(id);
  if (!m) {
    throw new Error(`Unknown model id: ${id}`);
  }
  return m;
}

export function listModelsForStage(stage: LlmStage): LlmModelEntry[] {
  return LLM_MODELS.filter((m) => m.stages.includes(stage));
}

/** Resolve OpenRouter `model` string (optional `:thinking` suffix for legacy rows only). */
export function resolveOpenRouterApiModel(
  entry: LlmModelEntry,
  useThinking: boolean
): string {
  if (entry.provider !== "openrouter") return entry.apiModel;

  if (entry.openRouterReasoningViaBody) {
    return entry.apiModel.replace(/:thinking$/, "").replace(/:free$/, "");
  }

  const wantSuffix = Boolean(useThinking && entry.supportsThinking);
  if (!wantSuffix) return entry.apiModel;
  if (entry.apiModel.endsWith(":thinking")) return entry.apiModel;
  if (entry.apiModel.endsWith(":free")) {
    return entry.apiModel.replace(/:free$/, ":thinking");
  }
  return `${entry.apiModel}:thinking`;
}

/** Default model ids per stage (matches previous hardcoded behavior) */
export const DEFAULT_LLM_BY_STAGE: Record<LlmStage, string> = {
  research: "openrouter/qwen/qwen3.6-plus",
  script: "openrouter/qwen/qwen3.6-plus",
  imagePrompt: "openrouter/qwen/qwen3.6-plus",
  social: "openrouter/qwen/qwen3.6-plus",
};

/** Gemini image generation models (allowlist). Nano Banana = gemini-2.5-flash-image per Google docs. */
export const GEMINI_IMAGE_MODELS = [
  {
    id: "gemini-2.5-flash-image",
    label: "Nano Banana (Gemini 2.5 Flash Image)",
  },
] as const;

export type GeminiImageModelId = (typeof GEMINI_IMAGE_MODELS)[number]["id"];

export const DEFAULT_GEMINI_IMAGE_MODEL: GeminiImageModelId = "gemini-2.5-flash-image";

export function getGeminiImageModelOrThrow(id: string): GeminiImageModelId {
  const found = GEMINI_IMAGE_MODELS.find((m) => m.id === id);
  if (!found) {
    throw new Error(`Unknown Gemini image model: ${id}`);
  }
  return found.id;
}
