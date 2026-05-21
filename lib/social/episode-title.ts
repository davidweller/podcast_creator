/** Stored in project_data.titles_json */
export type TitlesJson = {
  canonical?: string;
};

export function parseTitlesJson(raw: string | null | undefined): TitlesJson {
  if (!raw?.trim()) return {};
  try {
    const parsed = JSON.parse(raw) as TitlesJson;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function serializeTitlesJson(data: TitlesJson): string {
  return JSON.stringify(data);
}

/** Take the first plausible canonical line from model output. */
export function normalizeCanonicalEpisodeTitle(
  raw: string,
  episodeNumber: number
): string {
  const expectedPrefix = String(episodeNumber).padStart(3, "0");
  const lines = raw
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);

  for (const line of lines) {
    if (line.startsWith(`${expectedPrefix} | `)) return line;
    if (/^\d{3} \| .+ \| .+/.test(line)) return line;
  }

  const single = lines[0] ?? raw.trim();
  if (single.includes(" | ")) return single;
  return single;
}

/** Fallback when research is unavailable: format from project fields only. */
export function formatEpisodeTitleFromProject(
  projectId: number,
  title: string,
  eraLocation: string
): string {
  const numberPart = String(projectId).padStart(3, "0");
  return `${numberPart} | ${title.trim()} | ${eraLocation.trim()}`;
}
