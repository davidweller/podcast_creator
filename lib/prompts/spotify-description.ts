/**
 * Spotify podcast episode description prompt.
 * Output: a single, compact sentence (or at most two very short sentences) similar in length and feel
 * to: "When scratching and knocking sounds began appearing around the bed of young Elizabeth Parsons,
 * and when a voice of knocks seemed to accuse a living man of poisoning the woman he had loved,
 * the case became one of the most discussed and debated mysteries of Georgian England."
 * Uses DESCRIPTION_TONE_RULES from cozy-crime-constants.ts for tone.
 */

import { DESCRIPTION_TONE_RULES } from "./cozy-crime-constants";

export const PROMPT_SPOTIFY_DESCRIPTION = `You are writing a very short Spotify podcast episode description for the Cozy Crime channel. The channel presents historical crime as calm, literary storytelling intended for sleep, background listening, and gentle curiosity.

Your target is a single flowing sentence, or at most two short sentences, similar in length and mood to this example:

"When scratching and knocking sounds began appearing around the bed of young Elizabeth Parsons, and when a voice of knocks seemed to accuse a living man of poisoning the woman he had loved, the case became one of the most discussed and debated mysteries of Georgian England."

Guidelines:
- Write in that same calm, literary, atmospheric style.
- Focus on one vivid opening situation and how it unfolds into a mystery.
- Weave in key names, places, or time period if they are clear from the research.
- Do not include headings or labels.
- Do not summarise the whole episode or spoil the outcome.
- Avoid filler phrases like "In this episode" or "Join us as".
- Keep the language sleep-safe and non-sensational.
- After your short description sentence(s), add this exact closing line on its own line:
  A relaxing cozy crime true story told slowly for sleep, quiet listening.

Tone:
${DESCRIPTION_TONE_RULES}

Output only the finished description sentence(s) followed by the closing line, with no extra commentary or formatting.`;
