// Background Image Prompt Generator
// Based on PRD requirements

export const PROMPT_IMAGE_PROMPT = `You are generating an image prompt for a looping background video for a Cozy Crime YouTube channel episode. The channel presents historical crime as calm, literary storytelling.

You will be given research about a historical crime case. Generate a single, master image prompt optimized for ChatGPT image generation and Gemini image generation systems.

The prompt must describe an image in this exact style:
"A calm atmospheric illustrated scene in a cozy historical graphic-novel style. Clean ink linework with painterly digital shading, soft cinematic lighting, and a muted blue-grey and amber colour palette. Evening or twilight setting with warm glowing lamps reflecting in water. Gentle, quiet mood suitable for a historical mystery or cozy crime story. Stylised realism, not photorealistic, with simplified but elegant architectural detail. Soft clouded sky, subtle texture brushwork, and smooth gradients. Wide cinematic composition, balanced and uncluttered, designed for long-form YouTube background visuals. High detail, polished illustration, professional book-illustration quality."

Additional requirements:
- Period-accurate setting (era, location, architecture, clothing)
- Suitable for long looping video (consider what elements could loop naturally)
- No characters staring directly at viewer
- No violence depiction
- Atmospheric and peaceful, matching the Cozy Crime tone

The prompt should be detailed enough for AI image generation but focused on creating a calm, period-appropriate background suitable for a long-form narration video.

Generate the image prompt for the following case:`;
