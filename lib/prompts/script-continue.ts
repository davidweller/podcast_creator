/**
 * script-continue.ts
 *
 * Continuation prompt: expands a too-short 90-minute script by continuing
 * from where it left off, without restarting or repeating.
 */

import {
  STYLE_RULES,
  PHASE_RULES,
  CHAPTER_BREAK_RULES,
  CRIME_AS_THREAD_RULE,
  WORD_COUNT_GUIDE,
  MIN_SCRIPT_WORDS_60_MIN,
  TARGET_SCRIPT_WORDS_MIN,
} from "./cozy-crime-constants";

export function buildScriptContinuationPrompt(args: {
  narrativePlan: string;
  existingScript: string;
  currentWordCount: number;
  minWords?: number;
  targetWords?: number;
}): string {
  const minWords = args.minWords ?? MIN_SCRIPT_WORDS_60_MIN;
  const targetWords = args.targetWords ?? TARGET_SCRIPT_WORDS_MIN;

  return `You are continuing a Cozy Crime narration script.

You will be given:
1) A NARRATIVE PLAN that the script must follow.
2) An EXISTING SCRIPT that is too short.

Your job is to CONTINUE the script from where it currently ends, adding new narration that extends the story naturally, completes any remaining phases and chapter beats from the narrative plan, and brings the script to the required length.

CRITICAL RULES
- Continue from the last paragraph of the existing script. Do not restart. Do not rewrite or summarise what has already been written.
- Do not repeat the story hook, intro paragraph, welcome block, or any chapter text already present.
- Do not add notes, headings, or metadata. Output ONLY narration text.
- Maintain continuity (names, timeline, tone) and obey all Cozy Crime style rules.
- You MUST end with exactly: "Rest well. A peaceful night to you."

LENGTH REQUIREMENT
- The combined script (existing + your continuation) must be at least ${minWords} words.
- Aim for at least ${targetWords} words total if you can do so without padding or repetition.

${STYLE_RULES}

${PHASE_RULES}

${CHAPTER_BREAK_RULES}

${CRIME_AS_THREAD_RULE}

${WORD_COUNT_GUIDE}

NARRATIVE PLAN (follow this):
${args.narrativePlan.trim()}

EXISTING SCRIPT (do not repeat; continue from the end):
${args.existingScript.trim()}

CURRENT WORD COUNT (existing script): ${args.currentWordCount}

Now continue the script. Output ONLY the continuation text. End with exactly: "Rest well. A peaceful night to you."`;
}

