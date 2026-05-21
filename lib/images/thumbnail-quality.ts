import sharp from "sharp";
import type { ImageCandidate16x9 } from "./ensure-16-9";

export interface ThumbnailQualityResult {
  score: number;
  passesThreshold: boolean;
  reasons: string[];
  metrics: {
    edgeEnergyTop: number;
    edgeEnergyBottom: number;
    edgeEnergyLeft: number;
    edgeEnergyRight: number;
    borderContrastRatio: number;
    safeZoneOccupancy: number;
  };
}

export interface ScoredThumbnailCandidate {
  strategy: ImageCandidate16x9["strategy"];
  buffer: Buffer;
  quality: ThumbnailQualityResult;
}

const DEFAULT_PASS_THRESHOLD = 64;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export async function scoreThumbnailBuffer(buffer: Buffer): Promise<ThumbnailQualityResult> {
  const raw = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const width = raw.info.width;
  const height = raw.info.height;
  const channels = raw.info.channels;
  const data = raw.data;

  const marginX = Math.max(8, Math.floor(width * 0.1));
  const marginY = Math.max(8, Math.floor(height * 0.1));
  const borderBand = Math.max(6, Math.floor(Math.min(width, height) * 0.03));

  const pixelLuma = (x: number, y: number): number => {
    const idx = (y * width + x) * channels;
    const r = data[idx] ?? 0;
    const g = data[idx + 1] ?? 0;
    const b = data[idx + 2] ?? 0;
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  };

  const bandEnergy = (
    xStart: number,
    xEnd: number,
    yStart: number,
    yEnd: number
  ): number => {
    let sum = 0;
    let count = 0;
    for (let y = yStart; y < yEnd - 1; y++) {
      for (let x = xStart; x < xEnd - 1; x++) {
        const l = pixelLuma(x, y);
        const dx = Math.abs(l - pixelLuma(x + 1, y));
        const dy = Math.abs(l - pixelLuma(x, y + 1));
        sum += dx + dy;
        count += 2;
      }
    }
    return count > 0 ? sum / count : 0;
  };

  const edgeEnergyTop = bandEnergy(0, width, 0, borderBand);
  const edgeEnergyBottom = bandEnergy(0, width, height - borderBand, height);
  const edgeEnergyLeft = bandEnergy(0, borderBand, 0, height);
  const edgeEnergyRight = bandEnergy(width - borderBand, width, 0, height);

  let borderContrastCount = 0;
  let borderPixels = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const inBorder =
        x < borderBand || x >= width - borderBand || y < borderBand || y >= height - borderBand;
      if (!inBorder) continue;
      const l = pixelLuma(x, y);
      if (l > 0.82 || l < 0.18) borderContrastCount++;
      borderPixels++;
    }
  }
  const borderContrastRatio = borderPixels > 0 ? borderContrastCount / borderPixels : 0;

  let occupiedInSafeMargins = 0;
  let marginPixels = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const inMargin =
        x < marginX || x >= width - marginX || y < marginY || y >= height - marginY;
      if (!inMargin) continue;
      const l = pixelLuma(x, y);
      // High local variation near borders tends to correlate with clipped faces/text.
      const right = x + 1 < width ? pixelLuma(x + 1, y) : l;
      const down = y + 1 < height ? pixelLuma(x, y + 1) : l;
      const gradient = Math.abs(l - right) + Math.abs(l - down);
      if (gradient > 0.25) occupiedInSafeMargins++;
      marginPixels++;
    }
  }
  const safeZoneOccupancy = marginPixels > 0 ? occupiedInSafeMargins / marginPixels : 0;

  let score = 100;
  score -= clamp((edgeEnergyTop - 0.08) * 180, 0, 30);
  score -= clamp((edgeEnergyBottom - 0.08) * 180, 0, 30);
  score -= clamp((edgeEnergyLeft - 0.08) * 120, 0, 20);
  score -= clamp((edgeEnergyRight - 0.08) * 120, 0, 20);
  score -= clamp((borderContrastRatio - 0.28) * 120, 0, 20);
  score -= clamp((safeZoneOccupancy - 0.24) * 160, 0, 30);
  score = clamp(Math.round(score), 0, 100);

  const reasons: string[] = [];
  if (edgeEnergyTop > 0.18) reasons.push("Top edge has high detail density (head/text cutoff risk).");
  if (edgeEnergyBottom > 0.18) reasons.push("Bottom edge has high detail density (text cutoff risk).");
  if (borderContrastRatio > 0.42) reasons.push("Very high-contrast content touches frame edges.");
  if (safeZoneOccupancy > 0.42) reasons.push("Important content likely spills into outer safe margins.");

  return {
    score,
    passesThreshold: score >= DEFAULT_PASS_THRESHOLD,
    reasons,
    metrics: {
      edgeEnergyTop: Number(edgeEnergyTop.toFixed(4)),
      edgeEnergyBottom: Number(edgeEnergyBottom.toFixed(4)),
      edgeEnergyLeft: Number(edgeEnergyLeft.toFixed(4)),
      edgeEnergyRight: Number(edgeEnergyRight.toFixed(4)),
      borderContrastRatio: Number(borderContrastRatio.toFixed(4)),
      safeZoneOccupancy: Number(safeZoneOccupancy.toFixed(4)),
    },
  };
}

export async function pickBestThumbnailCandidate(
  candidates: ImageCandidate16x9[]
): Promise<{ best: ScoredThumbnailCandidate; all: ScoredThumbnailCandidate[] }> {
  if (candidates.length === 0) {
    throw new Error("No thumbnail candidates were provided.");
  }

  const scored: ScoredThumbnailCandidate[] = [];
  for (const candidate of candidates) {
    const quality = await scoreThumbnailBuffer(candidate.buffer);
    scored.push({
      strategy: candidate.strategy,
      buffer: candidate.buffer,
      quality,
    });
  }

  scored.sort((a, b) => b.quality.score - a.quality.score);
  return { best: scored[0], all: scored };
}
