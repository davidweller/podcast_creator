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
  "[pause]",
  "[music]",
  "[SFX]",
];

const REQUIRED_CLOSING = "Rest well. A peaceful night to you.";

export function validateScript30Min(script: string): ValidationResult {
  const violations: string[] = [];
  const words = script.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Word count check
  if (wordCount < 4500 || wordCount > 5500) {
    violations.push(
      `Word count is ${wordCount}, must be between 4,500 and 5,500`
    );
  }

  // Em-dash check
  if (script.includes("—") || script.includes("–")) {
    violations.push("Script contains em-dashes or en-dashes (use commas or semicolons instead)");
  }

  // Banned words check
  const lowerScript = script.toLowerCase();
  for (const banned of BANNED_WORDS) {
    if (lowerScript.includes(banned.toLowerCase())) {
      violations.push(`Script contains banned word/phrase: "${banned}"`);
    }
  }

  // Closing ritual check
  if (!script.includes(REQUIRED_CLOSING)) {
    violations.push(
      `Script must end with exact phrase: "${REQUIRED_CLOSING}"`
    );
  }

  // CTA count check (should be exactly 2)
  const ctaPhrases = [
    "return",
    "join us",
    "you are welcome",
    "you will find us here",
  ];
  let ctaCount = 0;
  for (const phrase of ctaPhrases) {
    const regex = new RegExp(phrase, "gi");
    const matches = script.match(regex);
    if (matches) {
      ctaCount += matches.length;
    }
  }
  if (ctaCount !== 2) {
    violations.push(
      `Script should contain exactly 2 subscription/CTA mentions, found ${ctaCount}`
    );
  }

  // Chapter count check (should have 5-6 chapters: Chapter 1., Chapter 2., etc.)
  const chapterMatches = script.match(/^Chapter\s+\d+\./gm);
  const chapterCount = chapterMatches?.length || 0;
  if (chapterCount < 5 || chapterCount > 6) {
    violations.push(
      `Script should have 5-6 chapters (Chapter 1., Chapter 2., etc.), found ${chapterCount}`
    );
  }

  // Mystery seed timing check (should appear in first ~250 words for 30-min)
  const first250Words = words.slice(0, 250).join(" ");
  const mysteryIndicators = [
    "disappeared",
    "vanished",
    "found",
    "discovered",
    "mystery",
    "mysterious",
    "unexplained",
  ];
  const hasMysterySeed = mysteryIndicators.some((indicator) =>
    first250Words.toLowerCase().includes(indicator)
  );
  if (!hasMysterySeed) {
    violations.push(
      "Mystery seed should appear within the first 60 seconds (first ~250 words)"
    );
  }

  // Stage directions check
  if (script.match(/\[.*?\]/)) {
    violations.push("Script contains stage directions or markers in brackets");
  }

  return {
    isValid: violations.length === 0,
    violations,
  };
}

export function validateScript90Min(script: string): ValidationResult {
  const violations: string[] = [];
  const words = script.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Word count check
  if (wordCount < 14000 || wordCount > 16000) {
    violations.push(
      `Word count is ${wordCount}, must be between 14,000 and 16,000`
    );
  }

  // Em-dash check
  if (script.includes("—") || script.includes("–")) {
    violations.push("Script contains em-dashes or en-dashes (use commas or semicolons instead)");
  }

  // Banned words check
  const lowerScript = script.toLowerCase();
  for (const banned of BANNED_WORDS) {
    if (lowerScript.includes(banned.toLowerCase())) {
      violations.push(`Script contains banned word/phrase: "${banned}"`);
    }
  }

  // Closing ritual check
  if (!script.includes(REQUIRED_CLOSING)) {
    violations.push(
      `Script must end with exact phrase: "${REQUIRED_CLOSING}"`
    );
  }

  // CTA count check (should be exactly 2)
  const ctaPhrases = [
    "return",
    "join us",
    "you are welcome",
    "you will find us here",
  ];
  let ctaCount = 0;
  for (const phrase of ctaPhrases) {
    const regex = new RegExp(phrase, "gi");
    const matches = script.match(regex);
    if (matches) {
      ctaCount += matches.length;
    }
  }
  if (ctaCount !== 2) {
    violations.push(
      `Script should contain exactly 2 subscription/CTA mentions, found ${ctaCount}`
    );
  }

  // Chapter count check (should have 10 chapters: Chapter 1., Chapter 2., etc.)
  const chapterMatches = script.match(/^Chapter\s+\d+\./gm);
  const chapterCount = chapterMatches?.length || 0;
  if (chapterCount !== 10) {
    violations.push(
      `Script should have 10 chapters (Chapter 1., Chapter 2., etc.), found ${chapterCount}`
    );
  }

  // Mystery seed timing check (should appear in first ~400 words for 90-min)
  const first400Words = words.slice(0, 400).join(" ");
  const mysteryIndicators = [
    "disappeared",
    "vanished",
    "found",
    "discovered",
    "mystery",
    "mysterious",
    "unexplained",
  ];
  const hasMysterySeed = mysteryIndicators.some((indicator) =>
    first400Words.toLowerCase().includes(indicator)
  );
  if (!hasMysterySeed) {
    violations.push(
      "Mystery seed should appear within the first 90 seconds (first ~400 words)"
    );
  }

  // Stage directions check
  if (script.match(/\[.*?\]/)) {
    violations.push("Script contains stage directions or markers in brackets");
  }

  return {
    isValid: violations.length === 0,
    violations,
  };
}
