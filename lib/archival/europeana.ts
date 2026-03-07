import type { ArchivalSearchResult } from "@/types/database";

const EUROPEANA_API_URL = "https://api.europeana.eu/record/v2/search.json";

interface EuropeanaItem {
  id: string;
  title?: string[];
  edmPreview?: string[];
  edmIsShownBy?: string[];
  edmIsShownAt?: string[];
  rights?: string[];
  dcCreator?: string[];
  dataProvider?: string[];
}

interface EuropeanaResponse {
  success: boolean;
  itemsCount: number;
  totalResults: number;
  items?: EuropeanaItem[];
}

function getApiKey(): string {
  const key = process.env.EUROPEANA_API_KEY;
  if (!key) {
    throw new Error("EUROPEANA_API_KEY environment variable is not set");
  }
  return key;
}

function getRightsLabel(rightsUrl: string | undefined): string {
  if (!rightsUrl) return "Unknown";
  const url = rightsUrl.toLowerCase();
  if (url.includes("publicdomain") || url.includes("cc0") || url.includes("pdm")) {
    return "Public Domain";
  }
  if (url.includes("by-sa")) return "CC BY-SA";
  if (url.includes("by-nc-sa")) return "CC BY-NC-SA";
  if (url.includes("by-nc-nd")) return "CC BY-NC-ND";
  if (url.includes("by-nc")) return "CC BY-NC";
  if (url.includes("by-nd")) return "CC BY-ND";
  if (url.includes("by")) return "CC BY";
  if (url.includes("incopyright") || url.includes("in-copyright")) return "In Copyright";
  if (url.includes("orphan")) return "Orphan Work";
  return "Rights Reserved";
}

export async function searchEuropeana(
  query: string,
  options: { rows?: number; photosOnly?: boolean } = {}
): Promise<ArchivalSearchResult[]> {
  const { rows = 20, photosOnly = false } = options;

  const params = new URLSearchParams({
    wskey: getApiKey(),
    query: photosOnly ? `${query} what:photograph` : query,
    rows: String(rows),
    media: "true",
    qf: "TYPE:IMAGE",
    profile: "standard",
  });

  const response = await fetch(`${EUROPEANA_API_URL}?${params}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Europeana API error: ${response.status} - ${text}`);
  }

  const data: EuropeanaResponse = await response.json();

  if (!data.success || !data.items) {
    return [];
  }

  return data.items
    .filter((item) => item.edmPreview?.[0])
    .map((item) => {
      const thumbnailUrl = item.edmPreview?.[0] || "";
      const fullUrl = item.edmIsShownBy?.[0] || item.edmIsShownAt?.[0] || thumbnailUrl;
      const creator = item.dcCreator?.[0] || "";
      const provider = item.dataProvider?.[0] || "";
      const attribution = [creator, provider].filter(Boolean).join(" / ") || "Europeana";

      return {
        source: "europeana" as const,
        source_id: item.id,
        title: item.title?.[0] || "Untitled",
        thumbnail_url: thumbnailUrl,
        full_url: fullUrl,
        rights_info: getRightsLabel(item.rights?.[0]),
        attribution,
      };
    });
}
