import { getStoredSecret } from "@/lib/db/app-secrets";
import type { ProviderId } from "@/lib/models/types";

const ENV_KEYS: Record<ProviderId, string | undefined> = {
  anthropic: process.env.ANTHROPIC_API_KEY,
  openai: process.env.OPENAI_API_KEY,
  google_gemini: process.env.GOOGLE_GEMINI_API_KEY,
  openrouter: process.env.OPENROUTER_API_KEY,
  xai: process.env.XAI_API_KEY,
  mistral: process.env.MISTRAL_API_KEY,
  cohere: process.env.COHERE_API_KEY,
  groq: process.env.GROQ_API_KEY,
  perplexity: process.env.PERPLEXITY_API_KEY,
  google_cloud_tts: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
};

/**
 * Prefer user-stored key (SQLite), then environment variable.
 */
export function resolveProviderApiKey(provider: ProviderId): string | null {
  const stored = getStoredSecret(provider);
  if (stored?.trim()) return stored.trim();
  const env = ENV_KEYS[provider]?.trim();
  return env || null;
}

export function maskKeyHint(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const v = value.trim();
  if (v.length <= 8) return "********";
  return `${v.slice(0, 4)}…${v.slice(-4)}`;
}
