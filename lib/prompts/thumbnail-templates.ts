import { readFileSync } from "fs";
import path from "path";

const MD_PATH = path.join(process.cwd(), "lib", "prompts", "ThumbnailPrompt.md");

interface ThumbnailTemplates {
  cozy: string;
  cinematic: string;
  formula: string;
}

let cached: ThumbnailTemplates | null = null;

function extractBetween(source: string, startMarker: string, endMarkers: string[]): string {
  const startIdx = source.indexOf(startMarker);
  if (startIdx === -1) {
    throw new Error(
      `ThumbnailPrompt.md: missing required section marker "${startMarker}". Check the file formatting.`
    );
  }
  const after = source.slice(startIdx + startMarker.length);
  let endIdx = after.length;
  for (const marker of endMarkers) {
    const i = after.indexOf(marker);
    if (i !== -1 && i < endIdx) endIdx = i;
  }
  return after.slice(0, endIdx).trim();
}

function loadTemplates(): ThumbnailTemplates {
  const raw = readFileSync(MD_PATH, "utf8");

  const cozy = extractBetween(raw, "COZY THUMBNAIL PROMPT", [
    "CINEMATIC THUMBNAIL PROMPT",
    "4) How to apply",
  ]);
  const cinematic = extractBetween(raw, "CINEMATIC THUMBNAIL PROMPT", [
    "4) How to apply",
  ]);
  const formula = extractBetween(raw, "1) The underlying formula", [
    "2) Cozy vs Cinematic",
  ]);

  if (!cozy || !cinematic || !formula) {
    throw new Error("ThumbnailPrompt.md: one or more template blocks are empty after parsing.");
  }

  return { cozy, cinematic, formula };
}

function getTemplates(): ThumbnailTemplates {
  if (cached) return cached;
  cached = loadTemplates();
  return cached;
}

export function getCozyTemplate(): string {
  return getTemplates().cozy;
}

export function getCinematicTemplate(): string {
  return getTemplates().cinematic;
}

export function getThumbnailFormula(): string {
  return getTemplates().formula;
}
