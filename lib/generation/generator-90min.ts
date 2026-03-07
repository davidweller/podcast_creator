import {
  callClaude,
  callClaudeStreaming,
  SCRIPT_MODEL,
  DEFAULT_MODEL,
} from "@/lib/claude/client";
import { buildNarrativeArchitecturePrompt } from "@/lib/prompts/narrative-architecture";
import { buildFullScriptPrompt } from "@/lib/prompts/script-90min";

/**
 * Generate a 90-minute script using a two-stage pipeline:
 *
 * Stage 1 — Narrative Architecture:
 *   Transforms research into an emotional arc plan with phase assignments,
 *   chapter placements, opening/closing images, and character introductions.
 *
 * Stage 2 — Full Script (streamed):
 *   Generates the complete ~11,000-word script in a single pass, guided by
 *   the narrative plan. Uses streaming because the output is large enough
 *   to exceed the Anthropic SDK's 10-minute non-streaming timeout.
 */
export async function generateScript90Min(researchText: string): Promise<{
  script: string;
  narrativePlan: string;
  attempts: number;
}> {
  let attempts = 0;

  // Stage 1: build the narrative architecture
  const architecturePrompt = buildNarrativeArchitecturePrompt(researchText);
  const narrativePlan = await callClaude(architecturePrompt, {
    maxTokens: 4096,
    temperature: 0.4,
    model: DEFAULT_MODEL,
  });
  attempts += 1;

  // Stage 2: generate the full script in one streamed pass
  const scriptPrompt = buildFullScriptPrompt(researchText, narrativePlan.trim());
  const chunks: string[] = [];
  await callClaudeStreaming(
    scriptPrompt,
    (chunk) => chunks.push(chunk),
    {
      maxTokens: 24576,
      temperature: 0.7,
      model: SCRIPT_MODEL,
    },
  );
  attempts += 1;

  let script = chunks.join("").trim();

  // Strip markdown code fences if the model wrapped the output
  if (script.startsWith("```")) {
    script = script.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/i, "").trim();
  }

  return { script, narrativePlan: narrativePlan.trim(), attempts };
}
