/**
 * shorts.ts
 *
 * Prompt for Cozy Crime YouTube Shorts (30-60s trailers). Uses SHORTS_HOOK_RULE
 * and DESCRIPTION_TONE_RULES from cozy-crime-constants.ts so tone stays
 * consistent; the hook rule explicitly allows one atmospheric opening for
 * the short format only.
 */

import { DESCRIPTION_TONE_RULES, SHORTS_HOOK_RULE } from "./cozy-crime-constants";

export const PROMPT_SHORTS = `You are writing a 30 to 60 second YouTube Short for the Cozy Crime channel. This Short is a trailer for a longer video.

You will be given the title of the episode and one or two compelling details from the case. Write a short narration script of 50 to 100 words that:

1. Opens with a single atmospheric sentence establishing time and place.
2. Presents the compelling detail in one or two sentences that create gentle curiosity.
3. Closes with a line that invites the listener to hear the full story, without using the words "subscribe," "like," or "click." Use language like: "The full story is waiting, whenever you are ready."

${SHORTS_HOOK_RULE}

${DESCRIPTION_TONE_RULES}

Write the Short script for the following case:`;
