/**
 * metadata.ts
 *
 * Standalone YouTube upload tags prompt for Cozy Crime episodes.
 */

import { DESCRIPTION_TONE_RULES } from "./cozy-crime-constants";

export const PROMPT_METADATA = `You are generating YouTube upload tags for a Cozy Crime channel episode. The channel presents historical crime as calm, literary storytelling intended for sleep, background listening, and gentle curiosity.

You will be given research about a historical crime case. Output only a practical tag set.

Start with this heading exactly:

7. Practical tag set

Then provide a comma-separated list of 15 to 25 tags mixing:
- topic tags (case, setting, era),
- format tags (bedtime story, cozy mystery, sleep story),
- and audience-intent tags (relaxing mystery, fall asleep, gentle storytelling).

Do not output title options, keywords analysis, hashtags, thumbnail text, or upload summaries.

${DESCRIPTION_TONE_RULES}

Generate tags for the following case:`;
