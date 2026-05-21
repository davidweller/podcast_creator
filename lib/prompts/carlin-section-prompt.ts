/**
 * Per-section prompt for Carlin-style staged script generation.
 */

import { CARLIN_CORE_TECHNIQUES, CARLIN_COZY_TONE_RULES } from "./carlin-style";
import type { CarlinSectionSpec } from "./carlin-sections";

const COZY_CRIME_CHANNEL = "Cozy Crime — Historical Crime to Fall Asleep To";

const PRIOR_TAIL_WORDS = 1500;

function takeLastWords(text: string, maxWords: number): string {
  const w = text.trim().split(/\s+/).filter(Boolean);
  if (w.length <= maxWords) return w.join(" ");
  return w.slice(-maxWords).join(" ");
}

export interface BuildCarlinSectionPromptArgs {
  researchText: string;
  narrativePlan: string;
  sectionSpec: CarlinSectionSpec;
  /** Full script so far (empty for cold open). Used for continuity tail only. */
  priorScriptText: string;
  episodeTitle?: string | null;
}

export function buildCarlinSectionPrompt(args: BuildCarlinSectionPromptArgs): string {
  const {
    researchText,
    narrativePlan,
    sectionSpec,
    priorScriptText,
    episodeTitle,
  } = args;

  const titleLine =
    episodeTitle?.trim() ||
    "Derive a clear episode title from the research and use it naturally where this section needs it.";

  const priorTail =
    priorScriptText.trim().length > 0
      ? takeLastWords(priorScriptText, PRIOR_TAIL_WORDS)
      : "(no prior script text yet; you are writing the opening of the episode.)";

  const outputContract =
    sectionSpec.id === "outro"
      ? `OUTPUT CONTRACT FOR THIS SECTION

Write the conclusion and outro in spoken prose first. After the final spoken line of the episode, write a separate short postscript that begins with exactly:

WORD_COUNT_NOTE:

Include an estimated total word count for the full episode script if stitched in order, and a short list of suggested subtle music sting points in plain sentences.

Spoken lines before WORD_COUNT_NOTE must follow all Cozy tone rules and must not contain markdown.`
      : `OUTPUT CONTRACT FOR THIS SECTION

Output only the spoken prose for this named section. Do not add word counts, author notes, music lists, or appendix material. Do not write "to be continued." End when this section is complete.`;

  return `# Role

You are writing ONE section of a solo-narrated podcast script for the channel ${COZY_CRIME_CHANNEL}. Historical crime. Carlin-inspired narrative craft with Cozy Crime restraint and respect.

${CARLIN_CORE_TECHNIQUES}

${CARLIN_COZY_TONE_RULES}

---

# This pass only

SECTION: ${sectionSpec.label}
WORD BAND FOR THIS PASS: about ${sectionSpec.minWords} to ${sectionSpec.maxWords} words. Aim inside the band without padding. If research is thin, stay honest and use the lower end of the band without inventing facts.

Scope: ${sectionSpec.scope}

Instructions:
${sectionSpec.instructions}

Do not:
${sectionSpec.antiPatterns}

---

# Episode title (guidance)

${titleLine}

---

# Continuity

The following is the END of the script written so far (last ${PRIOR_TAIL_WORDS} words maximum), for voice and story continuity only. Do not repeat large blocks from it. Continue forward as the next part of the same episode.

${priorTail}

---

${outputContract}

---

# Narrative plan (follow)

${narrativePlan.trim()}

---

# Episode research (facts and sources)

${researchText}

---

Write this section now. Spoken prose first; obey the output contract above.`;
}
