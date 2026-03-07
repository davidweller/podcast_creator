import { callClaude, SCRIPT_MODEL } from "@/lib/claude/client";
import type { ContinuationContext } from "@/lib/prompts/script-90min-segments";
import {
  buildSegment1Prompt,
  buildSegment2Prompt,
  buildSegment3Prompt,
  buildSegment4Prompt,
  buildSegment5Prompt,
} from "@/lib/prompts/script-90min-segments";

/** Take the last 2 paragraphs of a segment for continuation context. */
function getLastParagraphs(text: string, maxWords = 120): string {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);
  if (paragraphs.length === 0) return "";
  if (paragraphs.length <= 2) return paragraphs.join("\n\n");
  const lastTwo = paragraphs.slice(-2).join("\n\n");
  const words = lastTwo.split(/\s+/);
  if (words.length <= maxWords) return lastTwo;
  return words.slice(-maxWords).join(" ");
}

/** Extract a few capitalized words (likely names/places) from text for consistency. */
function getKeyNames(text: string, limit = 12): string[] {
  const matches = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g) || [];
  const skip = new Set(["The", "Chapter", "Good", "Tonight", "Picture", "Rest", "Let", "Phase"]);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of matches) {
    if (skip.has(m) || seen.has(m)) continue;
    seen.add(m);
    out.push(m);
    if (out.length >= limit) break;
  }
  return out;
}

/**
 * Generate a 90-minute script using the Descending Spiral template.
 * Split into 5 segments aligned with the 5 emotional phases:
 * - Segment 1: Phase 1 (Draw In) + Phase 2 (Settle) - ~3,600-4,500 words
 * - Segment 2: Phase 3 (Unfold) first half - ~1,800-2,250 words
 * - Segment 3: Phase 3 (Unfold) second half - ~1,800-2,250 words
 * - Segment 4: Phase 4 (Sit With It) - ~2,400-3,000 words
 * - Segment 5: Phase 5 (Rest) - ~900-1,200 words
 * 
 * Total target: 10,800-11,700 words
 */
export async function generateScript90MinChunked(researchText: string): Promise<{
  script: string;
  attempts: number;
}> {
  const segments: string[] = [];
  let attempts = 0;

  // Segment 1: Phase 1 (Draw In) + Phase 2 (Settle)
  const prompt1 = buildSegment1Prompt(researchText);
  let segment1 = await callClaude(prompt1, {
    maxTokens: 6144,
    temperature: 0.7,
    model: SCRIPT_MODEL,
  });
  attempts += 1;
  segment1 = segment1.trim();
  segments.push(segment1);

  let context: ContinuationContext = {
    lastParagraphs: getLastParagraphs(segment1),
    keyNames: getKeyNames(segment1),
  };

  // Segment 2: Phase 3 (Unfold) first half
  const prompt2 = buildSegment2Prompt(researchText, context);
  let segment2 = await callClaude(prompt2, {
    maxTokens: 4096,
    temperature: 0.7,
    model: SCRIPT_MODEL,
  });
  attempts += 1;
  segment2 = segment2.trim();
  segments.push(segment2);
  context = {
    lastParagraphs: getLastParagraphs(segment2),
    keyNames: getKeyNames(segment1 + " " + segment2),
  };

  // Segment 3: Phase 3 (Unfold) second half
  const prompt3 = buildSegment3Prompt(researchText, context);
  let segment3 = await callClaude(prompt3, {
    maxTokens: 4096,
    temperature: 0.7,
    model: SCRIPT_MODEL,
  });
  attempts += 1;
  segment3 = segment3.trim();
  segments.push(segment3);
  context = {
    lastParagraphs: getLastParagraphs(segment3),
    keyNames: getKeyNames(segment1 + " " + segment2 + " " + segment3),
  };

  // Segment 4: Phase 4 (Sit With It)
  const prompt4 = buildSegment4Prompt(researchText, context);
  let segment4 = await callClaude(prompt4, {
    maxTokens: 4096,
    temperature: 0.7,
    model: SCRIPT_MODEL,
  });
  attempts += 1;
  segment4 = segment4.trim();
  segments.push(segment4);
  context = {
    lastParagraphs: getLastParagraphs(segment4),
    keyNames: undefined,
  };

  // Segment 5: Phase 5 (Rest)
  const prompt5 = buildSegment5Prompt(researchText, context);
  let segment5 = await callClaude(prompt5, {
    maxTokens: 2048,
    temperature: 0.7,
    model: SCRIPT_MODEL,
  });
  attempts += 1;
  segment5 = segment5.trim();
  segments.push(segment5);

  const fullScript = segments.join("\n\n");
  return { script: fullScript, attempts };
}
