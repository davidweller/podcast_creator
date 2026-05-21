/**
 * description-and-metadata.ts
 *
 * Combined prompt: YouTube description + practical upload tags in one generation.
 * Output format: description text, then delimiter, then tags only.
 *
 * Tone rules are imported from cozy-crime-constants.ts.
 */

import { DESCRIPTION_TONE_RULES } from "./cozy-crime-constants";

/** Legacy delimiter (older generations); parser accepts both. */
export const DESCRIPTION_METADATA_DELIMITER_LEGACY = "\n\n---TITLES AND METADATA---\n\n";

export const DESCRIPTION_TAGS_DELIMITER = "\n\n---TAGS---\n\n";

/** Delimiters tried in order when splitting description from tags. */
export const DESCRIPTION_METADATA_DELIMITERS = [
  DESCRIPTION_TAGS_DELIMITER,
  DESCRIPTION_METADATA_DELIMITER_LEGACY,
] as const;

export const PROMPT_DESCRIPTION_AND_METADATA = `You are a YouTube packaging strategist specialising in cozy crime, bedtime mystery, and sleep-story content.

You are optimising a single finished video for upload to a small Cozy Crime channel. The channel presents historical or village-style mysteries as calm, literary storytelling intended for sleep, background listening, and gentle curiosity.

Viewers may be looking for:
- a relaxing mystery to fall asleep to
- gentle storytelling with intrigue
- cozy detective atmosphere
- historical or village mystery vibes
- low-stress crime storytelling rather than intense true crime

You will be given research and optionally a final script for this exact video. Optimise ONLY this single video, not the whole channel.

Your goals:
- Keep the tone elegant, atmospheric, and sleep-friendly.
- Avoid sensational true-crime phrasing unless clearly appropriate to the material.
- Make the packaging feel intriguing but calming.
- Prioritise realistic performance for a smaller channel (no exaggerated promises).

Generate BOTH of the following in a single response, using the exact delimiter shown below between the two parts.

---

YOUTUBE DESCRIPTION (first part of your response — used as the public description field)

Write the complete YouTube description for this single video. Do not include section labels such as "PART 1", "OPENING", or similar headings in the output. Use this structure and fill in the bracketed placeholders from the research and script.

Paragraph 1:
Tonight's Cozy Crime story explores [short intriguing summary of the case].

Paragraph 2:
In [time period], [location] was shaken by a disturbing [crime type]. When [key discovery or event] was uncovered, the case quickly became one of the most mysterious crimes of its time.

Paragraph 3:
The story leads through [locations, historical context, witnesses, or evidence], revealing rumours, strange clues, and competing theories that still puzzle historians today. But what really happened [central mystery question]?

Closing line (include verbatim):
Cozy Crime tells slow, atmospheric crime stories designed for relaxation, quiet listening, and sleep.

Then add this separator and section:
━━━━━━━━━━━━━━━━━━━━

TOPICS IN THIS EPISODE

• [crime type]
• [location]
• [historical period]
• [important clue or event]
• [mystery theme]

(Use 5 bullet points filled from this episode; adjust labels as needed.)

Then add this separator and section (verbatim):
━━━━━━━━━━━━━━━━━━━━

ABOUT COZY CRIME

Every story of crime told on Cozy Crime begins with careful historical research and a deep respect for the people and places involved. We act as directors and editors of the process, using AI tools to assist with research and early drafting while we shape the narrative and verify the details before it becomes a finished episode.

The narration you hear is performed by a digital voice model created from a professional voice actor's recording, and the visuals are individually crafted artistic impressions designed to evoke the atmosphere of the period. Even with these tools, producing a single episode still requires many hours of research, writing, editing, and review.

While the stories are grounded in historical sources, Cozy Crime is designed primarily as calm, atmospheric storytelling intended for relaxation, curiosity, and sleep. For that reason, it should not be treated as a formal academic or scholarly source.

The images shown are AI-generated illustrations created to convey mood and setting. They may not represent the exact appearance of real people, locations, or events.

Thank you for spending time in quiet history with us.

Do not include timestamps, a TAGS section, or hashtags at the end of the description.

Then output this exact line on its own:
---TAGS---

---

PRACTICAL TAG SET (second part of your response — YouTube upload tags only)

Output only this section. Start with the heading exactly as shown, then the tags on the following lines.

7. Practical tag set

Provide a comma-separated list of 15 to 25 tags mixing:
- topic tags (case, setting, era),
- format tags (bedtime story, cozy mystery, sleep story),
- and audience-intent tags (relaxing mystery, fall asleep, gentle storytelling).

Do not output keywords analysis, title options, hashtags, thumbnail overlay text, traffic recommendations, or upload summaries.

Constraints for tags:
- Maintain ${DESCRIPTION_TONE_RULES}
- No clickbait or sensational true-crime language.
- No exclamation marks.

Generate the YouTube description (first), then the practical tag set (second), for the following video:`;


/**
 * Standalone description prompt (without metadata).
 * Retained for contexts where only the description is needed.
 * Uses the same YouTube description template as the description section of PROMPT_DESCRIPTION_AND_METADATA.
 */
export const PROMPT_DESCRIPTION = `You are writing a YouTube description for a Cozy Crime channel episode. The channel presents historical crime as calm, literary storytelling intended for sleep, background listening, and gentle curiosity.

You will be given research about a historical crime case and optionally a script. Write a complete YouTube description using this exact structure and fill in the bracketed placeholders from the research and script. Do not include section labels such as "OPENING" in the output.

Paragraph 1:
Tonight's Cozy Crime story explores [short intriguing summary of the case].

Paragraph 2:
In [time period], [location] was shaken by a disturbing [crime type]. When [key discovery or event] was uncovered, the case quickly became one of the most mysterious crimes of its time.

Paragraph 3:
The story leads through [locations, historical context, witnesses, or evidence], revealing rumours, strange clues, and competing theories that still puzzle historians today. But what really happened [central mystery question]?

Closing line (verbatim):
Cozy Crime tells slow, atmospheric crime stories designed for relaxation, quiet listening, and sleep.

━━━━━━━━━━━━━━━━━━━━

TOPICS IN THIS EPISODE

• [crime type]
• [location]
• [historical period]
• [important clue or event]
• [mystery theme]

(5 bullet points filled from this episode.)

━━━━━━━━━━━━━━━━━━━━

ABOUT COZY CRIME

Every story of crime told on Cozy Crime begins with careful historical research and a deep respect for the people and places involved. We act as directors and editors of the process, using AI tools to assist with research and early drafting while we shape the narrative and verify the details before it becomes a finished episode.

The narration you hear is performed by a digital voice model created from a professional voice actor's recording, and the visuals are individually crafted artistic impressions designed to evoke the atmosphere of the period. Even with these tools, producing a single episode still requires many hours of research, writing, editing, and review.

While the stories are grounded in historical sources, Cozy Crime is designed primarily as calm, atmospheric storytelling intended for relaxation, curiosity, and sleep. For that reason, it should not be treated as a formal academic or scholarly source.

The images shown are AI-generated illustrations created to convey mood and setting. They may not represent the exact appearance of real people, locations, or events.

Thank you for spending time in quiet history with us.

Do not include timestamps, a TAGS section, or hashtags at the end.

${DESCRIPTION_TONE_RULES}

Write the complete YouTube description for the following case:`;
