import { completeLlmText, streamLlmText } from "@/lib/llm/unified";
import {
  DEFAULT_LLM_BY_STAGE,
  getLlmModelOrThrow,
} from "@/lib/models/registry";
import type { ScriptModelConfig } from "@/lib/claude/client";
import {
  MIN_SCRIPT_WORDS_60_MIN,
  TARGET_SCRIPT_WORDS_MIN,
  TARGET_SCRIPT_WORDS_MAX,
} from "@/lib/prompts/cozy-crime-constants";
import { buildNarrativeArchitecturePrompt } from "@/lib/prompts/narrative-architecture";
import { buildScriptContinuationPrompt } from "@/lib/prompts/script-continue";
import { buildFullScriptPrompt } from "@/lib/prompts/script-90min";

export interface GenerateScript90MinOptions {
  /** Unified registry model id (preferred) */
  llmModelId?: string;
  useThinking?: boolean;
  thinkingBudget?: number;
  /** Legacy Anthropic-only config */
  modelConfig?: ScriptModelConfig;
  projectId?: number;
  /** Episode title for the script header and intro (project title). */
  episodeTitle?: string | null;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function resolveUnifiedOptions(
  options?: GenerateScript90MinOptions
): {
  llmModelId: string;
  useThinking: boolean;
  thinkingBudget: number;
  projectId?: number;
} {
  if (options?.modelConfig) {
    const legacyId = `anthropic/${options.modelConfig.modelId}`;
    getLlmModelOrThrow(legacyId);
    return {
      llmModelId: legacyId,
      useThinking: options.modelConfig.useThinking,
      thinkingBudget: options.modelConfig.thinkingBudget ?? 10000,
      projectId: options?.projectId,
    };
  }
  const llmModelId =
    options?.llmModelId ?? DEFAULT_LLM_BY_STAGE.script;
  getLlmModelOrThrow(llmModelId);
  return {
    llmModelId,
    useThinking: options?.useThinking ?? false,
    thinkingBudget: options?.thinkingBudget ?? 10000,
    projectId: options?.projectId,
  };
}

/**
 * Generate a ~60-minute episode script using a two-stage pipeline:
 *
 * Stage 1 — Narrative plan:
 *   Transforms research into segment outlines (cold open through sign-off).
 *
 * Stage 2 — Full script (streamed):
 *   Generates roughly 9,000 to 10,000 words in one pass, guided by the plan.
 *   Uses streaming because the output can be large.
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

  const { llmModelId, useThinking, thinkingBudget, projectId } =
    resolveUnifiedOptions(options);

  console.log("[Script Gen] Starting generation with config:", {
    llmModelId,
    useThinking,
    thinkingBudget,
    researchWordCount: countWords(researchText),
  });

  // Stage 1: narrative plan (same model as Stage 2)
  const architecturePrompt = buildNarrativeArchitecturePrompt(researchText);
  const narrativePlan = await completeLlmText("script", architecturePrompt, {
    modelId: llmModelId,
    maxTokens: 4096,
    temperature: 0.4,
    projectId,
    useThinking,
    thinkingBudget,
  });
  attempts += 1;

  console.log(
    "[Script Gen] Stage 1 complete. Narrative plan word count:",
    countWords(narrativePlan)
  );

  // Stage 2: full script (streamed)
  const scriptPrompt = buildFullScriptPrompt(
    researchText,
    narrativePlan.trim(),
    { episodeTitle: options?.episodeTitle }
  );
  const requestedMaxTokens = useThinking ? 32768 + thinkingBudget : 32768;

  console.log("[Script Gen] Stage 2 starting. Requested max_tokens:", requestedMaxTokens);

  const chunks: string[] = [];
  const streamResult = await streamLlmText("script", scriptPrompt, (chunk) => chunks.push(chunk), {
    modelId: llmModelId,
    useThinking,
    thinkingBudget,
    maxTokens: requestedMaxTokens,
    temperature: useThinking ? 1 : 0.7,
    projectId,
  });
  attempts += 1;

  let script = chunks.join("").trim();

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
        ? `${TARGET_SCRIPT_WORDS_MIN - scriptWordCount} words short of 60-min target`
        : "None",
  });

  if (streamResult.stopReason === "max_tokens") {
    console.warn("[Script Gen] WARNING: Output was truncated due to max_tokens limit!");
  } else if (scriptWordCount < MIN_SCRIPT_WORDS_60_MIN) {
    console.warn(
      `[Script Gen] WARNING: Script below continuation threshold (${scriptWordCount} words, target band starts at ${MIN_SCRIPT_WORDS_60_MIN}).`
    );
  } else if (scriptWordCount < TARGET_SCRIPT_WORDS_MIN) {
    console.warn(
      `[Script Gen] WARNING: Model stopped early (${streamResult.stopReason}) with only ${scriptWordCount} words (60-min target: ${TARGET_SCRIPT_WORDS_MIN}).`
    );
  }

  if (scriptWordCount < MIN_SCRIPT_WORDS_60_MIN) {
    console.log("[Script Gen] Below continuation threshold. Running continuation pass...");

    const baseScript = script.trim();
    const baseWordCount = countWords(baseScript);

    const continuationPrompt = buildScriptContinuationPrompt({
      narrativePlan: narrativePlan.trim(),
      existingScript: baseScript,
      currentWordCount: baseWordCount,
      minWords: MIN_SCRIPT_WORDS_60_MIN,
      targetWords: TARGET_SCRIPT_WORDS_MIN,
    });

    const continuationMaxTokens = useThinking ? 16384 + thinkingBudget : 16384;
    console.log("[Script Gen] Continuation starting. Requested max_tokens:", continuationMaxTokens);

    const continuationChunks: string[] = [];
    const continuationResult = await streamLlmText(
      "script",
      continuationPrompt,
      (chunk) => continuationChunks.push(chunk),
      {
        modelId: llmModelId,
        useThinking,
        thinkingBudget,
        maxTokens: continuationMaxTokens,
        temperature: useThinking ? 1 : 0.7,
        projectId,
      }
    );
    attempts += 1;

    let continuationText = continuationChunks.join("").trim();
    if (continuationText.startsWith("```")) {
      continuationText = continuationText
        .replace(/^```[a-z]*\n?/i, "")
        .replace(/\n?```$/i, "")
        .trim();
    }

    console.log("[Script Gen] Continuation complete. Diagnostics:", {
      stopReason: continuationResult.stopReason,
      inputTokens: continuationResult.inputTokens,
      outputTokens: continuationResult.outputTokens,
    });

    script = `${baseScript}\n\n${continuationText}`.trim();

    const finalWordCount = countWords(script);
    console.log("[Script Gen] Final script word count after continuation:", finalWordCount);
    if (finalWordCount < MIN_SCRIPT_WORDS_60_MIN) {
      console.warn(
        `[Script Gen] WARNING: Still below continuation threshold after continuation (${finalWordCount} words, need at least ${MIN_SCRIPT_WORDS_60_MIN}).`
      );
    }
  }

  return { script, narrativePlan: narrativePlan.trim(), attempts };
}
