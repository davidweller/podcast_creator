/**
 * Word count (whitespace-separated).
 */
export function countWords(text: string): number {
  if (!text?.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Chapter count for 90-min script: Chapter 1., Chapter 2., etc. (number and full stop only).
 * In the Descending Spiral template, chapters are emotional punctuation, typically 4-7 per episode.
 */
export function countChapters90(script: string): number {
  const chapters = script.match(/^Chapter\s+\d+\./gm);
  return chapters?.length ?? 0;
}

export function getScriptStats90(script: string): { wordCount: number; chapterCount: number } {
  return { wordCount: countWords(script), chapterCount: countChapters90(script) };
}
