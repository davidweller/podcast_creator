export interface ValidationResult {
  isValid: boolean;
  violations: string[];
}

const BANNED_WORDS = ["subscribe", "like", "click"];

export function validateShorts(script: string): ValidationResult {
  const violations: string[] = [];
  const words = script.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Length check (50-100 words)
  if (wordCount < 50 || wordCount > 100) {
    violations.push(
      `Shorts script word count is ${wordCount}, must be between 50 and 100 words`
    );
  }

  // Banned words check
  const lowerScript = script.toLowerCase();
  for (const banned of BANNED_WORDS) {
    if (lowerScript.includes(banned.toLowerCase())) {
      violations.push(`Script contains banned word: "${banned}"`);
    }
  }

  // Em-dash check
  if (script.includes("—") || script.includes("–")) {
    violations.push("Script contains em-dashes or en-dashes");
  }

  return {
    isValid: violations.length === 0,
    violations,
  };
}
