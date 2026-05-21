/**
 * Canonical Cozy Crime episode title for YouTube / podcast feeds.
 * Format: NNN | The [Case Name][: optional hook] | Location, Year
 */

import { DESCRIPTION_TONE_RULES } from "./cozy-crime-constants";

export const CANONICAL_TITLE_EXAMPLES = [
  "030 | The Murder of Sir Edmund Godfrey: 22 Executed | London, 1678",
  "029 | The Duel of Alexander Hamilton: Vice-President Shot | New Jersey, 1804",
  "028 | The Great Gold Railway Robbery | London-Paris, 1885",
  "027 | The Balham Mystery: The Death of Charles Bravo | London, 1876",
  "026 | The Paisley Witch Trial: Seven People Condemned | Scotland, 1697",
  "004 | The Cock Lane Ghost Affair: Scratching in the Dark | London, 1761",
] as const;

export const PROMPT_SOCIAL_EPISODE_TITLE = `You write the canonical episode title for the Cozy Crime channel — one line used on YouTube and podcast feeds.

Output exactly ONE line in this format (no quotes, no labels, no explanation):

NNN | The [case title][: optional subtitle hook] | Location, Year

Where:
- NNN is the three-digit episode number you are given (use it exactly).
- Segments are separated by " | " (space, pipe, space).
- The middle segment is the case title; the third segment is place and year only.

## Middle segment — case title patterns

Choose the pattern that best fits the case. The case title almost always begins with "The".

Common patterns (mix and match what fits the research):
- The Murder of [Full Name]: [hook]
- The Duel of [Full Name]: [hook]
- The Death of [Full Name] — or nested: The [Place] Mystery: The Death of [Full Name]
- The [Place] Mystery: [hook]
- The [Place] Witch Trial: [hook]
- The Great [Adjective] [Event Name] — e.g. The Great Gold Railway Robbery
- The [Place or Event] Affair: [vivid specific hook]
- The [Notorious Trial or Scandal]: [scale or outcome]

Use proper historical names and places from the research. Title Case for all major words in the middle segment.

## Subtitle hook (after a colon)

About half of strong titles add a short hook after a colon. Use one when it adds a concrete, intriguing fact; omit the colon and hook when the main title already carries full weight (e.g. some robberies or famous one-line cases).

Good hooks are short (roughly 2–7 words), factual, and specific:
- Scale or outcome: "22 Executed", "Seven People Condemned"
- Notable role or twist: "Vice-President Shot"
- Named victim or event: "The Death of Charles Bravo"
- Sensory or eerie detail: "Scratching in the Dark"

Avoid vague hooks ("A Shocking Crime", "Unsolved Mystery").

## Third segment — location and year

- Format: Place, Year (comma between place and four-digit year).
- Use the primary city, region, or country: London, Scotland, New Jersey.
- For cases spanning two cities or countries, use a hyphen: London-Paris, 1885.
- Use the most recognizable year of the case (trial, death, or peak of notoriety).
- Do not repeat the full middle title in this segment.

## Tone and constraints

- Literary and period-appropriate; calm intrigue, not tabloid true crime.
- No exclamation marks. No em-dashes. No clickbait ("You Won't Believe", "Shocking").
- ${DESCRIPTION_TONE_RULES}

## Reference examples (match this register and structure)

${CANONICAL_TITLE_EXAMPLES.map((t) => `- ${t}`).join("\n")}

Output only the finished single-line title.`;
