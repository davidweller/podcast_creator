/**
 * Carlin-style script generation: Stage 1 plan + Stage 2 seven sequential section calls.
 */

import { completeLlmText, streamLlmText } from "@/lib/llm/unified";
import {
  DEFAULT_LLM_BY_STAGE,
  getLlmModelOrThrow,
} from "@/lib/models/registry";
import { buildCarlinArchitecturePrompt } from "@/lib/prompts/carlin-architecture";
import { buildCarlinSectionPrompt } from "@/lib/prompts/carlin-section-prompt";
import {
  CARLIN_SECTIONS,
  getCarlinSectionMaxTokens,
} from "@/lib/prompts/carlin-sections";
import type { GenerateScript90MinOptions } from "./generator-90min";

export type CarlinProgressEvent =
  | {
      type: "section_start";
      index: number;
      total: number;
      label: string;
      min: number;
      max: number;
    }
  | { type: "chunk"; text: string }
  | { type: "section_end"; index: number; wordCount: number };

/** Emitted after DB persist by the route (not produced by generateScriptCarlin). */
export type CarlinDoneNdjsonEvent = {
  type: "done";
  script: string;
  attempts: number;
};

export type CarlinErrorNdjsonEvent = {
  type: "error";
  message: string;
};

export type CarlinNdjsonEvent =
  | CarlinProgressEvent
  | CarlinDoneNdjsonEvent
  | CarlinErrorNdjsonEvent;

export type GenerateCarlinScriptOptions = GenerateScript90MinOptions;

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function stripFences(text: string): string {
  let s = text.trim();
  if (s.startsWith("```")) {
    s = s.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/i, "").trim();
  }
  return s;
}

function resolveUnifiedOptions(options?: GenerateCarlinScriptOptions): {
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
  const llmModelId = options?.llmModelId ?? DEFAULT_LLM_BY_STAGE.script;
  getLlmModelOrThrow(llmModelId);
  return {
    llmModelId,
    useThinking: options?.useThinking ?? false,
    thinkingBudget: options?.thinkingBudget ?? 10000,
    projectId: options?.projectId,
  };
}

/**
 * Generate a Carlin-structure script in seven streamed section passes.
 */
export async function generateScriptCarlin(
  researchText: string,
  options: GenerateCarlinScriptOptions | undefined,
  onProgress: (event: CarlinProgressEvent) => void
): Promise<{ script: string; narrativePlan: string; attempts: number }> {
  let attempts = 0;
  const { llmModelId, useThinking, thinkingBudget, projectId } =
    resolveUnifiedOptions(options);

  console.log("[Carlin Script Gen] Starting:", {
    llmModelId,
    useThinking,
    thinkingBudget,
    researchWordCount: countWords(researchText),
  });

  const architecturePrompt = buildCarlinArchitecturePrompt(researchText);
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
    "[Carlin Script Gen] Stage 1 complete. Narrative plan word count:",
    countWords(narrativePlan)
  );

  let accumulator = "";

  for (let i = 0; i < CARLIN_SECTIONS.length; i++) {
    const spec = CARLIN_SECTIONS[i];
    const index = i + 1;

    onProgress({
      type: "section_start",
      index,
      total: CARLIN_SECTIONS.length,
      label: spec.label,
      min: spec.minWords,
      max: spec.maxWords,
    });

    const sectionPrompt = buildCarlinSectionPrompt({
      researchText,
      narrativePlan: narrativePlan.trim(),
      sectionSpec: spec,
      priorScriptText: accumulator,
      episodeTitle: options?.episodeTitle,
    });

    const baseTokens = getCarlinSectionMaxTokens(spec.id);
    const requestedMaxTokens = useThinking ? baseTokens + thinkingBudget : baseTokens;

    const chunks: string[] = [];
    await streamLlmText(
      "script",
      sectionPrompt,
      (chunk) => {
        chunks.push(chunk);
        onProgress({ type: "chunk", text: chunk });
      },
      {
        modelId: llmModelId,
        useThinking,
        thinkingBudget,
        maxTokens: requestedMaxTokens,
        temperature: useThinking ? 1 : 0.7,
        projectId,
      }
    );
    attempts += 1;

    const sectionText = stripFences(chunks.join("")).trim();
    const sectionWordCount = countWords(sectionText);

    accumulator = accumulator
      ? `${accumulator}\n\n${sectionText}`
      : sectionText;

    if (sectionWordCount < spec.minWords) {
      console.warn(
        `[Carlin Script Gen] Section "${spec.label}" below band (${sectionWordCount} words, target ${spec.minWords}-${spec.maxWords}).`
      );
    } else if (sectionWordCount > spec.maxWords + 200) {
      console.warn(
        `[Carlin Script Gen] Section "${spec.label}" well above band (${sectionWordCount} words, target ${spec.minWords}-${spec.maxWords}).`
      );
    }

    onProgress({
      type: "section_end",
      index,
      wordCount: sectionWordCount,
    });
  }

  console.log(
    "[Carlin Script Gen] Complete. Total words:",
    countWords(accumulator)
  );

  return {
    script: accumulator.trim(),
    narrativePlan: narrativePlan.trim(),
    attempts,
  };
}
