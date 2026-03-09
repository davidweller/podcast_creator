/**
 * description.ts
 *
 * Standalone YouTube description prompt. Uses DESCRIPTION_TONE_RULES from
 * cozy-crime-constants.ts. Structure aligned with description-and-metadata.ts
 * (person-first opening, no historical context before the person).
 */

import { DESCRIPTION_TONE_RULES } from "./cozy-crime-constants";

export const PROMPT_DESCRIPTION = `You are writing a YouTube description for a Cozy Crime channel episode. The channel presents historical crime as calm, literary storytelling intended for sleep, background listening, and gentle curiosity.

You will be given research about a historical crime case and optionally a script. Write a complete YouTube description structured as follows:

1. Opening hook: Begin with the person at the centre of the case. Their name, something human and specific about them, and the mystery that surrounds them. One short paragraph. No period atmosphere before the person arrives.

2. Case synopsis: A calm, unhurried summary of what happened and why this story endures. Weave in historical context only where it illuminates the person or the events. No sensationalism.

3. Invitation to listen: A warm, companionable invitation using words like "return," "join us," "you are welcome," "you will find us here." Never use: subscribe, like, bell icon, content, algorithm.

4. Timestamps: If a script is provided, create chapter timestamps in standard YouTube format.

5. Hashtags: 5 to 10 relevant hashtags in keeping with the Cozy Crime tone.

6. Search tags: A list of 15 to 20 additional tags for YouTube search, comma-separated.

${DESCRIPTION_TONE_RULES}

Write the complete YouTube description for the following case:`;
