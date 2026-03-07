import type { ArchivalSearchResult } from "@/types/database";

const WIKIMEDIA_API_URL = "https://commons.wikimedia.org/w/api.php";

interface WikiPage {
  pageid: number;
  title: string;
  imageinfo?: Array<{
    url: string;
    thumburl?: string;
    descriptionurl: string;
    extmetadata?: {
      LicenseShortName?: { value: string };
      Artist?: { value: string };
      Credit?: { value: string };
      ImageDescription?: { value: string };
    };
  }>;
}

interface WikiResponse {
  query?: {
    pages?: Record<string, WikiPage>;
  };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

function getLicenseLabel(license: string | undefined): string {
  if (!license) return "Unknown";
  const text = license.toLowerCase();
  if (text.includes("public domain") || text === "pd" || text.includes("cc0")) {
    return "Public Domain";
  }
  if (text.includes("cc by-sa")) return "CC BY-SA";
  if (text.includes("cc by-nc-sa")) return "CC BY-NC-SA";
  if (text.includes("cc by-nc-nd")) return "CC BY-NC-ND";
  if (text.includes("cc by-nc")) return "CC BY-NC";
  if (text.includes("cc by-nd")) return "CC BY-ND";
  if (text.includes("cc by")) return "CC BY";
  return license;
}

export async function searchWikimedia(
  query: string,
  options: { limit?: number; photosOnly?: boolean } = {}
): Promise<ArchivalSearchResult[]> {
  const { limit = 20, photosOnly = false } = options;

  const searchQuery = photosOnly
    ? `${query} (photograph OR photo OR portrait) filetype:bitmap`
    : `${query} filetype:bitmap`;

  const searchParams = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: searchQuery,
    gsrnamespace: "6",
    gsrlimit: String(limit),
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: "300",
    origin: "*",
  });

  const response = await fetch(`${WIKIMEDIA_API_URL}?${searchParams}`, {
    headers: {
      "User-Agent": "CozyCrime/1.0 (Historical Research Tool; contact@example.com)",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Wikimedia Commons API error: ${response.status} - ${text}`);
  }

  const data: WikiResponse = await response.json();

  if (!data.query?.pages) {
    return [];
  }

  return Object.values(data.query.pages)
    .filter((page) => page.imageinfo && page.imageinfo.length > 0)
    .map((page) => {
      const info = page.imageinfo![0];
      const meta = info.extmetadata || {};

      const artist = meta.Artist?.value ? stripHtml(meta.Artist.value) : "";
      const credit = meta.Credit?.value ? stripHtml(meta.Credit.value) : "";
      const attribution = artist || credit || "Wikimedia Commons";

      const title = page.title.replace(/^File:/, "").replace(/\.[^/.]+$/, "");
      const description = meta.ImageDescription?.value
        ? stripHtml(meta.ImageDescription.value)
        : title;

      return {
        source: "wikimedia" as const,
        source_id: String(page.pageid),
        title: description.slice(0, 200),
        thumbnail_url: info.thumburl || info.url,
        full_url: info.url,
        rights_info: getLicenseLabel(meta.LicenseShortName?.value),
        attribution,
      };
    });
}
