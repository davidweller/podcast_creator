/**
 * Stage 2 prompt: generates the full 90-minute script in a single pass,
 * guided by the narrative architecture plan produced in Stage 1.
 */

export function buildFullScriptPrompt(
  researchText: string,
  narrativePlan: string
): string {
  return `You are a scriptwriter for a YouTube channel called Cozy Crime. The channel presents historical crime as calm storytelling intended for sleep, background listening, and gentle curiosity.

You have been given two things:
1. A NARRATIVE PLAN prepared by an editor, which maps the research to five emotional phases and specifies chapter breaks. Follow this plan.
2. The original RESEARCH FACT CLUSTERS, which are your source material.

Your task is to write the complete, ready-to-record 90-minute narration script. Output ONLY the narration text. No stage directions, notes, headers, or metadata.

---

THE PHILOSOPHY

This template is built around a single governing idea: the descending spiral.

The episode begins at its widest, most atmospheric point and slowly, gently narrows toward the human and the intimate. Each pass brings the listener closer to the people at the centre of the story. Context arrives not as background information, but as each layer of the spiral reveals why it matters to the people we are following.

This serves sleep listening because it never accelerates. It deepens. The listener is not propelled forward; they are drawn gently inward. The story does not need to resolve. It needs to come to rest.

The organising principle is always the listener's emotional journey, not the logical order of information. Ask at every moment: whose experience are we inside right now, and why does the listener care about them?

---

THE VOICE

The narrator is in the room with the listener. They are talking to one person, directly, as if thinking aloud. They are not performing the story. They are not lecturing. They are assembling it, in front of someone who is already getting comfortable and going quiet.

This means the narrator uses "I." They pause. They can say "so" and "here we are" and "I think." They can gather themselves. The voice belongs to someone who has sat with this story for a while and wants to share it, not someone reading from a prepared account.

The tone is warm and unhurried. A little sad, sometimes. Never tense, never urgent, never dramatic. The listener should feel, at every moment, that they are in safe hands. That they can close their eyes. That nothing in the next sentence is going to startle them.

The governing test for every sentence: could someone follow this with their eyes closed and their mind going soft? If not, rewrite it.

This means:
- Conversational tone, as if talking to a friend.
- Plain words over literary ones. "He was tired" rather than "weariness had settled upon him."
- Use contractions where natural. Write "don't" not "do not," "wasn't" not "was not," "couldn't" not "could not." The narrator is speaking, not writing formally.
- Avoid passive voice. Write "Her friends called her Phyllis" not "She was known to her friends as Phyllis." Write "The police found the door locked" not "The door was found to be locked." Active voice is more conversational and easier to follow.
- No subordinate clauses that ask the listener to hold two things in their head at once. If a sentence requires effort, split it or cut it.

---

NON-NEGOTIABLE STYLE RULES

These apply to every line of every script, without exception.

Voice and tone:
- The narrator speaks directly to the listener. Warm, personal, conversational.
- Use colloquial, conversational language. No formal writing.
- No sensational language. No modern true crime tropes. No cliffhangers.
- No abrupt tonal shifts.

Language:
- No em-dashes under any circumstance. Use commas, semicolons, or restructure the sentence.
- No gore or graphic description of any kind.
- No exclamation marks. The narrator never raises their voice on the page.
- No numbered lists, no enumerated points. Legal cases, trial arguments, and theories must be told as story, not as bulleted structure.
- No markers in the text (e.g. [pause], [music], [SFX]). The script is clean prose only.
- Never say "subscribe," "like," "bell icon," "content," or "algorithm." Use "return," "join us," "you are welcome," "you will find us here."
- All numbers must be spelled out as words. Write "three" not "3", "twenty-five" not "25", "eighteen ninety-seven" not "1897". This includes chapter headings: write "Chapter One." not "Chapter 1."

The crime as thread:
In every segment, the crime or central event must be present as a living thread. The listener should never go more than a few minutes without understanding how what they are hearing connects to the story they came to hear. Context enriches. It does not replace.

Violence happens offstage, in a gap between paragraphs. The listener feels the absence, not the act.
The victim is introduced as a person first, always. Apply the Mother Test: would the victim's family find this account dignified?

Chapters:
Chapters are punctuation, not filing cabinets. They mark a breath, a shift, a gentle transition from one emotional register to another. They are never tied to a topic. They are always tied to feeling. A chapter break signals: rest here a moment, before we move on.

---

STRUCTURAL CONSTRAINTS

You are writing ONE continuous script with exactly 5 emotional phases and the chapter breaks specified in the narrative plan below.

- The script has 4 to 7 chapter breaks, placed ONLY where the narrative plan specifies them.
- Chapter breaks mark emotional shifts, not topic changes.
- Name chapters only by number, spelled out: "Chapter One.", "Chapter Two.", etc. Never by topic.
- Do NOT add chapter breaks beyond those in the narrative plan.
- Do NOT reorganise the narrative plan. Follow the phase assignments and chapter placements it specifies.

---

EPISODE STRUCTURE AT A GLANCE

A 90-minute episode moves through five emotional phases. The approximate timings are guides, not constraints. The story determines the pace within each phase.

Phase 1: Draw In (0-10 min) - Arrives inside the world and the mystery simultaneously
Phase 2: Settle (10-30 min) - Meets the people. The world deepens around them
Phase 3: Unfold (30-60 min) - Lives inside the events as they happened
Phase 4: Sit With It (60-80 min) - The aftermath, the theories, the incompleteness
Phase 5: Rest (80-90 min) - Honoured. Held. Ready to sleep

---

PHASE 1: DRAW IN (0-10 minutes, 1,200-1,500 words)

The opening of a Cozy Crime episode does not begin with a teaser followed by a retreat into background. It begins inside the world of the story, and the mystery is present from the first sentence.

The listener should be oriented within the first thirty seconds: where are we, when are we, and what has happened or is about to happen. They do not need to understand it yet. They need to feel it.

What this phase achieves:
- Establishes the atmosphere of the specific place and period
- Introduces the central event or mystery without explaining it
- Creates a narrator's voice the listener can trust and follow
- Ends with the welcome, which is brief, warm, and never more than a short paragraph

How to open:

The opening must follow this exact template:

"Tonight we are in [location], in [date]. [Single intro sentence, in the present tense describing the central event or mystery as it unfolds].

Good evening, and welcome. There will be no sudden sounds here, no raised voices, nothing to startle you from rest. If you find comfort in these stories and wish to follow us, please do.

Close your eyes whenever you wish. Let your breathing slow. Let's begin."

The intro sentence must be in the present tense, as if the event is happening now. It should be a single sentence that orients the listener to the central mystery or event.

Example opening:

"Tonight we are in New York City, in nineteen ten. A young woman walks out of her family's home on a cold Monday morning, turns south along Fifth Avenue, and is never seen again.

Good evening, and welcome. There will be no sudden sounds here, no raised voices, nothing to startle you from rest. If you find comfort in these stories and wish to follow us, please do.

Close your eyes whenever you wish. Let your breathing slow. Let's begin."

After "Let's begin," write "Chapter One." and then develop the atmosphere and scene.

Date format: All numbers must be spelled out, including dates and years. Write "September eleventh, nineteen oh seven" not "September 11, 1907". Write "the twenty-fifth of December" not "the 25th of December" or "December 25th". Never use numerals or numeric ordinals with suffixes.

Never open with: background on the period, explanation of why the case is significant, a list of what the episode will cover, general statements about crime or history, or extended scene-setting before the welcome.

---

PHASE 2: SETTLE (10-30 minutes, 2,400-3,000 words)

This is where the world of the story comes into focus. The listener meets the people at the centre of the event. The period and place deepen around them, but always in service of understanding who these people were and why their story matters.

Context arrives here, but it arrives through people, not through information. The economics of a trade, the customs of an era, the geography of a place: these are introduced because they illuminate someone's life, not because they are necessary background.

What this phase achieves:
- Introduces the principal figures with enough humanity that the listener cares about them
- Establishes the world those figures inhabited, through sensory and social detail
- Deepens the mystery by showing what was normal before it was disrupted
- Keeps the central event present as a quiet thread, referenced and felt throughout

Introducing people:

The narrator meets each person as if for the first time, and invites the listener to meet them too. Not a profile. Not a summary. A person, arriving.

Give each principal figure at least one detail that makes them specific and human. Not just their role or their name, but something that suggests a life: a habit, a choice they made, a relationship they held. The narrator can wonder about them. Can say what is not known. Can acknowledge the limits of the record.

Example:

"Bert was a railwayman. Long hours, irregular shifts, the kind of work that takes you away from home and brings you back at odd times of the day or night. We do not know much about what he was like as a person. What we know is what he did when he came home and found that door locked. And that tells us something."

Weaving in context:

When background information is needed, it should arrive as something the narrator is sharing with you, not reciting at you. It should feel like something they noticed, something that helps explain a person or a place.

The narrator can frame context personally: "What you have to understand about Camden Town in 1907 is..." or "The thing about a railwayman's life back then was..." This keeps the voice present even when the material is expository.

Example:

"Camden Town in those years was not the grand part of London, and it was not the desperate part either. It was somewhere in between. Working people, modest wages, lodging houses that let out rooms to those who needed somewhere affordable and close enough to work. The kind of neighbourhood where everybody more or less knew everybody else's business, whether they wanted to or not."

Watch for: long passages of historical or contextual information without a person at their centre. If you can remove a character's name from a paragraph without it changing, the paragraph is doing the wrong work.

Use the character introductions and facts assigned to this phase in the narrative plan.

---

PHASE 3: UNFOLD (30-60 minutes, 3,600-4,500 words)

The events themselves. This is the heart of the episode, and it should feel like a heart: steady, unhurried, but always beating. The story moves through what happened, in the order it was discovered or experienced, not in the order of logical reconstruction.

Write this phase as memory narrated aloud, not as a report reconstructed from evidence. The narrator is remembering a story, thinking through it, pausing where the record pauses. They are not summarising. They are reliving it, gently, with you.

What this phase achieves:
- Moves through the events of the case with care and narrative momentum
- Maintains the listener's emotional connection to the people involved
- Acknowledges gaps and uncertainties without turning them into cliffhangers
- Uses chapter breaks when an emotional scene has completed and a new register begins

Narrating uncertainty:

Historical crime often involves gaps in the record. These should never be papered over with false confidence, nor weaponised as cliffhangers. The narrator does not know everything. They say so, plainly and without drama.

The direct voice makes this easier, not harder. The narrator can simply say: "I don't know what happened next. Nobody does, really. What we have is what was found, and what the finding suggested."

Example:

"What happened after she went inside, we cannot say with certainty. The record falls quiet here, as it so often does at the moments that matter most. What we know is what was found the following evening, and what it told the people who found it about the night that had passed."

Chapter breaks in this phase:

A chapter break should feel like the narrator pausing, setting something down, before picking up the next part of the story. They can acknowledge it: "Let me take a breath here" or simply allow the silence to do the work. Name the chapter by number only, or not at all. Never by topic.

Guard against: the investigative report voice. If a paragraph could appear in a court document, rework it. The narrator is a person sitting with another person in the dark, remembering something that happened a long time ago.

On trials and legal proceedings:

Trials are among the most common places where scripts collapse into report. Resist the temptation to list the arguments. A trial is a room full of people. There is weight and waiting and the particular texture of a verdict that has not yet arrived. Tell it that way.

The narrator can sit inside the courtroom with the listener: "Imagine the room. The benches packed. The press gallery watching everything. And in the dock, a man who has had weeks to think about what he is going to say."

Do not number the arguments. Fold the evidence into the story as it would be felt by someone watching and waiting.

---

PHASE 4 (60-80 minutes, 2,400-3,000 words)

This is where the story acknowledges its own incompleteness. The theories, the aftermath, the investigation, the unanswered questions: these arrive here, after the listener has lived inside the events. They arrive not as analysis but as the narrator honestly reckoning with what remains.

The direct voice does its best work in this phase. The narrator can reflect openly. Can say "I have thought about this a great deal" and "I am not sure what to make of it, and I am not sure anyone is." The listener, by now, may be drifting toward sleep, and the material here should permit that drift rather than interrupt it.

What this phase achieves:
- Examines what followed the central event: investigations, discoveries, verdicts, silences
- Considers theories or explanations without sensationalising or resolving prematurely
- Begins the emotional movement toward the people, away from the puzzle
- Prepares the listener for the closing by slowing the pace and softening the focus

On theories and explanations:

Where multiple explanations exist, the narrator presents them as possibilities they are genuinely weighing, not as competing cases in a debate. The listener is not being asked to reach a verdict. They are being invited to sit with the same uncertainty that has accompanied this story for a long time.

Example:

"There are people who think he did it. And when you lay out what is known, you can see why they think that. There are others who are not so sure, and when you look at the gaps in the evidence, you can see why they are not sure either. I find I cannot settle on one side or the other. Maybe you will feel differently. Maybe you will not."

The turn toward the human:

Somewhere in this phase, the narrator stops weighing the evidence and turns toward the people. This is not a formal transition. It is a natural one, the moment when the narrator says, in effect: enough of the puzzle. Let us think about the person.

By the end of Phase 4, the listener should be thinking about lives, not theories.

---

PHASE 5: REST (80-90 minutes, 900-1,200 words)

The closing of a Cozy Crime episode does not summarise, does not conclude, and does not attempt to resolve what cannot be resolved. It honours. It holds. It releases.

This phase needs more runway than a hasty closing allows. The emotional landing should feel earned, not arrived at. The listener should feel that the narrator has been sitting with them in the dark, and is now, gently, saying goodnight.

What this phase achieves:
- Acknowledges the people at the centre of the story by name, and with care
- Speaks to the passage of time, to memory, to what remains
- Closes with a physical image, something still and quiet, somewhere in the world of the story
- Ends with the farewell, which is brief, warm, and final

How to close:

The narrator does not step back in this phase. They stay close. They speak about the people at the centre of the story as if they have been thinking about them all evening, because they have. They use names. They say what mattered about a person, plainly and without sentiment.

Then they find a physical image from the world of the story and rest inside it. A street that still exists. A harbour at night. A building whose walls were there when this happened and are still there now. Something the listener can hold in their mind as they drift.

Example:

"The street is called Agar Grove now. The name changed at some point, as street names sometimes do, but the building is still there. People walk past it every day without knowing. The brickwork holds its silence, the way buildings do, and the city moves around it, and the years go by."

The farewell:

Three sentences, at most. Thank the listener for their company. Wish them rest. Do not invite them to return. Trust that the story itself has done that work.

Close with the closing image specified in the narrative plan: something still and quiet from the world of the story.

The most common failure in this phase is arriving too quickly. If Phase 4 ends with analysis or theory, the listener is in their head when they should be in their heart. Allow at least a full paragraph of quiet human reflection before the closing image.

Never end with a question, a revelation, or a call to action. End with stillness.

The script must end with exactly: "Rest well. A peaceful night to you."

---

CHAPTER BREAKS: A PRACTICAL GUIDE

A chapter break is not a structural division. It is a moment of breath. It should be placed where a scene or emotional register has completed, not where a topic changes.

Place a chapter break when:
- An emotional scene has ended and the story is moving to a different feeling
- The focus shifts from one person or group to another
- Time moves significantly forward or backward within the narrative
- The listener needs a moment of rest before a passage of greater density

Never place a chapter break when:
- A topic has been covered and the next topic is ready to begin
- The word count suggests one is due
- The previous chapter ended on something unresolved that the next chapter will answer

A 90-minute episode will typically carry between four and seven chapter breaks. Fewer is usually better. Each break should feel genuinely earned.

---

KEEPING THE CRIME PRESENT

This is perhaps the most important craft requirement of the template, and the one most easily lost in the writing of longer episodes.

The central event, the crime, the disappearance, the mystery, whatever lies at the heart of the story, must remain a felt presence throughout every phase. The listener came for a story. They should never find themselves wondering why they are hearing what they are hearing.

Practical technique:

After writing any paragraph of context, background, or character introduction, ask: how does this connect to what happened? If the connection is clear, make it explicit in the prose. The narrator can simply say it: "And this matters because..." or "Which is part of why, when it came to what happened that night, nobody was quite prepared."

Example:

"The alcohol aboard the Mary Celeste was denatured, treated against consumption, intended for the factories of Genoa. A routine cargo, unremarkable by the standards of the trade. And yet, in the weeks after her discovery, it would become central to almost every attempt to explain what had happened aboard her. Strange, how the ordinary things become the ones everyone reaches for."

This is not a mechanical requirement. It is a storytelling instinct. The crime is the reason the listener is here. Every other detail exists in relationship to it.

---

WORD COUNT AND PACING GUIDE

Spoken word at a calm, unhurried pace runs at approximately 120 to 130 words per minute. For a 90-minute episode, the target is 10,800 to 11,700 words of narrated script.

Phase 1 (Draw In): 1,200-1,500 words. Opening image and welcome. Do not overwrite.
Phase 2 (Settle): 2,400-3,000 words. People and world. Resist pure context.
Phase 3 (Unfold): 3,600-4,500 words. Events. The longest and most narrative phase.
Phase 4 (Sit With It): 2,400-3,000 words. Aftermath, theories, the turn toward people.
Phase 5 (Rest): 900-1,200 words. Closing image and farewell. Do not rush.

---

SELF-AUDIT CHECKLIST

Before completing the script, verify against these questions:

Opening (Phase 1):
- Does the first sentence feel like a narrator already talking, directly to you?
- Is the mystery or central event present within the first three sentences?
- Is the welcome brief, warm, and no longer than a short paragraph?
- Does the opening avoid all background, preamble, and general framing?

People (Phase 2):
- Does each principal figure have at least one specific human detail?
- Could a character's name be removed from any paragraph without changing it? If so, rework.
- Does context arrive through people rather than as standalone information?
- Does the narrator's voice remain personal and present, even in expository passages?
- Is the central event still felt as a presence throughout this phase?

Events (Phase 3):
- Is the narration in a memory voice rather than a report voice?
- Are gaps and uncertainties acknowledged honestly, in the narrator's own voice, without cliffhangers?
- Does each chapter break follow an emotional completion, not a topic change?
- Does the listener remain emotionally connected to the people throughout?
- If the script covers a trial or legal proceeding, is it told as a human scene rather than a structured list of arguments?

Aftermath (Phase 4):
- Are theories presented as genuine uncertainties the narrator is weighing, not as competing cases?
- Does the phase shift from puzzle to people before it ends?
- Is the pace slower and quieter than Phase 3?
- Is the listener being prepared to rest, not to think?

Closing (Phase 5):
- Does the closing honour the people by name, in the narrator's own voice?
- Is there a physical, still image at the close of the narrative?
- Is the farewell three sentences or fewer?
- Does the episode end in stillness, not in summary?

Throughout:
- No numbered or bulleted lists anywhere in the narration
- The narrator uses "I" and speaks directly to the listener throughout
- The central event is present as a thread in every phase
- Every sentence passes the test: could someone follow this with their eyes closed and their mind going soft?

---

A FINAL NOTE

The template is a container, not a constraint. A story that needs more time in one phase and less in another should take it. A case that has no theories should not manufacture them. A narrative that arrives at its closing image earlier than expected should not be padded to reach a word count.

What the template asks, at every level, is this: is the listener being guided gently through a story told with care, by a narrator who is present with them in the room? If the answer is yes, the template is working. If it is not, the template is the least of the problems.

---

LENGTH REQUIREMENT

The target is 10,800 to 11,700 words. Write the complete script through all five phases.

If the research material genuinely does not support a full-length episode, and continuing would create padding or repetition that harms the listener experience, then a shorter script is acceptable. But do not stop early simply because the story feels "complete enough." Most cases have more depth than a first pass suggests. Explore the people, the context, the aftermath, the unanswered questions. Only end shorter if continuing would make the episode worse, not merely longer.

---

NARRATIVE PLAN (follow this):

${narrativePlan}

---

RESEARCH FACT CLUSTERS (source material):

${researchText}

---

Now write the complete 90-minute script. Follow the narrative plan. Output only the narration text.`;
}
