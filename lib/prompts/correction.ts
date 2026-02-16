// Correction Prompt Template
// Used when validation fails

export function buildCorrectionPrompt(
  originalPrompt: string,
  violations: string[]
): string {
  return `${originalPrompt}

IMPORTANT: The previous attempt failed validation. Please regenerate the script with the following corrections:

${violations.map((v) => `- ${v}`).join("\n")}

Please ensure all these issues are addressed in your response.`;
}
