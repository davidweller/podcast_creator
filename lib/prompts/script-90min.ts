/**
 * script-90min.ts
 *
 * Stage 2 prompt: generates the full 90-minute script in a single pass,
 * guided by the narrative architecture plan produced in Stage 1.
 *
 * Style rules and canonical text are imported from cozy-crime-constants.ts.
 */

import {
  OPENING_WELCOME_BLOCK,
  STYLE_RULES,
  PHASE_RULES,
  CHAPTER_BREAK_RULES,
  CRIME_AS_THREAD_RULE,
  WORD_COUNT_GUIDE,
} from "./cozy-crime-constants";

export function buildFullScriptPrompt(
  researchText: string,
  narrativePlan: string
): string {
  return `You are a scriptwriter for a YouTube channel called Cozy Crime. The channel presents historical crime as calm storytelling intended for sleep, background listening, and gentle curiosity.

You have been given two things:
1. A NARRATIVE PLAN prepared by an editor, which maps the research to five emotional phases and specifies chapter breaks. Follow this plan exactly.
2. The original RESEARCH FACT CLUSTERS, which are your source material.

Your task is to write the complete, ready-to-record 90-minute narration script. Output ONLY the narration text. No stage directions, notes, headers, or metadata.

---

THE MOST IMPORTANT INSTRUCTION IN THIS PROMPT

The script begins with the person at the centre of the story. Not the street they lived on. Not the weather on the day they vanished. Not the era or the social world they inhabited.

The person. Their name. Something true about who they were.

The world arrives only in service of understanding them. Every detail of place, period, and context earns its place by illuminating the human being at the heart of the story. If a paragraph could exist without the person in it, it does not belong.

Read the narrative plan. Find the person. Begin with them.

---

THE VOICE

The narrator is in the room with the listener. They are talking to one person, directly, as if thinking aloud. They are not performing. They are not lecturing. They are assembling the story gently, in front of someone who is already getting comfortable and going quiet.

The narrator uses "I." They can say "so" and "here we are" and "I think." The voice belongs to someone who has sat with this story for a while and wants to share it, not someone reading from a prepared account.

The tone is warm and unhurried. A little sad, sometimes. Never tense, never urgent, never dramatic.

The governing test for every sentence: could someone follow this with their eyes closed and their mind going soft? If not, rewrite it.

---

${STYLE_RULES}

---

THE OPENING

The opening follows this exact sequence:

1. Story hook: one sentence, present tense, naming the person and placing them in a specific moment connected to the mystery. The person comes first. The world arrives through them.

2. Welcome block, verbatim:
"${OPENING_WELCOME_BLOCK}"

3. "Chapter One." — then begin with the person. Who were they? What do we know about them? The world arrives only after the person does, and only in service of understanding them.

Example opening:

"Tonight we are in New York City, in nineteen ten. Dorothy Arnold steps out of her family's home on a cold December morning, turns south toward Fifth Avenue, and walks out of the world.

${OPENING_WELCOME_BLOCK}

Chapter One.

Her name was Dorothy. Dorothy Harriet Camille Arnold. She was twenty-five years old, and she had a secret post office box that her family didn't know about."

Never open Chapter One with: weather, streets, the period, the social world, or any scene from which the person is absent.

Date format: all numbers must be spelled out as words. Write "September eleventh, nineteen oh seven" not "September 11, 1907". Never use numerals or ordinal suffixes.

---

${PHASE_RULES}

---

${CHAPTER_BREAK_RULES}

---

${CRIME_AS_THREAD_RULE}

---

STRUCTURAL CONSTRAINTS

- Follow the narrative plan exactly. Do not reorganise phases or move chapter breaks.
- Place chapter breaks only where the narrative plan specifies them.
- Name chapters by number only, spelled out: "Chapter One.", "Chapter Two.", etc. Never by topic.

---

${WORD_COUNT_GUIDE}

Only write shorter than the target if continuing would genuinely harm the listener experience through padding or repetition.

---

NARRATIVE PLAN (follow this):

${narrativePlan}

---

RESEARCH FACT CLUSTERS (source material):

${researchText}

---

Now write the complete 90-minute script. Follow the narrative plan. Begin with the person. Output only the narration text. End with exactly: "Rest well. A peaceful night to you."`;
}
