/**
 * script-continue.ts
 *
 * Continuation prompt: expands a too-short script by continuing
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

  return `You are continuing a Cozy Crime podcast narration script for text-to-speech (about 60 minutes total).

You will be given:
1) A NARRATIVE PLAN that the script must follow.
2) An EXISTING SCRIPT draft that is too short.

Your job is to CONTINUE from the very end of the existing document. Add new material so the full episode reaches the required length, completes any remaining beats from the narrative plan, and finishes with the CLOSING SEGMENT and SIGN-OFF if those are missing or incomplete.

CRITICAL RULES
- Continue from the last character of the existing script. Do not restart. Do not rewrite, summarise, or repeat prior paragraphs.
- Preserve spoken-prose output only, with no bracket tags.
- Do not add titles, metadata lines, markdown headings, separator lines, or bracketed non-spoken section labels.
- Do not add inline structural labels such as "Cold Open:", "Intro Segment:", "Segment 1:", "Closing Segment:", or "Sign-Off:".
- Maintain continuity of names, timeline, and tone. Obey all Cozy Crime style rules below.
- Do not add stage directions, music cues, or any bracket tags.

LENGTH REQUIREMENT
- The combined document (existing plus your continuation) must be at least ${minWords} words in total.
- Aim for at least ${targetWords} words total if you can do so without padding or repetition.

${STYLE_RULES}

${PHASE_RULES}

${CHAPTER_BREAK_RULES}

${CRIME_AS_THREAD_RULE}

${WORD_COUNT_GUIDE}

NARRATIVE PLAN (follow this):
${args.narrativePlan.trim()}

EXISTING SCRIPT (continue from the end only; do not repeat):
${args.existingScript.trim()}

CURRENT WORD COUNT (entire existing document): ${args.currentWordCount}

Now output ONLY the continuation text to append after the existing script (no preamble). If the existing script ends mid-sentence, complete that sentence first, then continue. End with a complete closing and sign-off in spoken prose only, and stop immediately after the final sign-off line with no extra narrative.`;
}
