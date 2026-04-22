// Image set prompt: 12 illustrated scene prompts + 2 YouTube thumbnail prompts
// Scene slots 1-12 use Rick and Morty-esque illustration (no in-image text).
// Thumbnails follow the cozy/cinematic templates in ThumbnailPrompt.md verbatim,
// WITH in-image hook text baked into the prompt so Gemini renders it.

import {
  getCozyTemplate,
  getCinematicTemplate,
  getThumbnailFormula,
} from "./thumbnail-templates";

export function buildImageSetPrompt(): string {
  const cozyTemplate = getCozyTemplate();
  const cinematicTemplate = getCinematicTemplate();
  const formula = getThumbnailFormula();

  return `You are generating image prompts for a Cozy Crime YouTube channel. The channel presents historical crime as calm, literary storytelling. You will generate 12 scene/atmosphere image prompts plus 2 YouTube thumbnail prompts (cozy + cinematic).

PEOPLE FIRST: Prefer scenes that include people wherever it fits the case. People catch the eye more than empty landscapes or interiors. Include key figures from the case (victim, accused, detective, witnesses) or period-appropriate figures in street scenes, interiors, and key moments. Only use pure landscape or empty interior when it clearly fits (e.g. establishing shot, empty room after discovery). The majority of the 12 slots should include at least one person when the case and scene allow it.

CHARACTER CONSISTENCY: From the research, identify 2-5 key figures (e.g. victim, accused, detective, key witness). For each figure, define one short, reusable appearance phrase (age range, clothing, hair, posture as relevant; period-appropriate). In every image prompt where that figure appears, use that exact appearance phrase verbatim - do not rephrase. When a thumbnail features a person from the case, use that person's appearance phrase exactly. This keeps the same character looking consistent across all images.

=============================================================
SCENE IMAGES - SLOTS 1 THROUGH 12
=============================================================

STYLE (SLOTS 1-12 ONLY):
- Illustrated, graphic-novel style similar to Rick and Morty: bold outlines, expressive and slightly stylised characters and environments, vibrant but period-appropriate colours, clean digital illustration.
- Period-accurate: era, location, architecture, clothing and props must match the case's time and place.
- Attractive for a cozy crime / historical mystery audience: atmospheric, intriguing, no gore or violence; mood can be mysterious, melancholic, or quietly dramatic.
- Each prompt should be detailed enough for AI image generation (Gemini/ChatGPT): describe composition, lighting, mood, and key visual elements.
- All images are 16:9 widescreen. Ensure full-bleed artwork with no letterboxing or black bars above/below, and no empty margins or square-crop padding.
- No characters staring directly at the viewer.
- No text, text boxes, captions, subtitles, signage, speech bubbles, or UI overlays anywhere in the image (no conversation shown).
- No violence.

SLOTS 1-12 CONTENT: Scene and atmosphere images. Vary locations (street, interior, landscape), time of day, and key moments or moods. Include people in most slots where it fits (e.g. detective at desk, figure in period street, courtroom with figures, harbour with workers). Use the exact same appearance description for each key figure every time they appear.

=============================================================
YOUTUBE THUMBNAILS - thumbnail_cozy AND thumbnail_cinematic
=============================================================

THUMBNAILS ARE A COMPLETELY SEPARATE STYLE TRACK FROM SCENES:
- Do NOT apply the Rick and Morty / cartoon style automatically to thumbnails.
- Thumbnails DO render large bold hook text inside the image. The "no text in image" rule applies to slots 1-12 ONLY. For thumbnails, the hook text is MANDATORY and must be baked into the image prompt.
- Follow the cozy and cinematic templates provided below EXACTLY.

THUMBNAIL FORMULA (reference):
${formula}

THUMBNAIL WORKFLOW (apply for each variant):
1. Choose ONE clear story idea (core moment: heist, arrest, escape, betrayal, confession, etc.).
2. Pick ONE symbolic visual object from the case (safe, letter, weapon, tower, diamond, lantern, etc.).
3. Pick ONE key figure from your character list (or a period-appropriate figure if none fits) and reuse the canonical appearance phrase verbatim.
4. Choose an appropriate exaggerated facial expression for the emotion (worried, smug, shocked, grim, suspicious, fearful, etc.).
5. Pick a 2-4 word uppercase hook that complements (does not repeat) the visual (examples: "CAUGHT BY RADIO", "THE FINAL CLUE", "$100M HEIST", "VANISHED AT SEA"). The cozy and cinematic hooks can be the same or different; choose what fits each style best.
6. Fill the corresponding template below by substituting:
   - [character description] -> the canonical appearance phrase
   - [key object] -> the symbolic object (keep the surrounding example phrasing from the template)
   - [exaggerated emotional expression] -> the chosen expression
   - [SHORT HOOK TEXT] -> the chosen hook, in ALL CAPS
7. Keep all other wording in the template verbatim so the style instructions survive.
8. Do NOT request any logo or watermark in the thumbnail prompt. The exact Cozy Crime logo is composited server-side after generation.
9. Do NOT add any sentences telling the image model to avoid text; the hook text is required.
10. The returned "prompt" must be the fully filled-in template, ready to send to Gemini.

COZY TEMPLATE (fill this in verbatim for thumbnail_cozy):
---
${cozyTemplate}
---

CINEMATIC TEMPLATE (fill this in verbatim for thumbnail_cinematic):
---
${cinematicTemplate}
---

OVERLAY TEXT FIELD:
- Also return the chosen hook as "overlay_text" for each variant.
- "overlay_text" must be byte-for-byte identical to the hook string you inserted in place of [SHORT HOOK TEXT] inside "prompt".
- 2 to 4 words, uppercase, no trailing punctuation beyond "!" or "?" if needed for tone.

=============================================================
OUTPUT FORMAT
=============================================================

Respond with a single JSON object, no other text, no markdown fences. Use this exact structure:
{
  "characters": [
    { "name": "Full name or role", "appearance": "One short phrase: age, clothing, hair, period-appropriate detail" }
  ],
  "images": [
    { "slot": "1", "prompt": "Full image prompt for slot 1..." },
    { "slot": "2", "prompt": "..." }
    // ... through slot "12"
  ],
  "thumbnails": {
    "cozy":      { "slot": "thumbnail_cozy",      "overlay_text": "HOOK TEXT", "prompt": "<filled cozy template containing HOOK TEXT verbatim>" },
    "cinematic": { "slot": "thumbnail_cinematic", "overlay_text": "HOOK TEXT", "prompt": "<filled cinematic template containing HOOK TEXT verbatim>" }
  }
}

- Slot keys must be the strings "1" through "12", plus "thumbnail_cozy" and "thumbnail_cinematic" under "thumbnails". Generate exactly 12 items in "images" and both thumbnail objects in "thumbnails".
- Each thumbnail's "prompt" MUST contain its "overlay_text" verbatim.
- Each thumbnail's "prompt" MUST NOT request any logo or watermark; the app adds the exact logo automatically.`;
}

export function buildThumbnailOnlyPrompt(variant: "cozy" | "cinematic"): string {
  const template = variant === "cozy" ? getCozyTemplate() : getCinematicTemplate();
  const formula = getThumbnailFormula();
  const slot = variant === "cozy" ? "thumbnail_cozy" : "thumbnail_cinematic";

  return `You are generating ONE YouTube thumbnail prompt for a Cozy Crime historical mystery video. Generate ONLY the ${variant} variant.

THUMBNAIL FORMULA (reference):
${formula}

STRICT RULES:
- Thumbnails DO render large bold hook text inside the image. The hook text is MANDATORY. Do NOT add any "no text" instruction.
- Pick a 2-4 word uppercase hook that complements (does not repeat) the visual (examples: "CAUGHT BY RADIO", "THE FINAL CLUE", "$100M HEIST", "VANISHED AT SEA").
- Pick ONE symbolic object and ONE key figure from the case (or a period-appropriate figure). Reuse a canonical appearance phrase verbatim if one would fit.
- Fill the template below by substituting [character description], [key object], [exaggerated emotional expression], and [SHORT HOOK TEXT]. Keep all other wording verbatim.
- Do NOT request any logo or watermark in the prompt. The exact Cozy Crime logo is added by the app after generation.
- The returned "prompt" must be the fully filled-in template, ready to send to Gemini.
- "overlay_text" must be byte-for-byte identical to the hook string you inserted in place of [SHORT HOOK TEXT].

${variant === "cozy" ? "COZY" : "CINEMATIC"} TEMPLATE (fill this in verbatim):
---
${template}
---

Output JSON only, no markdown fences:
{
  "thumbnail": {
    "slot": "${slot}",
    "overlay_text": "HOOK TEXT",
    "prompt": "<filled template containing HOOK TEXT verbatim>"
  }
}`;
}
