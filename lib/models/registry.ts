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
  // Anthropic direct — Sonnet 4.6 is the app default for all text stages (see DEFAULT_LLM_BY_STAGE).
  {
    id: "anthropic/claude-sonnet-4-6",
    label: "Claude Sonnet 4.6 (Anthropic) — default",
    group: "Anthropic",
    provider: "anthropic",
    apiModel: "claude-sonnet-4-6",
    supportsThinking: true,
    stages: ALL_TEXT_STAGES,
  },
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

/** Default model ids per stage */
export const DEFAULT_LLM_BY_STAGE: Record<LlmStage, string> = {
  research: "anthropic/claude-sonnet-4-6",
  script: "anthropic/claude-sonnet-4-6",
  imagePrompt: "anthropic/claude-sonnet-4-6",
  social: "anthropic/claude-sonnet-4-6",
};

const byId = new Map(LLM_MODELS.map((m) => [m.id, m]));

export function getLlmModelOrThrow(id: string): LlmModelEntry {
  const m = byId.get(id);
  if (!m) {
    throw new Error(`Unknown model id: ${id}`);
  }
  return m;
}

export function listModelsForStage(stage: LlmStage): LlmModelEntry[] {
  const defId = DEFAULT_LLM_BY_STAGE[stage];
  const filtered = LLM_MODELS.filter((m) => m.stages.includes(stage));
  const defaultIdx = filtered.findIndex((m) => m.id === defId);
  if (defaultIdx <= 0) return filtered;
  const next = [...filtered];
  const [d] = next.splice(defaultIdx, 1);
  return [d, ...next];
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

export interface ImageModelEntry {
  id: string;
  label: string;
  provider: "google_gemini" | "openai";
  apiModel: string;
}

/** Image generation models (allowlist). Default first so provider optgroups list it at the top. */
export const IMAGE_MODELS = [
  {
    id: "openai/gpt-image-2",
    label: "ChatGPT Images 2.0 (gpt-image-2) — default",
    provider: "openai",
    apiModel: "gpt-image-2",
  },
  {
    id: "gemini/gemini-2.5-flash-image",
    label: "Nano Banana (Gemini 2.5 Flash Image)",
    provider: "google_gemini",
    apiModel: "gemini-2.5-flash-image",
  },
] as const satisfies readonly ImageModelEntry[];

export type ImageModelId = (typeof IMAGE_MODELS)[number]["id"];
export type ImageModelProvider = (typeof IMAGE_MODELS)[number]["provider"];

export const DEFAULT_IMAGE_MODEL: ImageModelId = "openai/gpt-image-2";

export function getImageModelOrThrow(id: string): (typeof IMAGE_MODELS)[number] {
  const found = IMAGE_MODELS.find((m) => m.id === id);
  if (!found) {
    throw new Error(`Unknown image model: ${id}`);
  }
  return found;
}

/** Legacy id from when gpt-image-3 was in the allowlist — map to current default. */
export function normalizeLegacyImageModelId(id: string): string {
  const t = id.trim();
  if (!t) return "";
  if (t === "openai/gpt-image-3") return DEFAULT_IMAGE_MODEL;
  return t;
}

/**
 * Bump when bundled defaults for LLM/image dropdowns change. If storage lacks this revision,
 * saved selections are skipped so selects show {@link DEFAULT_LLM_BY_STAGE} /
 * {@link DEFAULT_IMAGE_MODEL}; after the client saves prefs under the new revision, restores resume.
 */
export const MODEL_CHOICE_STORAGE_REVISION = "2";

export const LS_MODEL_CHOICE_STORAGE_REVISION_KEY = "cozycrime:modelChoiceStorageRevision";

export function shouldRestoreSavedModelChoicesFromStorage(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return (
      localStorage.getItem(LS_MODEL_CHOICE_STORAGE_REVISION_KEY) === MODEL_CHOICE_STORAGE_REVISION
    );
  } catch {
    return false;
  }
}

export function markModelChoiceStorageRevisionCurrent(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_MODEL_CHOICE_STORAGE_REVISION_KEY, MODEL_CHOICE_STORAGE_REVISION);
  } catch {
    /* ignore */
  }
}

/** Keys wiped when {@link MODEL_CHOICE_STORAGE_REVISION} advances so every tab shows bundled defaults once. */
const PERSISTED_MODEL_CHOICE_KEYS = [
  "cozycrime:llm:research",
  "cozycrime:llm:research:thinking",
  "cozycrime:llm:imagePrompt",
  "cozycrime:llm:imagePrompt:thinking",
  "cozycrime:llm:script",
  "cozycrime:llm:script:thinking",
  "cozycrime:llm:social",
  "cozycrime:llm:social:thinking",
  "cozycrime:image:model",
  "cozycrime:gemini:imageModel",
] as const;

export function clearPersistedModelChoiceKeys(): void {
  if (typeof window === "undefined") return;
  try {
    for (const k of PERSISTED_MODEL_CHOICE_KEYS) {
      localStorage.removeItem(k);
    }
  } catch {
    /* ignore */
  }
}
