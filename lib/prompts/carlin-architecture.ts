/**
 * Stage 1 prompt: Carlin-style narrative plan for historical crime (Cozy Crime channel).
 */

import { CRIME_AS_THREAD_RULE } from "./cozy-crime-constants";

export function buildCarlinArchitecturePrompt(researchText: string): string {
  return `You are a narrative planner for historical crime longform audio scripts. Your task is NOT to write finished script prose. Your task is to read the episode research packet and produce a structured plan a scriptwriter will follow in seven sequential generation passes (Carlin-style bands).

The channel is Cozy Crime — historical crime told calmly and respectfully for audio. The scriptwriter will blend Carlin-inspired narrative energy with Cozy Crime tone basics: no em-dashes, no exclamation marks, all numbers as words, dignity for real people, crime as a thread across the episode.

---

ANCHOR QUESTION (answer first)

Who is the person at the heart of this story?

Write two or three sentences. Not their role alone. Who were they, and what should a listener carry about them from early context through the end?

This answer is the spine. Everything else relates to it.

---

${CRIME_AS_THREAD_RULE}

---

YOUR OUTPUT STRUCTURE

Produce a plan with exactly these sections in this order. Use planning notes only, not draft script lines.

THE PERSON
Two or three sentences: the human truth at the centre, as above.

COLD OPEN PLAN (target written output later: about 350 to 450 words)
- Hook beats and the first-scene image
- Sensory anchors
- Hook question or teaser beat for the cold open ending

INTRODUCTION AND FRAMING PLAN (about 500 to 650 words later)
- Episode title or theme as it should be spoken
- Why this story matters now
- Arc tease and themes
- Disclaimer angles if sources are thin or contested

DEEP BACKGROUND PLAN (about 1,800 to 2,200 words later)
- Institutions, forces, geography, period texture
- Key people to introduce before the main drive
- Martian questions (what did it feel like to live then)
- Which facts belong ONLY in this block to avoid repetition later

MAIN NARRATIVE PLAN (about 3,800 to 4,300 words later)
- Chronological phases (three to five phases) as beat lists
- Quotes or trial moments to place here (not in climax if they fit better here)
- Transition beats between phases within this block

CLIMAX AND IMMEDIATE AFTERMATH PLAN (about 1,100 to 1,400 words later)
- Decisive turning points
- Immediate fallout the listener must feel before analysis

BROADER CONSEQUENCES AND ANALYSIS PLAN (about 1,000 to 1,300 words later)
- Long-term significance
- Accessible debates or misconceptions to address lightly
- Thematic payoffs

CONCLUSION AND OUTRO PLAN (about 400 to 600 words later plus a short word-count postscript in the final generation pass)
- Closing emotional register
- Single Martian takeaway to echo
- Final line energy
- Optional series teaser if justified by research

FACT ALLOCATION RULES
- Assign each major fact to ONE section where possible. If a fact must recur, say how to refer back without repeating full detail.
- Avoid duplicating the hook scene in later sections beyond a single echo line if needed.
- The plan should be about 900 to 1,400 words total.

---

EPISODE RESEARCH (source material):

${researchText}`;
}
