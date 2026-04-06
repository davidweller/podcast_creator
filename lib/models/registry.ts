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
  // OpenRouter only exposes qwen/qwen3.6-plus:free (base qwen/qwen3.6-plus has no providers).
  // No :thinking variant in the public model list — Extended thinking is disabled for this row.
  {
    id: "openrouter/qwen/qwen3.6-plus",
    label: "Qwen 3.6 Plus (OpenRouter, free)",
    group: "OpenRouter",
    provider: "openrouter",
    apiModel: "qwen/qwen3.6-plus:free",
    supportsThinking: false,
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

/** Resolve OpenRouter model id including :thinking when enabled */
export function resolveOpenRouterApiModel(
  entry: LlmModelEntry,
  useThinking: boolean
): string {
  if (entry.provider !== "openrouter") return entry.apiModel;
  if (!useThinking || !entry.supportsThinking) return entry.apiModel;
  // Thinking is a variant suffix, not stacked after :free (would be invalid).
  if (entry.apiModel.endsWith(":free")) {
    return entry.apiModel.replace(/:free$/, ":thinking");
  }
  return `${entry.apiModel}:thinking`;
}

/** Default model ids per stage (matches previous hardcoded behavior) */
export const DEFAULT_LLM_BY_STAGE: Record<LlmStage, string> = {
  research: "anthropic/claude-sonnet-4-6",
  script: "anthropic/claude-sonnet-4-6",
  imagePrompt: "anthropic/claude-sonnet-4-6",
  social: "anthropic/claude-sonnet-4-6",
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
