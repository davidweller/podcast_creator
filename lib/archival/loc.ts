import type { ArchivalSearchResult } from "@/types/database";

const LOC_API_URL = "https://www.loc.gov/search/";

interface LocItem {
  id: string;
  title?: string;
  image_url?: string[];
  url?: string;
  rights_advisory?: string[];
  contributor?: string[];
  creator?: string[];
  repository?: string[];
}

interface LocResponse {
  results?: LocItem[];
}

function getRightsLabel(advisory: string | undefined): string {
  if (!advisory) return "Unknown";
  const text = advisory.toLowerCase();
  if (text.includes("no known restrictions") || text.includes("public domain")) {
    return "Public Domain";
  }
  if (text.includes("may be restricted")) return "Possibly Restricted";
  if (text.includes("copyright")) return "In Copyright";
  return "See Rights Statement";
}

function extractBestImageUrl(imageUrls: string[] | undefined, itemUrl: string | undefined): { thumbnail: string; full: string } {
  if (!imageUrls || imageUrls.length === 0) {
    return { thumbnail: "", full: itemUrl || "" };
  }

  let thumbnail = "";
  let full = "";

  for (const url of imageUrls) {
    if (url.includes("_thumb") || url.includes("/thumb/")) {
      thumbnail = url;
    } else if (url.includes("_large") || url.includes("/large/") || url.includes("_full")) {
      full = url;
    } else if (url.includes("_medium") || url.includes("/medium/")) {
      if (!thumbnail) thumbnail = url;
    }
  }

  if (!thumbnail) thumbnail = imageUrls[0];
  if (!full) full = imageUrls[imageUrls.length - 1];

  return { thumbnail, full };
}

export async function searchLoc(
  query: string,
  options: { count?: number; photosOnly?: boolean } = {}
): Promise<ArchivalSearchResult[]> {
  const { count = 20, photosOnly = false } = options;

  const params = new URLSearchParams({
    q: photosOnly ? `${query} photograph OR photo` : query,
    fo: "json",
    c: String(count),
    fa: photosOnly ? "partof:prints and photographs division" : "online-format:image",
  });

  const response = await fetch(`${LOC_API_URL}?${params}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "CozyCrime/1.0 (Historical Research Tool)",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Library of Congress API error: ${response.status} - ${text}`);
  }

  const data: LocResponse = await response.json();

  if (!data.results) {
    return [];
  }

  return data.results
    .filter((item) => item.image_url && item.image_url.length > 0)
    .map((item) => {
      const { thumbnail, full } = extractBestImageUrl(item.image_url, item.url);
      const creator = item.creator?.[0] || item.contributor?.[0] || "";
      const repository = item.repository?.[0] || "Library of Congress";
      const attribution = [creator, repository].filter(Boolean).join(" / ");

      return {
        source: "loc" as const,
        source_id: item.id || item.url || "",
        title: item.title || "Untitled",
        thumbnail_url: thumbnail,
        full_url: full,
        rights_info: getRightsLabel(item.rights_advisory?.[0]),
        attribution,
      };
    })
    .filter((item) => item.thumbnail_url);
}
