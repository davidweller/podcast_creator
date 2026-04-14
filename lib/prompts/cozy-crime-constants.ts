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
 * The story hook is exactly two sentences before the welcome.
 *
 * Sentence one names or directly invokes the person at the centre of
 * the story, places them in a specific moment, and lets the mystery
 * arrive through them, not around them.
 *
 * Sentence two tells the central crime or event plainly and without
 * ambiguity, in vivid but non-sensational language. After this
 * sentence the listener should understand clearly what happened and
 * why they are here, without gore or graphic detail.
 *
 * Fill: [LOCATION], [YEAR spelled out], [person in a specific moment that
 * carries the mystery], [sentence that states the crime or central event
 * clearly and calmly so there is no ambiguity about it].
 *
 * Example:
 *   "Tonight we are in New York City, in nineteen ten. Dorothy Arnold
 *    will vanish before the day is over, and her family will begin a
 *    search that never truly ends."
 *
 * Never: weather first, streets first, period atmosphere first.
 * Always: the person first. The world arrives through them.
 */
export const STORY_HOOK_TEMPLATE =
  "Tonight we are in [LOCATION], in [YEAR spelled out as words]. [Single sentence naming the person and placing them in a specific moment directly connected to the central crime or event, present tense, using vivid but calm language and stating clearly what happens so there is no ambiguity about the crime or why the listener is here.]";

/**
 * The intro paragraph appears after the two-sentence story hook and before
 * the welcome block. It outlines the case so the listener can decide whether
 * to listen.
 *
 * Content: themes and setting; key story beats (investigation, trial,
 * aftermath, notable figures); the case name; and a closing sentence that
 * names the case and frames it as told gently, with care for the historical
 * record and respect for those whose lives were altered.
 *
 * Tone: same Cozy Crime rules. Vivid but non-sensational, no gore, no hype.
 * A short paragraph (e.g. 3 to 6 sentences), not a list.
 */
export const INTRO_PARAGRAPH_RULE = `INTRO PARAGRAPH (after the story hook, before the welcome block)

A short paragraph that outlines the case so the listener has enough information to decide whether to listen. Include:
- Themes and setting (e.g. the darker currents beneath respectable society, the friendship that concealed betrayal).
- Key story elements: investigation, trial, aftermath, notable figures, as appropriate (e.g. the newly invented telegraph, the trial at the Old Bailey, the execution, a figure like Dickens and his response).
- The case name (e.g. "the Bermondsey Horror").
- A closing sentence that names the case and frames the story: "This is the story of [case name], told gently, with care for the historical record and respect for those whose lives were forever altered by the events of [time/place]."

Tone: vivid but non-sensational. No gore, no hype. Cozy Crime voice throughout. Write 3 to 6 sentences as flowing prose, not a list.`;

/**
 * The canonical welcome block. Must appear verbatim after the story hook
 * and intro paragraph, every time, in every script.
 */
export const OPENING_WELCOME_BLOCK =
  "Good evening, and welcome. There will be no sudden sounds here, no raised voices, nothing to startle you from rest. If you find comfort in these stories and wish to follow us, please do.\n\nClose your eyes whenever you wish. Let your breathing slow. Let's begin.";

/**
 * Reference description for long-form episode openings (TTS podcast format).
 * Verbatim welcome block may appear woven into the intro segment in natural language.
 */
export const OPENING_SEQUENCE_DESCRIPTION = `Long-form episode scripts use this opening shape:
1. Cold open (about thirty seconds to one minute): hook and value; person-centred when the case has a clear human core.
2. Intro segment (about one to two minutes): podcast name and tagline, episode title, overview for the listener, calm welcome tone (the spirit of: "${OPENING_WELCOME_BLOCK}" may appear as natural prose, not necessarily verbatim).
3. Main Segment 1 begins: foundation and human context first, not atmosphere for its own sake.`;

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
- No square brackets or bracket tags in spoken script lines. No music cues, SFX cues, or production tags.
- Never use: subscribe, like, bell icon, content, algorithm. Use: return, join us, you are welcome, you will find us here.
- Use contractions where natural. Write "don't" not "do not," "wasn't" not "was not," "couldn't" not "could not."
- Avoid passive voice. Write "Her friends called her Phyllis" not "She was known to her friends as Phyllis."
- Plain words over literary ones. "He was tired" rather than "weariness had settled upon him."
- All numbers must be spelled out as words. Write "three" not "3", "twenty-five" not "25", "nineteen ten" not "1910". This includes years, dates, and any headings that include numbers.

The person, always:
- The victim is introduced as a person first. Always. Apply the Mother Test: would their family find this account dignified?
- No passage reduces a person to their role in the crime. They had a life. Tell it.
- Context arrives through people, not as standalone information. If you can remove a character's name from a paragraph without it changing, the paragraph is doing the wrong work.`;

// ---------------------------------------------------------------------------
// PHASE RULES (used in script generation and improvement checking)
// ---------------------------------------------------------------------------

export const PHASE_RULES = `EPISODE SEGMENT PACING (60-minute narrative script)

Follow the narrative plan and keep structure implicit in spoken prose. Do not print segment headers, timestamps, metadata, or other non-spoken scaffolding. Approximate word budgets at 150 to 170 words per minute:

Cold open (about 0:30 to 1:00): roughly 120 to 220 words. Hook and value; person-centred where the case has a clear human core. Start immediately in-scene with no warm-up preamble.

Intro segment (about 0:20 to 0:45): roughly 60 to 120 words. Podcast name, tagline, host voice, episode title, what the listener will get. You may weave in the spirit of a calm welcome: no sudden shocks, invitation to rest, no hype. Keep this brief so momentum from the hook is not lost. Hard cap: maximum three sentences.

Main content (about 70 to 80 percent of total, roughly 6,300 to 8,000 words) across three segments:
- Segment 1: foundation, who people were, context through character. About 2,000 to 2,800 words.
- Segment 2: the heart of the case, tension and developments, trials or investigation as human story. About 2,000 to 2,800 words.
- Segment 3: aftermath, theories, resolution or open questions, return to the human cost. About 2,000 to 2,800 words.

Between segments: clear transitions in prose using sentence rhythm and paragraph flow.

Closing segment (about 2 to 3 minutes): roughly 350 to 500 words. Recap two or three takeaways in spoken prose (not a bulleted list in the script body). Gentle call to action: return, join us, you are welcome. No subscribe or algorithm language.

Sign-off (about 0:30): roughly 80 to 150 words. Final line and tagline energy that matches Cozy Crime: warm, calm, respectful.

Do not label spoken sections as "Chapter One" or use chapter numbering in the narration.`;

// ---------------------------------------------------------------------------
// CHAPTER BREAK RULES
// ---------------------------------------------------------------------------

export const CHAPTER_BREAK_RULES = `STRUCTURE AND TRANSITIONS (no chapter titles in narration)

Do not use "Chapter One," "Chapter Two," or any chapter numbering in the spoken script.

Use smooth prose transitions between major blocks. Create breath and emphasis through sentence rhythm, not markup.

Shift feeling through sentence rhythm and word choice, not through chapter labels.`;

// ---------------------------------------------------------------------------
// THE CRIME AS THREAD
// ---------------------------------------------------------------------------

export const CRIME_AS_THREAD_RULE = `THE CRIME AS THREAD

The central case must remain a felt presence throughout the episode. The listener should never go more than a few minutes without understanding how what they are hearing connects to the story they came to hear.

After any paragraph of context or character introduction, the connection should be clear in the prose. The narrator can say it directly: "And this matters because..." or "Which is part of why nobody was quite prepared for what came next."

Context enriches. It does not replace.`;

// ---------------------------------------------------------------------------
// WORD COUNT
// ---------------------------------------------------------------------------

/**
 * If the draft is shorter than this, the generator runs a continuation pass.
 * Set below the target band so minor shortfalls do not always trigger a second call.
 */
export const MIN_SCRIPT_WORDS_60_MIN = 8500;

/** Target script length: 60-minute episode (lower bound), ~150 wpm. */
export const TARGET_SCRIPT_WORDS_MIN = 9000;

/** Target script length: 60-minute episode (upper bound), ~165 wpm. */
export const TARGET_SCRIPT_WORDS_MAX = 10000;

export const WORD_COUNT_GUIDE = `WORD COUNT

Spoken narrative for this show is budgeted at roughly 150 to 170 words per minute for a one-hour episode.

Target total: 9,000 to 10,000 words. Do not finish far below 9,000 words unless padding would harm the story. If you approach 10,000 words, conclude naturally without repetition.

Approximate section budgets:
- Cold open: 120 to 220 words
- Intro segment: 60 to 120 words
- Main content (three segments combined): 6,300 to 8,000 words
- Closing: 350 to 500 words
- Sign-off: 80 to 150 words`;

// ---------------------------------------------------------------------------
// IMPROVEMENT CHECKER QUALITY RULES
// Used by the improvement prompt only. Expressed as checkable criteria.
// ---------------------------------------------------------------------------

export const QUALITY_CHECK_RULES = `QUALITY CHECKS: flag any deviation and suggest a fix

DOCUMENT STRUCTURE:
- The script covers cold open, intro, main content in three segments, closing, and sign-off as spoken prose only.
- No unspoken scaffolding in output: no title blocks, metadata lines, markdown headings, separator lines, or bracketed non-spoken section labels.
- No inline structural labels in prose, such as "Cold Open:", "Intro Segment:", "Segment 1:", "Segment 2:", "Segment 3:", "Closing Segment:", or "Sign-Off:".

OPENING AND HOOKS:
- Cold open delivers a clear hook and emotional or intellectual pull within the first minute of material.
- The first line drops directly into a concrete case moment, with no warm-up preamble.
- Intro establishes podcast identity, episode topic, and what the listener will get.
- Intro is brief and does not stall momentum from the hook.
- Intro is three sentences or fewer.
- Main segments flow logically with transitions; hooks or re-engagement roughly every few minutes of material where appropriate.

STRUCTURE:
- Total word count in the spoken body is ideally 9,000 to 10,000 words for a one-hour show. Flag if under 8,500; suggest expansion if under 9,000 without padding.
- No "Chapter One" style chapter labels in the spoken narration.

VOICE:
- First-person host narration where appropriate for this show; conversational and warm.
- Contractions where natural. Active voice preferred.
- Tone matches Cozy Crime: calm, respectful, not sensational or urgent.

STYLE:
- No em-dashes or en-dashes anywhere.
- No gore or graphic description.
- No exclamation marks.
- No numbered or bulleted lists in the spoken narration body (recap takeaways must be spoken sentences, not bullet lists).
- No square brackets or bracketed markers in spoken content. Flag any bracketed text, music cues, or SFX cues.
- No ALL CAPS for emphasis. No bold or italic markers in spoken lines.
- No banned words: subscribe, like, bell icon, content, algorithm. Prefer: return, join us, you are welcome, you will find us here.
- All numbers spelled out as words throughout the script (Cozy Crime production rule for TTS).

CONTENT:
- People at the centre of the case are treated as human beings, with dignity (Mother Test).
- The central case or mystery remains connected throughout; no long stretches of pure background without tying back to the story.
- Legal or sensitive topics use spoken disclaimers where appropriate.

CLOSING:
- Closing includes recap (as prose), gentle call to action, and sign-off consistent with the show brand.
- Do not require a specific verbatim closing sentence; the sign-off should feel complete and calm.
- The sign-off must be the final line. Flag any extra narrative, postscript, epilogue, or trailing note that appears after it.`;

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
