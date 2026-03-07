import type { ArchivalSearchResult } from "@/types/database";
import { searchEuropeana } from "./europeana";
import { searchLoc } from "./loc";
import { searchWikimedia } from "./wikimedia";
import { callClaude } from "@/lib/claude/client";

export interface UnifiedSearchOptions {
  europeana?: boolean;
  loc?: boolean;
  wikimedia?: boolean;
  limit?: number;
  photosOnly?: boolean;
}

export async function searchAllArchives(
  query: string,
  options: UnifiedSearchOptions = {}
): Promise<{
  results: ArchivalSearchResult[];
  errors: { source: string; error: string }[];
}> {
  const {
    europeana = true,
    loc = true,
    wikimedia = true,
    limit = 20,
    photosOnly = false,
  } = options;

  const results: ArchivalSearchResult[] = [];
  const errors: { source: string; error: string }[] = [];

  const searches: Promise<void>[] = [];

  if (europeana) {
    searches.push(
      searchEuropeana(query, { rows: limit, photosOnly })
        .then((items) => { results.push(...items); })
        .catch((err) => { errors.push({ source: "europeana", error: err.message }); })
    );
  }

  if (loc) {
    searches.push(
      searchLoc(query, { count: limit, photosOnly })
        .then((items) => { results.push(...items); })
        .catch((err) => { errors.push({ source: "loc", error: err.message }); })
    );
  }

  if (wikimedia) {
    searches.push(
      searchWikimedia(query, { limit, photosOnly })
        .then((items) => { results.push(...items); })
        .catch((err) => { errors.push({ source: "wikimedia", error: err.message }); })
    );
  }

  await Promise.all(searches);

  return { results, errors };
}

export async function extractKeywordsFromScript(
  script: string,
  projectTitle: string,
  eraLocation: string
): Promise<string[]> {
  const prompt = `You are extracting search keywords from a historical true crime script for finding archival images.

Project: ${projectTitle}
Era/Location: ${eraLocation}

Script excerpt (first 8000 characters):
${script.slice(0, 8000)}

Extract 10-15 search keywords that would help find relevant historical images from archives like Europeana, Library of Congress, and Wikimedia Commons.

Focus on:
- Names of key people mentioned (victims, perpetrators, investigators)
- Specific locations (cities, streets, buildings, landmarks)
- Time period descriptors (e.g., "Victorian England", "1870s Durham")
- Historical events or contexts
- Objects, clothing, or settings that might appear in period photographs
- Occupations or social roles mentioned

Return ONLY a JSON array of keywords, nothing else. Example:
["Mary Ann Cotton", "Victorian Durham", "West Auckland", "1870s England", "arsenic poisoning", "workhouse", "Victorian mourning dress"]`;

  const response = await callClaude(prompt, {
    maxTokens: 500,
    temperature: 0.3,
  });

  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [projectTitle, eraLocation];
  } catch {
    return [projectTitle, eraLocation];
  }
}

export { searchEuropeana } from "./europeana";
export { searchLoc } from "./loc";
export { searchWikimedia } from "./wikimedia";
