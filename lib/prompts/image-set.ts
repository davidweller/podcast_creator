// Image set prompt: 36 illustrated scene prompts + 1 YouTube thumbnail prompt
// Style: Rick and Morty–esque illustrated, period-accurate, cozy crime audience
// People-first: include people where possible; same person = same description across images

export const PROMPT_IMAGE_SET = `You are generating image prompts for a Cozy Crime YouTube channel. The channel presents historical crime as calm, literary storytelling. You will generate 36 scene/atmosphere image prompts plus 1 YouTube thumbnail prompt.

PEOPLE FIRST: Prefer scenes that include people wherever it fits the case. People catch the eye more than empty landscapes or interiors. Include key figures from the case (victim, accused, detective, witnesses) or period-appropriate figures in street scenes, interiors, and key moments. Only use pure landscape or empty interior when it clearly fits (e.g. establishing shot, empty room after discovery). The majority of the 36 slots should include at least one person when the case and scene allow it.

CHARACTER CONSISTENCY: From the research, identify 2–5 key figures (e.g. victim, accused, detective, key witness). For each figure, define one short, reusable appearance phrase (age range, clothing, hair, posture as relevant; period-appropriate). In every image prompt where that figure appears, use that exact appearance phrase verbatim—do not rephrase. When the thumbnail features a person from the case, use that person's appearance phrase exactly. This keeps the same character looking consistent across all images.

STYLE (all images):
- Illustrated, graphic-novel style similar to Rick and Morty: bold outlines, expressive and slightly stylised characters and environments, vibrant but period-appropriate colours, clean digital illustration.
- Period-accurate: era, location, architecture, clothing and props must match the case's time and place.
- Attractive for a cozy crime / historical mystery audience: atmospheric, intriguing, no gore or violence; mood can be mysterious, melancholic, or quietly dramatic.
- Each prompt should be detailed enough for AI image generation (Gemini/ChatGPT): describe composition, lighting, mood, and key visual elements.
- All images are 16:9 widescreen. Describe compositions that fill the full frame—wide cinematic framing, no empty margins or letterboxing, no square crops with blank sides.
- No characters staring directly at the viewer. No violence.

SLOTS 1–36: Scene and atmosphere images. Vary locations (street, interior, landscape), time of day, and key moments or moods. Include people in most slots where it fits (e.g. detective at desk, figure in period street, courtroom with figures, harbour with workers). Use the exact same appearance description for each key figure every time they appear.

SLOT 37 (thumbnail): A single YouTube thumbnail prompt. Eye-catching, with space for a title overlay. Feature a person or item as the main focus (e.g. a key figure from the case, a significant object, or a central character). If the thumbnail shows a person from the case, use that person's canonical appearance phrase from your character list exactly. Also provide a short thumbnail title (a few words) suitable for overlay.

OUTPUT FORMAT: Respond with a single JSON object, no other text. Use this exact structure:
{
  "characters": [
    { "name": "Full name or role", "appearance": "One short phrase: age, clothing, hair, period-appropriate detail" }
  ],
  "images": [
    { "slot": "1", "prompt": "Full image prompt for slot 1..." },
    { "slot": "2", "prompt": "..." },
    ... through slot "36"
  ],
  "thumbnail": { "slot": "thumbnail", "prompt": "Full thumbnail image prompt...", "title": "Short Title Here" }
}

- "characters" is optional but recommended: list each key figure and their single appearance phrase; use these phrases verbatim in any prompt that includes that figure.
- Slot keys must be the strings "1" through "36" and "thumbnail". Generate exactly 36 items in "images" and one "thumbnail" object.`;
