// Canonical opening template for Cozy Crime scripts.
// The script must begin with the story-hook shape, then this exact welcome block.

/** Story-hook sentence pattern. Fill [LOCATION], [YEAR/PERIOD], [BRIEF SCENE OR IMAGE], [CENTRAL QUESTION OR MYSTERY]. */
export const STORY_HOOK_TEMPLATE =
  "Tonight, we travel to [LOCATION] in [YEAR/PERIOD], where [BRIEF SCENE OR IMAGE, one sentence]. [CENTRAL QUESTION OR MYSTERY, one to two sentences introducing the case and why it lingers].";

/** Exact welcome and reassurance block. Must appear verbatim after the story hook. */
export const OPENING_WELCOME_BLOCK =
  "Good evening, and welcome. You have found your way to a place of calm. There will be no sudden sounds here, no raised voices, nothing to startle you from rest. If you find comfort in these stories and wish to follow us, we shall always have a tale waiting for you. The night is yours, and so is this story.";

/** Closing line of the opening. Must appear verbatim after the welcome block. */
export const OPENING_GOOD_EVENING =
  "Good evening, and welcome.";

/** Full fixed opening text (welcome block + good evening) for validation/improvement checks. */
export const OPENING_FIXED_AFTER_HOOK = `${OPENING_WELCOME_BLOCK}\n${OPENING_GOOD_EVENING}`;
