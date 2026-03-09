/**
 * description-and-metadata.ts
 *
 * Combined prompt: YouTube description + titles & metadata in one generation.
 * Output format: description text, then delimiter, then titles & metadata text.
 *
 * Tone rules are imported from cozy-crime-constants.ts.
 */

import { DESCRIPTION_TONE_RULES } from "./cozy-crime-constants";

export const DESCRIPTION_METADATA_DELIMITER = "\n\n---TITLES AND METADATA---\n\n";

export const PROMPT_DESCRIPTION_AND_METADATA = `You are creating YouTube copy for a Cozy Crime channel episode. The channel presents historical crime as calm, literary storytelling intended for sleep, background listening, and gentle curiosity.

You will be given research about a historical crime case and optionally a script. Generate BOTH of the following in a single response, using the exact delimiter shown below between the two parts.

---

PART 1 — YOUTUBE DESCRIPTION

Write a complete YouTube description structured as follows:

1. Opening hook — Begin with the person at the centre of the case. Their name, something human and specific about them, and the mystery that surrounds them. One short paragraph. No period atmosphere before the person arrives.

2. Case synopsis — A calm, unhurried summary of what happened and why this story endures. Weave in historical context only where it illuminates the person or the events. No sensationalism.

3. Invitation to listen — A warm, companionable invitation using words like "return," "join us," "you are welcome," "you will find us here." Never use: subscribe, like, bell icon, content, algorithm.

4. Timestamps — If a script is provided, create chapter timestamps in standard YouTube format (0:00 Introduction, etc.).

5. Hashtags — 5 to 10 relevant hashtags in keeping with the Cozy Crime tone.

6. Search tags — A list of 15 to 20 additional tags for YouTube search, comma-separated.

Then output this exact line on its own:
---TITLES AND METADATA---

---

PART 2 — TITLES AND METADATA

TITLES:
- 5 primary title options: period-appropriate, calm, intriguing. No sensationalism, no clickbait.
- 5 alternative titles: search-optimised while maintaining the calm, literary tone.

METADATA:
- Episode summary (short): 2 to 3 sentences suitable for a podcast or video platform description.
- Long synopsis: A fuller description suitable for video platforms and show notes.
- SEO keywords: 10 to 15 relevant keywords, comma-separated.
- Tags list: 15 to 20 relevant tags, comma-separated.
- Category suggestions: YouTube categories that fit this episode.

---

${DESCRIPTION_TONE_RULES}

---

Generate both the YouTube description and the titles and metadata for the following case:`;


/**
 * Standalone description prompt (without metadata).
 * Retained for contexts where only the description is needed.
 */
export const PROMPT_DESCRIPTION = `You are writing a YouTube description for a Cozy Crime channel episode. The channel presents historical crime as calm, literary storytelling intended for sleep, background listening, and gentle curiosity.

You will be given research about a historical crime case and optionally a script. Write a complete YouTube description structured as follows:

1. Opening hook — Begin with the person at the centre of the case. Their name, something human and specific about them, and the mystery that surrounds them. One short paragraph. No period atmosphere before the person arrives.

2. Case synopsis — A calm, unhurried summary of what happened and why this story endures. Weave in historical context only where it illuminates the person or the events. No sensationalism.

3. Invitation to listen — A warm, companionable invitation using words like "return," "join us," "you are welcome," "you will find us here." Never use: subscribe, like, bell icon, content, algorithm.

4. Timestamps — If a script is provided, create chapter timestamps in standard YouTube format.

5. Hashtags — 5 to 10 relevant hashtags in keeping with the Cozy Crime tone.

6. Search tags — A list of 15 to 20 additional tags for YouTube search, comma-separated.

${DESCRIPTION_TONE_RULES}

Write the complete YouTube description for the following case:`;
