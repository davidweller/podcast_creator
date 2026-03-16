/**
 * description.ts
 *
 * Standalone YouTube description prompt. Uses DESCRIPTION_TONE_RULES from
 * cozy-crime-constants.ts. Structure aligned with description-and-metadata.ts
 * (same YouTube description template: opening, timestamps, topics, tags, about).
 */

import { DESCRIPTION_TONE_RULES } from "./cozy-crime-constants";

export const PROMPT_DESCRIPTION = `You are writing a YouTube description for a Cozy Crime channel episode. The channel presents historical crime as calm, literary storytelling intended for sleep, background listening, and gentle curiosity.

You will be given research about a historical crime case and optionally a script. Write a complete YouTube description using this exact structure and fill in the bracketed placeholders from the research and script.

OPENING (3 paragraphs)

Paragraph 1:
Tonight's Cozy Crime story explores [short intriguing summary of the case].

Paragraph 2:
In [time period], [location] was shaken by a disturbing [crime type]. When [key discovery or event] was uncovered, the case quickly became one of the most mysterious crimes of its time.

Paragraph 3:
The story leads through [locations, historical context, witnesses, or evidence], revealing rumours, strange clues, and competing theories that still puzzle historians today. But what really happened [central mystery question]?

Closing line (verbatim):
Cozy Crime tells slow, atmospheric crime stories designed for relaxation, quiet listening, and sleep.

━━━━━━━━━━━━━━━━━━━━

TIMESTAMPS

If a script is provided, create chapter timestamps in standard YouTube format (00:00 Chapter name). Adapt the chapter labels to the actual script.

━━━━━━━━━━━━━━━━━━━━

TOPICS IN THIS EPISODE

• [crime type]
• [location]
• [historical period]
• [important clue or event]
• [mystery theme]

(5 bullet points filled from this episode.)

━━━━━━━━━━━━━━━━━━━━

TAGS

cozy crime
true crime story
unsolved mystery
historical crime
sleep story
bedtime story
crime history
relaxing storytelling
calm history podcast
mystery storytelling
historical mysteries
sleep podcast

━━━━━━━━━━━━━━━━━━━━

ABOUT COZY CRIME

Every story of crime told on Cozy Crime begins with careful historical research and a deep respect for the people and places involved. We act as directors and editors of the process, using AI tools to assist with research and early drafting while we shape the narrative and verify the details before it becomes a finished episode.

The narration you hear is performed by a digital voice model created from a professional voice actor's recording, and the visuals are individually crafted artistic impressions designed to evoke the atmosphere of the period. Even with these tools, producing a single episode still requires many hours of research, writing, editing, and review.

While the stories are grounded in historical sources, Cozy Crime is designed primarily as calm, atmospheric storytelling intended for relaxation, curiosity, and sleep. For that reason, it should not be treated as a formal academic or scholarly source.

The images shown are AI-generated illustrations created to convey mood and setting. They may not represent the exact appearance of real people, locations, or events.

Thank you for spending time in quiet history with us.

━━━━━━━━━━━━━━━━━━━━

#cozycrime #sleepstories #truecrime #history #mystery

${DESCRIPTION_TONE_RULES}

Write the complete YouTube description for the following case:`;
