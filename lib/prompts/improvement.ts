/**
 * improvement.ts
 *
 * Prompts for analyzing scripts and applying improvements.
 * Quality check rules are imported from cozy-crime-constants.ts.
 */

import { QUALITY_CHECK_RULES } from "./cozy-crime-constants";

export function buildImprovementPrompt(script: string): string {
  return `You are an editor for the Cozy Crime YouTube channel. Your task is to analyze a script and provide improvement suggestions.

QUALITY CHECKS

Review the script against these quality criteria:

${QUALITY_CHECK_RULES}

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
      "location": "Optional reference (e.g., 'Chapter One', 'Opening section')",
      "suggestion": "Specific improvement recommendation",
      "original": "Original text (if applicable)",
      "improved": "Improved text (if applicable)"
    }
  ],
  "summary": "Brief overall summary of the analysis"
}

For quality_check suggestions, focus on violations of the quality criteria above.
For copyedit suggestions, focus on language, clarity, and grammar improvements.
For style suggestions, focus on tone, consistency, and period-appropriateness.

SCRIPT TO ANALYZE:

${script}

Analyze this script and provide improvement suggestions in the JSON format specified above.`;
}

export function buildApplyImprovementsPrompt(
  script: string,
  suggestions: string
): string {
  return `You are an editor for the Cozy Crime YouTube channel. Your task is to apply improvement suggestions to a script.

IMPORTANT: Only apply the improvements that are specified. Do not make other changes unless they are necessary to maintain consistency after applying the specified improvements.

SCRIPT:

${script}

IMPROVEMENT SUGGESTIONS:

${suggestions}

Apply these improvements to the script. Return only the improved script text, with no additional commentary, notes, or formatting. The output should be ready-to-record narration text.`;
}

export function buildApplySingleImprovementPrompt(
  script: string,
  suggestion: {
    type: string;
    description: string;
    location?: string;
    suggestion?: string;
    original?: string;
    improved?: string;
  }
): string {
  let improvementText = `[${suggestion.type.toUpperCase()}] ${suggestion.description}`;
  if (suggestion.location) {
    improvementText += `\nLocation: ${suggestion.location}`;
  }
  if (suggestion.suggestion) {
    improvementText += `\nSuggestion: ${suggestion.suggestion}`;
  }
  if (suggestion.original && suggestion.improved) {
    improvementText += `\nOriginal: ${suggestion.original}`;
    improvementText += `\nImproved: ${suggestion.improved}`;
  }

  return `You are an editor for the Cozy Crime YouTube channel. Your task is to apply ONE specific improvement to a script.

CRITICAL INSTRUCTIONS:
- Apply ONLY the single improvement specified below.
- Do NOT make any other changes to the script.
- Do NOT add commentary or notes.
- Return the COMPLETE script with the improvement applied.

THE IMPROVEMENT TO APPLY:

${improvementText}

SCRIPT:

${script}

Apply this single improvement and return the complete improved script. Output only the script text, nothing else.`;
}
