/**
 * Word count (whitespace-separated).
 */
export function countWords(text: string): number {
  if (!text?.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Chapter count for 30-min script: OPENING: + CHAPTER 1:, CHAPTER 2:, etc.
 */
export function countChapters30(script: string): number {
  const opening = script.match(/^OPENING:/gim);
  const chapters = script.match(/^CHAPTER\s+\d+:/gim);
  return (opening?.length ?? 0) + (chapters?.length ?? 0);
}

/**
 * Chapter count for 90-min script: OPENING: + Chapter 1:, Chapter 2:, etc.
 */
export function countChapters90(script: string): number {
  const opening = script.match(/^OPENING:/gim);
  const chapters = script.match(/^Chapter\s+\d+:/gim);
  return (opening?.length ?? 0) + (chapters?.length ?? 0);
}

export function getScriptStats30(script: string): { wordCount: number; chapterCount: number } {
  return { wordCount: countWords(script), chapterCount: countChapters30(script) };
}

export function getScriptStats90(script: string): { wordCount: number; chapterCount: number } {
  return { wordCount: countWords(script), chapterCount: countChapters90(script) };
}
