export interface ResearchValidationResult {
  isValid: boolean;
  warnings: string[];
}

export function validateResearch(researchText: string): ResearchValidationResult {
  const warnings: string[] = [];
  const words = researchText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Minimum length check
  if (wordCount < 500) {
    warnings.push(
      `Research appears too thin for full script generation. Current word count: ${wordCount} (minimum recommended: 500)`
    );
  }

  // Historical context detection
  const historicalKeywords = [
    "victorian",
    "edwardian",
    "century",
    "1800",
    "1900",
    "medieval",
    "ancient",
    "era",
    "period",
  ];
  const hasHistoricalContext = historicalKeywords.some((keyword) =>
    researchText.toLowerCase().includes(keyword)
  );
  if (!hasHistoricalContext) {
    warnings.push(
      "Research may lack historical context. Consider adding era/period information."
    );
  }

  // Named individuals detection (proper nouns - capitalized words)
  const properNouns = researchText.match(/\b[A-Z][a-z]+\b/g) || [];
  const uniqueProperNouns = [...new Set(properNouns)].filter(
    (word) => word.length > 2 && !["The", "And", "But", "For", "With"].includes(word)
  );
  if (uniqueProperNouns.length < 3) {
    warnings.push(
      "Research may lack sufficient named individuals. Consider adding more person names."
    );
  }

  // Location references detection
  const locationKeywords = [
    "london",
    "paris",
    "street",
    "road",
    "avenue",
    "city",
    "town",
    "village",
    "county",
    "country",
  ];
  const hasLocations = locationKeywords.some((keyword) =>
    researchText.toLowerCase().includes(keyword)
  );
  if (!hasLocations && uniqueProperNouns.length < 5) {
    warnings.push(
      "Research may lack location references. Consider adding place names."
    );
  }

  return {
    isValid: warnings.length === 0 || wordCount >= 500,
    warnings,
  };
}
