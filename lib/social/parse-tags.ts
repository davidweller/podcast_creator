/**
 * Extract practical upload tags from metadata_json (new tags-only or legacy packaging output).
 */

export function extractPracticalTagSet(metadata: string | null | undefined): string {
  if (!metadata?.trim()) return "";

  const raw = metadata.trim();
  const markers = ["7. Practical tag set", "7. PRACTICAL TAG SET"];

  for (const marker of markers) {
    const idx = raw.toLowerCase().indexOf(marker.toLowerCase());
    if (idx === -1) continue;
    const after = raw.slice(idx + marker.length).trim();
    if (after) return stripLeadingNumberedSections(after);
  }

  // New format: entire payload is comma-separated tags
  if (!/^\d+\.\s/m.test(raw)) {
    return raw;
  }

  return raw;
}

function stripLeadingNumberedSections(text: string): string {
  const lines = text.split("\n");
  const tagLines: string[] = [];
  for (const line of lines) {
    if (/^\d+\.\s/.test(line.trim())) break;
    tagLines.push(line);
  }
  return tagLines.join("\n").trim() || text.trim();
}
