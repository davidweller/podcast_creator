import {
  callClaude,
  callClaudeStreaming,
  SCRIPT_MODEL,
  DEFAULT_MODEL,
  type ScriptModelConfig,
} from "@/lib/claude/client";
import {
  MIN_SCRIPT_WORDS_60_MIN,
  TARGET_SCRIPT_WORDS_MIN,
  TARGET_SCRIPT_WORDS_MAX,
} from "@/lib/prompts/cozy-crime-constants";
import { buildNarrativeArchitecturePrompt } from "@/lib/prompts/narrative-architecture";
import { buildFullScriptPrompt } from "@/lib/prompts/script-90min";

export interface GenerateScript90MinOptions {
  modelConfig?: ScriptModelConfig;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

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
export async function generateScript90Min(
  researchText: string,
  options?: GenerateScript90MinOptions
): Promise<{
  script: string;
  narrativePlan: string;
  attempts: number;
}> {
  let attempts = 0;
  
  const modelId = options?.modelConfig?.modelId ?? SCRIPT_MODEL;
  const useThinking = options?.modelConfig?.useThinking ?? false;
  const thinkingBudget = options?.modelConfig?.thinkingBudget ?? 10000;

  console.log("[Script Gen] Starting generation with config:", {
    modelId,
    useThinking,
    thinkingBudget,
    researchWordCount: countWords(researchText),
  });

  // Stage 1: build the narrative architecture
  const architecturePrompt = buildNarrativeArchitecturePrompt(researchText);
  const narrativePlan = await callClaude(architecturePrompt, {
    maxTokens: 4096,
    temperature: 0.4,
    model: DEFAULT_MODEL,
  });
  attempts += 1;

  console.log("[Script Gen] Stage 1 complete. Narrative plan word count:", countWords(narrativePlan));

  // Stage 2: generate the full script in one streamed pass
  const scriptPrompt = buildFullScriptPrompt(researchText, narrativePlan.trim());
  const requestedMaxTokens = useThinking ? 32768 + thinkingBudget : 32768;
  
  console.log("[Script Gen] Stage 2 starting. Requested max_tokens:", requestedMaxTokens);
  
  const chunks: string[] = [];
  const streamResult = await callClaudeStreaming(
    scriptPrompt,
    (chunk) => chunks.push(chunk),
    {
      maxTokens: requestedMaxTokens,
      temperature: useThinking ? 1 : 0.7,
      model: modelId,
      useThinking,
      thinkingBudget,
    },
  );
  attempts += 1;

  let script = chunks.join("").trim();

  // Strip markdown code fences if the model wrapped the output
  if (script.startsWith("```")) {
    script = script.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/i, "").trim();
  }

  const scriptWordCount = countWords(script);
  
  console.log("[Script Gen] Stage 2 complete. Diagnostics:", {
    stopReason: streamResult.stopReason,
    inputTokens: streamResult.inputTokens,
    outputTokens: streamResult.outputTokens,
    requestedMaxTokens,
    scriptWordCount,
    targetWordCount: `${TARGET_SCRIPT_WORDS_MIN.toLocaleString()}-${TARGET_SCRIPT_WORDS_MAX.toLocaleString()}`,
    shortfall:
      scriptWordCount < TARGET_SCRIPT_WORDS_MIN
        ? `${TARGET_SCRIPT_WORDS_MIN - scriptWordCount} words short of 90-min target`
        : "None",
  });

  if (streamResult.stopReason === "max_tokens") {
    console.warn("[Script Gen] WARNING: Output was truncated due to max_tokens limit!");
  } else if (scriptWordCount < MIN_SCRIPT_WORDS_60_MIN) {
    console.warn(
      `[Script Gen] WARNING: Script below 60-minute minimum (${scriptWordCount} words, need at least ${MIN_SCRIPT_WORDS_60_MIN}).`
    );
  } else if (scriptWordCount < TARGET_SCRIPT_WORDS_MIN) {
    console.warn(
      `[Script Gen] WARNING: Model stopped early (${streamResult.stopReason}) with only ${scriptWordCount} words (90-min target: ${TARGET_SCRIPT_WORDS_MIN}).`
    );
  }

  return { script, narrativePlan: narrativePlan.trim(), attempts };
}
