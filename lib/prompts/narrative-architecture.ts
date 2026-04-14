/**
 * narrative-architecture.ts
 *
 * Stage 1 prompt: transforms episode research into a segment outline
 * that the script generation prompt will follow (cold open through sign-off).
 *
 * Style rules and word guidance are imported from cozy-crime-constants.ts.
 */

import {
  STYLE_RULES,
  CRIME_AS_THREAD_RULE,
  WORD_COUNT_GUIDE,
} from "./cozy-crime-constants";

export function buildNarrativeArchitecturePrompt(researchText: string): string {
  return `You are a narrative planner for the Cozy Crime podcast channel. Your task is NOT to write a script. Your task is to read the episode research packet and produce a structured plan that a scriptwriter will follow.

The episode is a roughly 60-minute, audio-first historical crime narrative for text-to-speech. The scriptwriter will use your plan plus the research to write cold open, intro, three main segments, closing, and sign-off.

---

THE MOST IMPORTANT INSTRUCTION IN THIS PROMPT

Before you do anything else, answer this question:

Who is the person at the heart of this story?

Write two or three sentences. Not their role alone. Not their address. Who were they, and what should a listener carry about them from the first minute to the last?

This answer is the spine of the plan. Everything else exists in relationship to this person.

---

${STYLE_RULES}

---

${CRIME_AS_THREAD_RULE}

---

YOUR OUTPUT

Produce a narrative plan with exactly these sections, in this order. Use planning notes only, not finished script prose.

THE PERSON
Two or three sentences: the human truth at the centre, as above.

COLD OPEN (0:30-1:00)
- Hook or teaser beats: what grabs attention immediately?
- Core value proposition: why listen?
- Curiosity or emotional connection: one line each.
- Plan the very first line as immediate in-scene narrative with concrete details; no warm-up preamble.

INTRO SEGMENT (0:20-0:45)
- Podcast name and tagline beats (Cozy Crime: historical crime told calmly for rest and curiosity).
- Episode title as it should be spoken.
- Host framing in first person: what the listener will learn or feel.
- Optional: note that the intro may include a calm welcome (no sudden shocks, invitation to rest) in natural language, not as stage directions.
- Keep this section tight so the script returns to story momentum quickly.
- Plan for a maximum of three sentences in the final script intro.

MAIN SEGMENT 1
- Topic or narrative job for this block (foundation: who people were, world through character).
- Key facts or beats to include (from research).
- One example or story beat to illustrate.
- Transition cue into Segment 2.

MAIN SEGMENT 2
- Topic or narrative job (the heart of the case, investigation or trial as human story).
- Key facts or beats.
- Example or story beat.
- Transition cue into Segment 3.

MAIN SEGMENT 3
- Topic or narrative job (aftermath, theories, unanswered questions, return to human cost).
- Key facts or beats.
- Example or story beat.
- Transition cue into closing.

CLOSING SEGMENT (2-3 minutes)
- Two or three recap points (as ideas for spoken sentences, not bullet text for the script).
- Call-to-action ideas: gentle, no "subscribe" or algorithm language; prefer return, join us, you are welcome.
- Tone: warm sign-off toward rest.

SIGN-OFF (0:30)
- Final spoken line concept and tagline energy.

CHARACTERS
List each key person. For each: name and role, one humanising detail, which segment they first matter in.

SENSITIVITY AND DISCLAIMERS
- Angles to handle carefully, claims to avoid, or disclaimers if the material touches legal, medical, or financial advice.

---

CONSTRAINTS

- The plan must centre the person, not the place or period, in THE PERSON and in Segment 1 priorities.
- Assign each major fact to one segment only where possible, so the scriptwriter can pace without repetition.
- The scriptwriter will produce about 9,000 to 10,000 words. Each segment section must list enough beats and material to support roughly: Segment 1 about 2,000 to 2,800 words, Segment 2 about 2,000 to 2,800 words, Segment 3 about 2,000 to 2,800 words (adjust within the band as the case demands).
- The plan should be 600 to 1,000 words. It is an instruction sheet, not a draft.
- Do not use "Descending Spiral," "phases," or "chapter break" language. Do not propose "Chapter One" style labels.

---

${WORD_COUNT_GUIDE}

---

EPISODE RESEARCH (source material):

${researchText}`;
}
