export interface ValidationResult {
  isValid: boolean;
  violations: string[];
}

const BANNED_WORDS = [
  "subscribe",
  "like",
  "bell icon",
  "content",
  "algorithm",
];

export function validateDescription(description: string): ValidationResult {
  const violations: string[] = [];
  const lowerDesc = description.toLowerCase();

  // Banned words check
  for (const banned of BANNED_WORDS) {
    if (lowerDesc.includes(banned.toLowerCase())) {
      violations.push(`Description contains banned word/phrase: "${banned}"`);
    }
  }

  // Em-dash check
  if (description.includes("—") || description.includes("–")) {
    violations.push("Description contains em-dashes or en-dashes");
  }

  // Check for required sections (basic check)
  const hasHashtags = description.includes("#");
  const hasTimestamps = description.match(/\d+:\d+/);
  
  // These are warnings, not violations
  if (!hasHashtags) {
    violations.push("Consider adding hashtags for better discoverability");
  }

  return {
    isValid: violations.length === 0 || violations.every(v => v.startsWith("Consider")),
    violations,
  };
}
