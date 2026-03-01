// Prompt for analyzing scripts and generating improvement suggestions

export function buildImprovementPrompt(
  script: string,
  type: "30min" | "90min"
): string {
  const qualityChecks = type === "30min" 
    ? get30MinQualityChecks()
    : get90MinQualityChecks();

  return `You are an editor for the Cozy Crime YouTube channel. Your task is to analyze a script and provide improvement suggestions.

QUALITY CHECKS

Review the script against these quality criteria:

${qualityChecks}

COPYEDITING

Additionally, review the script for:
- Clarity and flow
- Period-appropriate language
- Consistency in tone
- Grammatical correctness
- Word choice and phrasing improvements

OUTPUT FORMAT

Provide your analysis as a JSON object with this structure:
{
  "suggestions": [
    {
      "type": "quality_check" | "copyedit" | "style",
      "description": "Human-readable description of the issue",
      "location": "Optional reference (e.g., 'Chapter 1', 'Opening section')",
      "suggestion": "Specific improvement recommendation",
      "original": "Original text (if applicable)",
      "improved": "Improved text (if applicable)"
    }
  ],
  "summary": "Brief overall summary of the analysis"
}

For quality_check type suggestions, focus on violations of the quality criteria above.
For copyedit type suggestions, focus on language, clarity, and grammar improvements.
For style type suggestions, focus on tone, consistency, and period-appropriateness.

SCRIPT TO ANALYZE:

${script}

Now analyze this script and provide improvement suggestions in the JSON format specified above.`;
}

function get30MinQualityChecks(): string {
  return `SCRIPT REQUIREMENTS CHECKLIST (flag any deviation and suggest fixes):

- The script opens with the story-hook template: first sentence must begin "Tonight, we travel to [location] in [year/period], where..." followed by one or two sentences stating the central question or mystery. Then the exact welcome block (verbatim): "Good evening, and welcome. You have found your way to a place of calm. There will be no sudden sounds here, no raised voices, nothing to startle you from rest. If you find comfort in these stories and wish to follow us, we shall always have a tale waiting for you. The night is yours, and so is this story." Then exactly: "Good evening, and welcome."
- Total word count is between 4,500 and 5,500.
- Exactly 5 or 6 chapter headings: "Chapter 1.", "Chapter 2.", etc. (number and full stop only).
- Exactly two invitation-to-return (CTA) phrases in the whole script; use only: return, join us, you are welcome, you will find us here.
- The mystery seed (e.g. disappeared, vanished, found, discovered, mystery, mysterious, unexplained) appears within the first 250 words.
- The script ends with the exact phrase: "Rest well. A peaceful night to you."
- No em-dashes or en-dashes anywhere (use commas, semicolons, or restructure).
- No banned words or bracketed markers: subscribe, like, bell icon, content, algorithm, [pause], [music], [SFX]. No stage directions in brackets.
- Every chapter contains at least one reference to the crime or mystery.
- No passage reduces a victim to their victimhood. Violence remains offstage throughout.
- No modern slang, no contemporary framing.`;
}

function get90MinQualityChecks(): string {
  return `SCRIPT REQUIREMENTS CHECKLIST (flag any deviation and suggest fixes):

- The script opens with the story-hook template: first sentence must begin "Tonight, we travel to [location] in [year/period], where..." followed by one or two sentences stating the central question or mystery. Then the exact welcome block (verbatim): "Good evening, and welcome. You have found your way to a place of calm. There will be no sudden sounds here, no raised voices, nothing to startle you from rest. If you find comfort in these stories and wish to follow us, we shall always have a tale waiting for you. The night is yours, and so is this story." Then exactly: "Good evening, and welcome."
- Total word count is between 14,000 and 16,000.
- Exactly 10 chapter headings: "Chapter 1." through "Chapter 10." (number and full stop only).
- Exactly two invitation-to-return (CTA) phrases in the whole script; use only: return, join us, you are welcome, you will find us here.
- The mystery seed (e.g. disappeared, vanished, found, discovered, mystery, mysterious, unexplained) appears within the first 400 words.
- The script ends with the exact phrase: "Rest well. A peaceful night to you."
- No em-dashes or en-dashes anywhere (use commas, semicolons, or restructure).
- No banned words or bracketed markers: subscribe, like, bell icon, content, algorithm, [pause], [music], [SFX]. No stage directions in brackets.
- Every chapter contains at least one reference to the crime or mystery.
- No passage reduces a victim to their victimhood. Violence remains offstage throughout.
- No modern slang, no contemporary framing. Where sources conflict, the script acknowledges the disagreement.`;
}

export function buildApplyImprovementsPrompt(
  script: string,
  suggestions: string
): string {
  return `You are an editor for the Cozy Crime YouTube channel. Your task is to apply improvement suggestions to a script.

IMPORTANT: Only apply the improvements that are specified. Do not make other changes unless they are necessary to maintain consistency after applying the improvements.

SCRIPT:

${script}

IMPROVEMENT SUGGESTIONS:

${suggestions}

Apply these improvements to the script. Return only the improved script text, with no additional commentary, notes, or formatting. The output should be ready-to-record narration text.`;
}
