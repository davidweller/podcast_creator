/**
 * Script generation prompt style: Original (Cozy pipeline) vs. Carlin (section-by-section).
 */

export type ScriptPromptStyle = "original" | "carlin";

export const SCRIPT_PROMPT_STYLES: { id: ScriptPromptStyle; label: string }[] = [
  { id: "original", label: "Original" },
  { id: "carlin", label: "Carlin Style" },
];

export const DEFAULT_SCRIPT_PROMPT_STYLE: ScriptPromptStyle = "original";

export function parseScriptPromptStyle(body: unknown): ScriptPromptStyle {
  if (!body || typeof body !== "object") {
    return DEFAULT_SCRIPT_PROMPT_STYLE;
  }
  const raw = typeof (body as Record<string, unknown>).promptStyle === "string"
    ? ((body as Record<string, unknown>).promptStyle as string).trim().toLowerCase()
    : "";
  if (raw === "carlin") return "carlin";
  return "original";
}
