/**
 * narrative-architecture.ts
 *
 * Stage 1 prompt: transforms research fact clusters into a narrative
 * architecture that the script generation prompt will follow.
 *
 * Style rules and canonical text are imported from cozy-crime-constants.ts.
 */

import {
  STYLE_RULES,
  PHASE_RULES,
  CHAPTER_BREAK_RULES,
  CRIME_AS_THREAD_RULE,
  WORD_COUNT_GUIDE,
  INTRO_PARAGRAPH_RULE,
} from "./cozy-crime-constants";

export function buildNarrativeArchitecturePrompt(researchText: string): string {
  return `You are a narrative architect for the Cozy Crime YouTube channel. Your task is NOT to write a script. Your task is to read a set of research fact clusters and produce a structured narrative plan that a scriptwriter will follow.

The plan must follow the Descending Spiral structure: the episode begins with the person at its centre, and slowly, gently widens into the world around them before narrowing back toward the human and the intimate. The organising principle is always the listener's emotional connection to a real human being, not the logical order of information, and not the atmosphere of the period.

---

THE MOST IMPORTANT INSTRUCTION IN THIS PROMPT

Before you do anything else, answer this question:

Who is the person at the heart of this story?

Write two or three sentences. Not their role. Not their address. Not the date they disappeared or died. Who were they? What do you know about them that a listener should carry from the first sentence to the last?

This answer is the spine of the entire narrative plan. Everything else, the world, the events, the theories, exists only in relationship to this person. Write this before you write anything else, and let it shape every decision that follows.

---

THE FIVE PHASES

${PHASE_RULES}

---

YOUR OUTPUT

Produce a narrative plan with exactly these sections, in this order:

THE PERSON
Two or three sentences answering: who was this person, and what should the listener carry about them from beginning to end? This is not biographical summary. It is the human truth at the centre of the story.

OPENING MOMENT
A specific moment in which this person is present and alive. The mystery arrives within or immediately after this moment, but the person comes first. This can be as simple as their name, something they did, something they wanted. It must not be weather, streets, or period atmosphere.

CASE OUTLINE FOR OPENING (intro paragraph)
The script will include a short paragraph after the two-sentence story hook and before the welcome block. It outlines the case so the listener can decide whether to listen. Provide planning notes for that paragraph:
- Case name (e.g. "the Bermondsey Horror").
- Two to four key themes or story beats to include (e.g. Victorian respectability and betrayal; the telegraph and fugitive hunt; the trial at the Old Bailey; the execution and Dickens's campaign).
- A suggested framing line (e.g. "This is the story of X, told gently, with care for the historical record and respect for those whose lives were forever altered by...").

${INTRO_PARAGRAPH_RULE}

CLOSING IMAGE
A specific physical image from the world of the story: still, quiet, and connected to the person rather than the period. Something the listener can hold in their mind as they sleep.

CHARACTERS
List each key person who will appear in the script. For each:
- Name and role in the story.
- One specific human detail (a habit, a choice, a relationship) that makes them a person rather than a role.
- The phase in which they should be introduced and why.

PHASE 1 — DRAW IN
Which facts establish who this person was and plant the mystery? The world and period may appear here only in service of the person. List the facts and their emotional purpose.

PHASE 2 — SETTLE
Which facts reveal the life this person was living: their relationships, their private world, their constraints and desires? How does context arrive through the person rather than as background? List the facts and their emotional purpose.

PHASE 3 — UNFOLD
Which facts constitute the events themselves? Arrange them in the order they were discovered or experienced, not logical reconstruction. Note any gaps or uncertainties and how they should be handled.

PHASE 4 — SIT WITH IT
Which facts relate to the aftermath, investigation, theories, and unanswered questions? How will the focus shift from puzzle back to person before this phase ends?

PHASE 5 — REST
What remains of this person? What has time done to their story? What should the listener carry into sleep?

CHAPTER BREAKS
Propose where 4 to 7 chapter breaks should fall. For each:
- After which moment or passage it occurs.
- What emotional shift it marks. Not what topic change it marks.
Fewer breaks is usually better. Each must feel genuinely earned.

THE CRIME AS THREAD
${CRIME_AS_THREAD_RULE}

---

CONSTRAINTS

- The plan must begin with the person, not the place or the period.
- Assign each fact to ONE phase only.
- Organise by emotional purpose, not by topic.
- The scriptwriter will produce a full 90-minute script (10,800 to 11,700 words). Your plan must support that length. For each phase section (PHASE 1 through PHASE 5), list enough material and beats so the scriptwriter can fill the stated word ranges without padding (e.g. Phase 3: 3,600–4,500 words).
- The plan should be 600 to 1,000 words. It is an instruction sheet, not a draft.
- Do not write prose. Write clear, direct planning notes.

---

${WORD_COUNT_GUIDE}

---

RESEARCH FACT CLUSTERS:

${researchText}`;
}
