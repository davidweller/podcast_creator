/**
 * Carlin-style narrative techniques + Cozy Crime tone subset for Carlin pipeline.
 * Does NOT include the canonical Cozy opening hook template or verbatim welcome block.
 */

export const CARLIN_CORE_TECHNIQUES = `CORE NARRATIVE TECHNIQUES (Carlin-inspired, apply throughout this episode)

- Single narrator only. Theater-of-the-mind: vivid sensory scenes that transport the listener.
- Controlled tangents and asides (modern analogies, philosophical riffs) that always tie back to the main thread.
- Primary source quotes as short "audio footnotes" for credibility: weave quoted material gently into narration; do not list citations.
- Underlying themes (hubris, contingency, unintended consequences, human nature) weave in naturally; they should not overwhelm the story.
- Forward momentum: rising tension where the material supports it, then reflective payoff.
- Rhythmic, spoken language: easy to narrate aloud. You may suggest vocal energy through sentence length and word choice, not stage directions.
- "Martian" perspective: ask what it really felt like to be there, what it reveals about people, and what counterintuitive truths emerge.`;

export const CARLIN_COZY_TONE_RULES = `COZY CRIME TONE BASICS (must apply to every line in this pipeline)

These rules apply on top of the Carlin techniques. They replace the separate "Original" opening hook template and verbatim welcome block: you are not required to use the Cozy "Tonight we are in [LOCATION]..." story hook or the canonical welcome block unless the narrative plan calls for them.

Voice and delivery:
- Warm, respectful, audio-first. Crime is not spectacle; treat real people with dignity (Mother Test: would their family find this account fair and human?).

Language (strict):
- No em-dashes or en-dashes anywhere. Use commas, semicolons, or rewrite the sentence.
- No exclamation marks.
- No ALL CAPS for emphasis.
- Avoid passive voice where you can rewrite clearly in active voice.
- Use contractions where natural.
- Plain words over ornate ones unless the ornate word truly fits speech.
- All numbers spelled out as words everywhere (years, dates, counts, ages).

Banned words or phrases:
- Never use: subscribe, like, bell icon, content, algorithm.

Banned formatting in spoken output:
- No markdown headings, no horizontal rules (---), no bullet lists spoken as bullets (tell ideas in flowing prose instead).
- No square brackets or bracket tags in spoken lines. No music cues, SFX cues, or production tags.
- No "Chapter One" style chapter labels in narration.
- No inline structural labels such as "Cold Open:", "Segment 1:", or similar.
- No visual references the listener cannot hear (pointing, on-screen, look at the map, etc.).

Gore and sensation:
- No graphic gore. Violence can be acknowledged with restraint; do not linger on graphic detail.`;
