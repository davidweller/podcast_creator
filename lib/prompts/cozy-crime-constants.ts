/**
 * cozy-crime-constants.ts
 *
 * Single source of truth for all Cozy Crime canonical rules.
 * Every prompt file imports from here. Rules are never defined
 * in individual prompt files.
 *
 * To change a rule, change it here. It will apply everywhere.
 */

// ---------------------------------------------------------------------------
// OPENING TEMPLATE
// ---------------------------------------------------------------------------

/**
 * The story hook that opens every episode.
 *
 * The single sentence before the welcome must name or directly invoke
 * the person at the centre of the story. It places them in a specific
 * moment and lets the mystery arrive through them, not around them.
 *
 * Fill: [LOCATION], [YEAR spelled out], [person in a specific moment that
 * carries the mystery].
 *
 * Example:
 *   "Tonight we are in New York City, in nineteen ten. Dorothy Arnold
 *    steps out of her family's home on a cold December morning, turns
 *    south toward Fifth Avenue, and walks out of the world."
 *
 * Never: weather first, streets first, period atmosphere first.
 * Always: the person first. The world arrives through them.
 */
export const STORY_HOOK_TEMPLATE =
  "Tonight we are in [LOCATION], in [YEAR spelled out as words]. [Single sentence naming the person and placing them in a specific moment connected to the mystery, present tense.]";

/**
 * The canonical welcome block. Must appear verbatim after the story hook,
 * every time, in every script.
 */
export const OPENING_WELCOME_BLOCK =
  "Good evening, and welcome. There will be no sudden sounds here, no raised voices, nothing to startle you from rest. If you find comfort in these stories and wish to follow us, please do.\n\nClose your eyes whenever you wish. Let your breathing slow. Let's begin.";

/**
 * Full canonical opening sequence for validation purposes.
 * [STORY HOOK] + OPENING_WELCOME_BLOCK + "Chapter One."
 */
export const OPENING_SEQUENCE_DESCRIPTION = `The opening follows this exact sequence:
1. Story hook: one sentence placing the person in a specific moment (present tense).
2. Welcome block (verbatim): "${OPENING_WELCOME_BLOCK}"
3. "Chapter One." Then begin with the person, not the environment.`;

// ---------------------------------------------------------------------------
// STYLE RULES
// ---------------------------------------------------------------------------

/**
 * Canonical style rules. Used verbatim in script generation,
 * improvement checking, and any other prompt that needs them.
 */
export const STYLE_RULES = `STYLE RULES: apply to every line without exception

Voice and tone:
- The narrator uses "I" and speaks directly to the listener throughout.
- Warm, personal, conversational. The listener should feel safe falling asleep at any moment.
- Reflective and respectful. Crime is never spectacle, outrage, or shock entertainment.
- No sensational language. No modern true crime tropes. No cliffhangers.
- No abrupt tonal shifts.

Language:
- No em-dashes or en-dashes anywhere. Use commas, semicolons, or restructure the sentence.
- No gore or graphic description of any kind. Violence happens offstage, in a gap between paragraphs.
- No exclamation marks. The narrator never raises their voice on the page.
- No numbered lists, no enumerated points. Legal cases, trial arguments, and theories must be told as story.
- No markers in the text such as [pause], [music], or [SFX]. The script is clean prose only.
- Never use: subscribe, like, bell icon, content, algorithm. Use: return, join us, you are welcome, you will find us here.
- Use contractions where natural. Write "don't" not "do not," "wasn't" not "was not," "couldn't" not "could not."
- Avoid passive voice. Write "Her friends called her Phyllis" not "She was known to her friends as Phyllis."
- Plain words over literary ones. "He was tired" rather than "weariness had settled upon him."
- All numbers must be spelled out as words. Write "three" not "3", "twenty-five" not "25", "nineteen ten" not "1910". This includes years, dates, and chapter headings.

The person, always:
- The victim is introduced as a person first. Always. Apply the Mother Test: would their family find this account dignified?
- No passage reduces a person to their role in the crime. They had a life. Tell it.
- Context arrives through people, not as standalone information. If you can remove a character's name from a paragraph without it changing, the paragraph is doing the wrong work.`;

// ---------------------------------------------------------------------------
// PHASE RULES (used in script generation and improvement checking)
// ---------------------------------------------------------------------------

export const PHASE_RULES = `PHASE RULES

Phase 1: Draw In (0-10 min, 1,200-1,500 words):
- Begins with the person at the centre of the story. Not the street, not the weather, not the period.
- The world arrives only in service of understanding who this person was.
- Chapter One opens with: who were they? The mystery arrives through them.

Phase 2: Settle (10-30 min, 2,400-3,000 words):
- The listener understands the life this person was living: their relationships, their constraints, their private hopes.
- Context arrives through people. Never as standalone background.
- The central event remains a felt presence throughout.

Phase 3: Unfold (30-60 min, 3,600-4,500 words):
- The events themselves, narrated as memory, not as report.
- Gaps and uncertainties acknowledged plainly, without drama or cliffhangers.
- Chapter breaks follow emotional completions, not topic changes.
- Trials and legal proceedings told as human scenes, not structured arguments.

Phase 4: Sit With It (60-80 min, 2,400-3,000 words):
- Aftermath, theories, unanswered questions.
- Theories presented as genuine uncertainties the narrator is weighing, not competing cases.
- The focus shifts from the puzzle back to the person before this phase ends.
- Pace is slower and quieter than Phase 3.

Phase 5: Rest (80-90 min, 900-1,200 words):
- Honour. Hold. Release.
- The narrator speaks about the people by name, with care.
- At least one full paragraph of quiet human reflection before the closing image.
- A still physical image from the world of the story. A street, a harbour, a building still standing.
- The farewell is three sentences at most. Thank the listener. Wish them rest. Do not invite them to return.
- Never end with a question, a revelation, or a call to action.
- The script ends with exactly: "Rest well. A peaceful night to you."`;

// ---------------------------------------------------------------------------
// CHAPTER BREAK RULES
// ---------------------------------------------------------------------------

export const CHAPTER_BREAK_RULES = `CHAPTER BREAKS

Chapters are punctuation, not filing cabinets. They mark a breath, a shift, a gentle transition from one emotional register to another. They are never tied to a topic. They are always tied to feeling.

Place a chapter break when:
- An emotional scene has ended and the story is moving to a different feeling.
- The focus shifts from one person or group to another.
- Time moves significantly forward or backward within the narrative.
- The listener needs a moment of rest before a passage of greater density.

Never place a chapter break when:
- A topic has been covered and the next topic is ready to begin.
- The word count suggests one is due.
- The previous chapter ended on something unresolved that the next chapter will answer.

Name chapters by number only, spelled out: "Chapter One.", "Chapter Two.", etc. Never by topic.
A 90-minute episode carries between four and seven chapter breaks. Fewer is usually better.`;

// ---------------------------------------------------------------------------
// THE CRIME AS THREAD
// ---------------------------------------------------------------------------

export const CRIME_AS_THREAD_RULE = `THE CRIME AS THREAD

The central event must remain a felt presence throughout every phase. The listener should never go more than a few minutes without understanding how what they are hearing connects to the story they came to hear.

After any paragraph of context or character introduction, the connection should be clear in the prose. The narrator can say it directly: "And this matters because..." or "Which is part of why nobody was quite prepared for what came next."

Context enriches. It does not replace.`;

// ---------------------------------------------------------------------------
// WORD COUNT
// ---------------------------------------------------------------------------

export const WORD_COUNT_GUIDE = `WORD COUNT

Spoken word at a calm, unhurried pace runs at approximately 120 to 130 words per minute.
Target for a 90-minute episode: 10,800 to 11,700 words.

Phase 1 (Draw In):     1,200-1,500 words
Phase 2 (Settle):      2,400-3,000 words
Phase 3 (Unfold):      3,600-4,500 words
Phase 4 (Sit With It): 2,400-3,000 words
Phase 5 (Rest):          900-1,200 words`;

// ---------------------------------------------------------------------------
// IMPROVEMENT CHECKER QUALITY RULES
// Used by the improvement prompt only. Expressed as checkable criteria.
// ---------------------------------------------------------------------------

export const QUALITY_CHECK_RULES = `QUALITY CHECKS: flag any deviation and suggest a fix

OPENING:
- The story hook names or directly invokes the person at the centre of the story. It does not open with weather, streets, period atmosphere, or a scene from which the person is absent.
- The welcome block appears verbatim: "${OPENING_WELCOME_BLOCK}"
- Chapter One begins with the person. The world arrives only in service of understanding who they were.
- No background, preamble, or general framing before the welcome.
- All numbers in the opening are spelled out as words, including the year.

STRUCTURE:
- Total word count is between 10,800 and 11,700.
- Between 4 and 7 chapter headings, numbered and spelled out: "Chapter One.", "Chapter Two.", etc.
- Chapter breaks follow emotional completions, not topic changes.

VOICE:
- The narrator uses "I" and speaks directly to the listener throughout.
- Contractions are used where natural. No formal "do not," "was not," "could not."
- Active voice throughout. No passive constructions.
- Tone is warm, unhurried, conversational. Never tense, urgent, or dramatic.

STYLE:
- No em-dashes or en-dashes anywhere.
- No gore or graphic description.
- No exclamation marks.
- No numbered or bulleted lists anywhere in the narration.
- No markers such as [pause], [music], [SFX].
- No banned words: subscribe, like, bell icon, content, algorithm.
- All numbers spelled out as words throughout the script.

CONTENT:
- The person at the centre is introduced as a human being, not a role or a victim.
- Every phase contains at least one reference that connects what the listener is hearing to the central event.
- Context arrives through people. No paragraph of pure background without a person at its centre.
- Phase 4 shifts from puzzle to person before it ends.
- Phase 5 includes at least one full paragraph of quiet human reflection before the closing image.
- The script ends with exactly: "Rest well. A peaceful night to you."`;

// ---------------------------------------------------------------------------
// DESCRIPTION TONE RULES
// Used by description and metadata prompts.
// ---------------------------------------------------------------------------

export const DESCRIPTION_TONE_RULES = `TONE RULES:
- Cozy Crime tone only: calm, literary, companionable.
- The person at the centre of the case is named and humanised before context or period detail arrives.
- No algorithm language, no hype, no modern YouTube clichés.
- No clickbait or sensationalism.
- No em-dashes.
- Never use: subscribe, like, bell icon, content, algorithm.
- Use instead: return, join us, you are welcome, you will find us here.`;

// ---------------------------------------------------------------------------
// SHORTS (trailer-specific; tone otherwise matches DESCRIPTION_TONE_RULES)
// ---------------------------------------------------------------------------

/**
 * Shorts are 30-60 second trailers. For this format only, opening with one
 * atmospheric sentence (time and place) is acceptable; the long-form
 * "person first" rule applies to full scripts, not to Shorts teasers.
 */
export const SHORTS_HOOK_RULE = `SHORTS HOOK: This is a 30-60 second trailer. You may open with one atmospheric sentence establishing time and place. Then present the compelling detail and close with an invitation to the full story. Tone must still match Cozy Crime: calm, no sensationalism, no banned words.`;
