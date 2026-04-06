/** Pipeline stages that can pick an LLM or image model */
export type LlmStage =
  | "research"
  | "script"
  | "imagePrompt"
  | "social";

export type ProviderId =
  | "anthropic"
  | "openai"
  | "google_gemini"
  | "openrouter"
  | "xai"
  | "mistral"
  | "cohere"
  | "groq"
  | "perplexity"
  | "google_cloud_tts";
