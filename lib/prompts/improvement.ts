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
  return `- The mystery seed appears within the first 60 seconds of narration (first ~250 words).
- Every chapter contains at least one reference to the crime or mystery.
- No chapter exceeds 1,200 words or falls below 600 words.
- Total word count is between 4,500 and 5,500.
- The script contains exactly two subscription mentions (preface and closing) and no others.
- No em-dashes appear anywhere (use commas, semicolons, or restructure sentences).
- No passage reduces a victim to their victimhood.
- Violence remains offstage throughout.
- No modern slang, no contemporary framing, no stage directions, no markers.
- The closing ritual ends with "Rest well. A peaceful night to you."`;
}

function get90MinQualityChecks(): string {
  return `- The mystery seed appears within the first 90 seconds of narration (first ~400 words).
- Every chapter contains at least one reference to the crime or mystery.
- No chapter exceeds 2,500 words or falls below 1,000 words.
- Total word count is between 14,000 and 16,000.
- World-building chapters (Parts One and Two) are at least as long in total as investigation chapters (Part Four).
- The emotional spine is stated fully in one anchor chapter and nowhere else.
- No refrain appears more than three times.
- The script contains exactly two subscription mentions (preface and closing) and no others.
- No em-dashes appear anywhere (use commas, semicolons, or restructure sentences).
- No passage reduces a victim to their victimhood.
- Violence remains offstage throughout.
- No modern slang, no contemporary framing, no stage directions, no markers.
- Where sources conflict, the script acknowledges the disagreement.
- The closing ritual ends with "Rest well. A peaceful night to you."`;
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
