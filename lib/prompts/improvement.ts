// Prompt for analyzing scripts and generating improvement suggestions

export function buildImprovementPrompt(script: string): string {
  const qualityChecks = get90MinQualityChecks();

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

function get90MinQualityChecks(): string {
  return `SCRIPT REQUIREMENTS CHECKLIST (Descending Spiral Template) - flag any deviation and suggest fixes:

OPENING (Phase 1 - Draw In):
- The script opens with a physical image in a specific place: first sentence must begin "Tonight, we travel to [location] in [year/period]..." followed by a specific scene or image, not a general description.
- The central event or mystery is present within the first few sentences.
- The exact welcome block must appear (verbatim): "Good evening, and welcome. You have found your way to a place of calm. There will be no sudden sounds here, no raised voices, nothing to startle you from rest. If you find comfort in these stories and wish to follow us, we shall always have a tale waiting for you. The night is yours, and so is this story."
- Then exactly: "Good evening, and welcome."
- Then permission to rest, then "Chapter 1."

STRUCTURE:
- Total word count is between 10,800 and 11,700 (90 minutes at 120-130 wpm).
- Between 4 and 7 chapter headings: "Chapter 1.", "Chapter 2.", etc. (number and full stop only, no topic titles).
- Chapter breaks occur at emotional completions, not topic changes.

STYLE RULES:
- No em-dashes or en-dashes anywhere (use commas, semicolons, or restructure).
- No gore or graphic description. Violence happens offstage.
- No sensational language or modern true crime tropes.
- No exclamation marks. The narrator never raises their voice.
- No modern slang or contemporary framing.
- No banned words or bracketed markers: subscribe, like, bell icon, content, algorithm, [pause], [music], [SFX]. No stage directions in brackets.

CONTENT:
- Every phase contains at least one reference to the crime or mystery (the crime as thread).
- People are introduced with specific human details, not just roles.
- Context arrives through people, not as standalone information.
- Theories are presented without hierarchy or insistence.
- No passage reduces a victim to their victimhood.

CLOSING (Phase 5 - Rest):
- The closing honours the people by name.
- There is a physical, still image at the close.
- The farewell is three sentences or fewer.
- The script must end with exactly: "Rest well. A peaceful night to you."`;
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
