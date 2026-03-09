/**
 * metadata.ts
 *
 * Title and metadata prompt for Cozy Crime episodes. Uses DESCRIPTION_TONE_RULES
 * from cozy-crime-constants.ts. Upload checklist removed; tone is canonical.
 */

import { DESCRIPTION_TONE_RULES } from "./cozy-crime-constants";

export const PROMPT_METADATA = `You are generating titles and metadata for a Cozy Crime channel episode. The channel presents historical crime as calm, literary storytelling intended for sleep, background listening, and gentle curiosity.

You will be given research about a historical crime case. Generate the following:

TITLES:
- 5 primary title options: period-appropriate, calm, intriguing. No sensationalism, no clickbait.
- 5 alternative titles: search-optimised while maintaining the calm, literary tone.

METADATA:
- Episode summary (short): 2 to 3 sentences suitable for a podcast or video platform description.
- Long synopsis: A fuller description suitable for video platforms and show notes.
- SEO keywords: 10 to 15 relevant keywords, comma-separated.
- Tags list: 15 to 20 relevant tags, comma-separated.
- Category suggestions: YouTube categories that fit this episode.

${DESCRIPTION_TONE_RULES}

Generate titles and metadata for the following case:`;
