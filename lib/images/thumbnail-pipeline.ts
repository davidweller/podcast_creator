import { generate16x9Candidates } from "./ensure-16-9";
import { pickBestThumbnailCandidate } from "./thumbnail-quality";

const MAX_RETRIES_DEFAULT = 2;

function appendRetrySafetyRules(prompt: string, attempt: number, strictMode: boolean): string {
  const strictLine = strictMode
    ? "\n- Use wider framing than usual; avoid dramatic close crop."
    : "";
  return `${prompt.trim()}

Retry attempt ${attempt}: keep framing conservative for a YouTube thumbnail.
- Keep full head, hair, and shoulders visible with at least 12% top and bottom safe margins.
- Keep all hook text fully inside frame with at least 12% margin from each edge.
- Keep major subject and key object away from outer edge zones.
- Avoid any cropping of forehead, chin, or hook text.${strictLine}`;
}

export interface ThumbnailPipelineMeta {
  attemptCount: number;
  usedRetry: boolean;
  pass: boolean;
  score: number;
  strategy: "attention" | "entropy" | "center";
  reasons: string[];
  allCandidates: Array<{
    strategy: "attention" | "entropy" | "center";
    score: number;
    passesThreshold: boolean;
    reasons: string[];
  }>;
}

export interface ThumbnailPipelineResult {
  finalPrompt: string;
  imageBuffer: Buffer;
  meta: ThumbnailPipelineMeta;
}

export async function generateThumbnailWithRetries(options: {
  prompt: string;
  maxRetries?: number;
  strictMode?: boolean;
  minPassScore?: number;
  generateSourceImage: (prompt: string) => Promise<Buffer>;
}): Promise<ThumbnailPipelineResult> {
  const maxRetries = options.maxRetries ?? MAX_RETRIES_DEFAULT;
  const strictMode = Boolean(options.strictMode);
  const minPassScore = options.minPassScore ?? 64;
  let bestOverall:
    | {
        prompt: string;
        score: number;
        imageBuffer: Buffer;
        strategy: "attention" | "entropy" | "center";
        reasons: string[];
        passesThreshold: boolean;
        allCandidates: Array<{
          strategy: "attention" | "entropy" | "center";
          score: number;
          passesThreshold: boolean;
          reasons: string[];
        }>;
      }
    | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const attemptPrompt =
      attempt === 0 ? options.prompt : appendRetrySafetyRules(options.prompt, attempt, strictMode);
    const source = await options.generateSourceImage(attemptPrompt);
    const candidates = await generate16x9Candidates(source);
    const { best, all } = await pickBestThumbnailCandidate(candidates);

    if (!bestOverall || best.quality.score > bestOverall.score) {
      bestOverall = {
        prompt: attemptPrompt,
        score: best.quality.score,
        imageBuffer: best.buffer,
        strategy: best.strategy,
        reasons: best.quality.reasons,
        passesThreshold: best.quality.score >= minPassScore,
        allCandidates: all.map((candidate) => ({
          strategy: candidate.strategy,
          score: candidate.quality.score,
          passesThreshold: candidate.quality.score >= minPassScore,
          reasons: candidate.quality.reasons,
        })),
      };
    }

    if (best.quality.score >= minPassScore) {
      return {
        finalPrompt: attemptPrompt,
        imageBuffer: best.buffer,
        meta: {
          attemptCount: attempt + 1,
          usedRetry: attempt > 0,
          pass: true,
          score: best.quality.score,
          strategy: best.strategy,
          reasons: best.quality.reasons,
          allCandidates: all.map((candidate) => ({
            strategy: candidate.strategy,
            score: candidate.quality.score,
            passesThreshold: candidate.quality.score >= minPassScore,
            reasons: candidate.quality.reasons,
          })),
        },
      };
    }
  }

  if (!bestOverall) {
    throw new Error("Thumbnail pipeline failed to produce any candidates.");
  }

  return {
    finalPrompt: bestOverall.prompt,
    imageBuffer: bestOverall.imageBuffer,
    meta: {
      attemptCount: maxRetries + 1,
      usedRetry: maxRetries > 0,
      pass: bestOverall.passesThreshold,
      score: bestOverall.score,
      strategy: bestOverall.strategy,
      reasons: bestOverall.reasons,
      allCandidates: bestOverall.allCandidates,
    },
  };
}
