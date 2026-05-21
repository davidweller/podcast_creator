/**
 * Seven Carlin-style sections with word bands from public/Carlin Style.md
 */

export type CarlinSectionId =
  | "cold_open"
  | "intro"
  | "deep_background"
  | "main_narrative"
  | "climax"
  | "consequences"
  | "outro";

export interface CarlinSectionSpec {
  id: CarlinSectionId;
  label: string;
  minWords: number;
  maxWords: number;
  scope: string;
  instructions: string;
  antiPatterns: string;
}

/** Max output tokens heuristic per section for streamLlmText (words * ~1.35 + slack). */
export function getCarlinSectionMaxTokens(id: CarlinSectionId): number {
  const map: Record<CarlinSectionId, number> = {
    cold_open: 4096,
    intro: 4096,
    deep_background: 12288,
    main_narrative: 32768,
    climax: 8192,
    consequences: 8192,
    outro: 4096,
  };
  return map[id];
}

export const CARLIN_SECTIONS: CarlinSectionSpec[] = [
  {
    id: "cold_open",
    label: "Cold Open / Hook",
    minWords: 350,
    maxWords: 450,
    scope:
      "Open the episode without preamble: hook the listener and end on a question or teaser that pulls them into the full story.",
    instructions: `Begin immediately. No music or intro.

Launch with a gripping you-are-there scene, a dramatic primary-source quote woven into speech, a striking fact, or a high-tension moment grounded in the research.

Grab attention in roughly the first 100 to 150 words of this section.

End with a powerful hook question or teaser that pulls the listener into the bigger story.`,
    antiPatterns: `Do not explain what you are about to do. Do not recap the episode. Do not paste labels like "Cold Open." Do not use bracket tags.`,
  },
  {
    id: "intro",
    label: "Introduction & Framing",
    minWords: 500,
    maxWords: 650,
    scope:
      "Welcome tone, stakes, roadmap, disclaimers — set why this episode exists and where it is headed.",
    instructions: `Warm, personal welcome and episode theme or spoken title framing.

Explain why this story matters and why it still resonates.

High-level tease of the central conflict, narrative arc, and any big underlying themes.

Include light disclaimers about sources or complexity where the research suggests caution.

Set a passionate, curious tone while staying within Cozy Crime tone basics.`,
    antiPatterns: `Do not spoil the climax. Do not recount the cold open verbatim. Avoid long preamble that delays story motion.`,
  },
  {
    id: "deep_background",
    label: "Deep Background / World-Building",
    minWords: 1800,
    maxWords: 2200,
    scope:
      "Build context richly so the listener feels immersed before main action escalates.",
    instructions: `Rich context across political, social, economic, cultural, technological, and geographic realities as the research supports.

Introduce key people, institutions, long-term trends, and underlying forces.

Explain why events were likely, or shockingly contingent.

Use anecdotes, vivid details, and short illustrative stories.

Weave in Martian questions about what daily life or mindsets might have felt like.

Make the listener feel smarter before the main chronological drive intensifies.`,
    antiPatterns: `Do not deliver the climax of the case here. Do not sprint through years as a list. Avoid repeating the hook scene from the cold open.`,
  },
  {
    id: "main_narrative",
    label: "Main Narrative – Rising Action",
    minWords: 3800,
    maxWords: 4300,
    scope:
      "The heart of the episode: chronological storytelling with relentless forward momentum.",
    instructions: `Chronological storytelling across several natural phases using cinematic transitions in prose only.

Fill with vivid sensory detail, motives, primary-source quotes as audio footnotes, tension, irony, and human messiness where appropriate.

Allow controlled tangents that deepen understanding, then return to the thread.

Periodically re-orient the listener with gentle name and relationship reminders.

Keep energy and curiosity high; this block should feel compelling on its own.`,
    antiPatterns: `Do not resolve the story's final consequences in full here; save the sharpest turning points for the climax section if they belong there. Do not number chapters aloud.`,
  },
  {
    id: "climax",
    label: "Climax & Immediate Aftermath",
    minWords: 1100,
    maxWords: 1400,
    scope:
      "Deliver decisive moments and their immediate fallout with intensity and clarity.",
    instructions: `Deliver decisive moments, choices, trials, confrontations, or turning points with heightened narrative energy.

Convey emotional weight with restraint: drama without graphic exploitation.

Cover immediate consequences and short-term fallout.

Use intense you-are-there immersion and powerful quotes where the research supports them.`,
    antiPatterns: `Do not repeat the entire timeline already told. Do not jump to modern historiography debates; that belongs in the next section.`,
  },
  {
    id: "consequences",
    label: "Broader Consequences & Analysis",
    minWords: 1000,
    maxWords: 1300,
    scope:
      "Ripples, significance, themes, and accessible debate — intellectual and emotional payoff.",
    instructions: `Explore long-term ripple effects and historical significance.

Reflect on underlying themes, ironies, and what this story reveals about human nature.

Lightly address common misconceptions or debates; keep language accessible.

Offer thoughtful big-picture insights. Connect to the present only where it genuinely illuminates.

Deliver an emotional and intellectual payoff that lingers.`,
    antiPatterns: `Do not re-narrate the climax beat-for-beat. Avoid preachy moralizing. Avoid modern political slogans.`,
  },
  {
    id: "outro",
    label: "Conclusion & Outro",
    minWords: 400,
    maxWords: 600,
    scope:
      "Closure, recap of one central insight, optional series teaser, warm sign-off.",
    instructions: `Emotional or philosophical wrap-up with satisfying closure.

Quick recap of the central insight or Martian takeaway in spoken prose.

If this episode is part of a series, a brief teaser is fine; otherwise omit.

Warm, grateful sign-off. Thank the listener in plain language.

End with a poignant final quote, reflection, or memorable line.

After the final spoken line of the episode, add a short non-spoken postscript paragraph: state the approximate word count of the full stitched script produced so far in this session (estimate if needed), and list three to seven suggested subtle music sting points phrased as plain sentences (still no bracket cues). Prefix that postscript with the exact line: WORD_COUNT_NOTE:`,
    antiPatterns: `Do not restart the narrative. Do not introduce major new factual claims. The spoken episode must fully conclude before WORD_COUNT_NOTE.`,
  },
];
