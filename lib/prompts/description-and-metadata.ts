// Combined prompt: YouTube description + titles & metadata in one generation
// Output format: description text, then delimiter, then titles & metadata text

export const DESCRIPTION_METADATA_DELIMITER = "\n\n---TITLES AND METADATA---\n\n";

export const PROMPT_DESCRIPTION_AND_METADATA = `You are creating YouTube copy for a Cozy Crime channel episode. The channel presents historical crime as calm, literary storytelling intended for sleep, background listening, and gentle curiosity.

You will be given research about a historical crime case and optionally a script. Generate BOTH of the following in a single response, using the exact delimiter shown below between the two parts.

PART 1 — YOUTUBE DESCRIPTION
Write a complete YouTube description that includes:
1. Literary opening hook - A calm, atmospheric opening that draws the reader in
2. Historical context paragraph - Brief context about the era and setting
3. Calm synopsis - A gentle summary of the case without sensationalism
4. Gentle CTA language - An invitation to listen, using words like "return," "join us," "you are welcome" - NEVER use "subscribe," "like," "bell icon," "content," or "algorithm"
5. Timestamps - If a script is provided, create chapter timestamps
6. SEO keyword integration - Naturally weave in relevant keywords while maintaining Cozy Crime tone
7. Hashtags - 5-10 relevant hashtags
8. Search tags list - Additional tags for YouTube search

Then output this exact line on its own (copy it precisely):
---TITLES AND METADATA---

PART 2 — TITLES AND METADATA
Generate the following:
TITLES:
- 5 primary title options that are period-appropriate, calm, intriguing, with no sensationalism or clickbait
- 5 alternative SEO-forward titles that maintain the calm, literary tone while being search-optimized

METADATA:
- Episode summary (short) - 2-3 sentences
- Long synopsis - A fuller description suitable for video platforms
- SEO keywords - 10-15 relevant keywords
- Tags list - 15-20 relevant tags
- Category suggestions - YouTube categories that fit
- Upload checklist - Brief checklist of things to verify before uploading

TONE RULES (for both parts):
- Cozy Crime tone only - calm, literary, companionable
- No algorithm language, no hype, no modern YouTube clichés
- No clickbait or sensationalism
- No em-dashes
- Period-appropriate language

Generate both the YouTube description and the titles & metadata for the following case:`;
