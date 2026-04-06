import type { ProviderId } from "@/lib/models/types";

export interface ByokProviderDef {
  id: ProviderId;
  label: string;
  envVar: string;
  /** Help text for the settings form */
  hint?: string;
}

export const BYOK_PROVIDERS: ByokProviderDef[] = [
  { id: "anthropic", label: "Anthropic", envVar: "ANTHROPIC_API_KEY" },
  { id: "openai", label: "OpenAI", envVar: "OPENAI_API_KEY" },
  { id: "google_gemini", label: "Google AI (Gemini)", envVar: "GOOGLE_GEMINI_API_KEY" },
  { id: "openrouter", label: "OpenRouter", envVar: "OPENROUTER_API_KEY" },
  { id: "xai", label: "xAI", envVar: "XAI_API_KEY" },
  { id: "mistral", label: "Mistral", envVar: "MISTRAL_API_KEY" },
  { id: "cohere", label: "Cohere", envVar: "COHERE_API_KEY" },
  { id: "groq", label: "Groq", envVar: "GROQ_API_KEY" },
  { id: "perplexity", label: "Perplexity", envVar: "PERPLEXITY_API_KEY" },
  {
    id: "google_cloud_tts",
    label: "Google Cloud (Speech / TTS)",
    envVar: "GOOGLE_APPLICATION_CREDENTIALS_JSON",
    hint: "Service account JSON (used when not relying on default credentials).",
  },
];
