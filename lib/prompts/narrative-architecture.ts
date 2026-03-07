/**
 * Stage 1 prompt: transforms research fact clusters into a narrative architecture
 * that the script generation prompt will follow. This ensures the script is
 * driven by an emotional arc (the Descending Spiral) rather than by topic coverage.
 */

export function buildNarrativeArchitecturePrompt(researchText: string): string {
  return `You are a narrative architect for the Cozy Crime YouTube channel. Your task is NOT to write a script. Your task is to read a set of research fact clusters and produce a structured narrative plan that a scriptwriter will follow.

The plan must follow the Descending Spiral structure: the episode begins at its widest, most atmospheric point and slowly, gently narrows toward the human and the intimate. The organising principle is always the listener's emotional journey, not the logical order of information.

THE FIVE PHASES

The 90-minute episode moves through five emotional phases. Your plan must assign specific facts and moments from the research to each phase, explaining WHY they belong there emotionally, not just topically.

Phase 1 — Draw In (0-10 min, ~1,200-1,500 words of script)
The listener arrives inside the world and the mystery simultaneously. You need a specific physical image to open with and the central mystery present from the first moment.

Phase 2 — Settle (10-30 min, ~2,400-3,000 words of script)
The listener meets the people. The world deepens around them. Context arrives through people, not as standalone information.

Phase 3 — Unfold (30-60 min, ~3,600-4,500 words of script)
The listener lives inside the events as they happened. Narrated as memory, not as report. This is the longest phase.

Phase 4 — Sit With It (60-80 min, ~2,400-3,000 words of script)
The aftermath, the theories, the incompleteness. The focus gradually shifts from the puzzle to the people. The pace slows.

Phase 5 — Rest (80-90 min, ~900-1,200 words of script)
Honour. Hold. Release. A physical closing image, a farewell, stillness.

YOUR OUTPUT

Produce a narrative plan with exactly these sections:

OPENING IMAGE
Describe the specific physical image that will open the script: a particular place, a particular moment, a particular quality of light or weather. Not a general description of a period. A scene the listener can see. Also state the central mystery or question that will be present from the first sentence.

CLOSING IMAGE
Describe the specific physical image that will close the script: a still, quiet place from the world of the story. Something the listener can hold in their mind as they sleep.

CHARACTERS
List each key person who will appear in the script. For each, provide:
- Their name and role in the story
- One specific human detail (a habit, a choice, a relationship) that makes them a person rather than a role
- The phase in which they should be introduced and why

PHASE 1 — DRAW IN
Which facts from the research establish the atmosphere and plant the mystery? List them and explain the emotional purpose of each.

PHASE 2 — SETTLE
Which facts introduce the people and their world? How does context arrive through characters rather than as background information? List the facts and their emotional purpose.

PHASE 3 — UNFOLD
Which facts constitute the events themselves? Arrange them in the order they were discovered or experienced (not logical reconstruction). Note any gaps or uncertainties in the record and how they should be handled.

PHASE 4 — SIT WITH IT
Which facts relate to the aftermath, investigation, theories, and unanswered questions? How will the focus shift from puzzle to people?

PHASE 5 — REST
What remains? What has time done to this story? What should the listener carry into sleep?

CHAPTER BREAKS
Propose exactly where 4 to 7 chapter breaks should fall. For each break, state:
- After which moment or passage it occurs
- What emotional shift it marks (NOT what topic change it marks)
- Fewer breaks is usually better. Each must feel genuinely earned.

THE CRIME AS THREAD
In one paragraph, describe how the central crime or mystery will remain a felt presence throughout all five phases. The listener should never go more than a few minutes without understanding how what they are hearing connects to the story they came to hear.

IMPORTANT CONSTRAINTS
- Assign each fact to ONE phase. Do not scatter the same facts across multiple phases.
- Organise by emotional purpose, not by topic. If two facts are topically related but serve different emotional purposes, they belong in different phases.
- The plan should be 600 to 1,000 words. It is an instruction sheet, not a draft.
- Do not write prose. Write clear, direct planning notes.

RESEARCH FACT CLUSTERS:

${researchText}`;
}
