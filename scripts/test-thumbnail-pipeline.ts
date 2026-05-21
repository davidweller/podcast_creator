import assert from "node:assert/strict";
import sharp from "sharp";
import { scoreThumbnailBuffer, pickBestThumbnailCandidate } from "@/lib/images/thumbnail-quality";
import { generate16x9Candidates } from "@/lib/images/ensure-16-9";
import { generateThumbnailWithRetries } from "@/lib/images/thumbnail-pipeline";

async function buildFixtureImage(options: {
  width: number;
  height: number;
  background: { r: number; g: number; b: number; alpha?: number };
  edgeBand?: boolean;
  extremeEdgeNoise?: boolean;
}): Promise<Buffer> {
  const base = sharp({
    create: {
      width: options.width,
      height: options.height,
      channels: 4,
      background: options.background,
    },
  });

  if (!options.edgeBand && !options.extremeEdgeNoise) {
    return base.png().toBuffer();
  }

  if (options.extremeEdgeNoise) {
    const edgeHeight = Math.max(16, Math.floor(options.height * 0.12));
    const stripeHeight = 6;
    let stripes = "";
    for (let y = 0; y < edgeHeight; y += stripeHeight) {
      const color = Math.floor(y / stripeHeight) % 2 === 0 ? "#ffffff" : "#000000";
      stripes += `<rect x="0" y="${y}" width="${options.width}" height="${stripeHeight}" fill="${color}"/>`;
      stripes += `<rect x="0" y="${options.height - edgeHeight + y}" width="${options.width}" height="${stripeHeight}" fill="${color === "#ffffff" ? "#000000" : "#ffffff"}"/>`;
    }
    const sideBand = Math.max(16, Math.floor(options.width * 0.08));
    const svg = `<svg width="${options.width}" height="${options.height}">
      ${stripes}
      <rect x="0" y="0" width="${sideBand}" height="${options.height}" fill="#ffffff"/>
      <rect x="${options.width - sideBand}" y="0" width="${sideBand}" height="${options.height}" fill="#000000"/>
    </svg>`;
    return base.composite([{ input: Buffer.from(svg), top: 0, left: 0 }]).png().toBuffer();
  }

  const edgeHeight = Math.max(16, Math.floor(options.height * 0.08));
  const svg = `<svg width="${options.width}" height="${options.height}">
    <rect x="0" y="0" width="${options.width}" height="${edgeHeight}" fill="#ffffff"/>
    <rect x="0" y="${options.height - edgeHeight}" width="${options.width}" height="${edgeHeight}" fill="#000000"/>
  </svg>`;
  return base.composite([{ input: Buffer.from(svg), top: 0, left: 0 }]).png().toBuffer();
}

async function testScoring() {
  const calm = await buildFixtureImage({
    width: 1920,
    height: 1080,
    background: { r: 58, g: 72, b: 90, alpha: 1 },
    edgeBand: false,
  });
  const edgeHeavy = await buildFixtureImage({
    width: 1920,
    height: 1080,
    background: { r: 58, g: 72, b: 90, alpha: 1 },
    edgeBand: true,
  });

  const calmScore = await scoreThumbnailBuffer(calm);
  const edgeScore = await scoreThumbnailBuffer(edgeHeavy);

  assert.ok(
    calmScore.score > edgeScore.score,
    `Expected calm fixture to score higher (calm=${calmScore.score}, edge=${edgeScore.score})`
  );
}

async function testCandidateSelection() {
  const source = await buildFixtureImage({
    width: 1024,
    height: 1024,
    background: { r: 40, g: 40, b: 40, alpha: 1 },
    edgeBand: true,
  });
  const candidates = await generate16x9Candidates(source);
  assert.equal(candidates.length, 3, "Expected three crop candidates");
  const result = await pickBestThumbnailCandidate(candidates);
  assert.ok(result.best.quality.score >= 0 && result.best.quality.score <= 100);
}

async function testRetryBehavior() {
  let callCount = 0;
  const safeImage = await buildFixtureImage({
    width: 1792,
    height: 1024,
    background: { r: 66, g: 80, b: 99, alpha: 1 },
    edgeBand: false,
  });
  const riskyImage = await buildFixtureImage({
    width: 1792,
    height: 1024,
    background: { r: 66, g: 80, b: 99, alpha: 1 },
    extremeEdgeNoise: true,
  });

  const result = await generateThumbnailWithRetries({
    prompt: "Test prompt",
    maxRetries: 2,
    strictMode: true,
    minPassScore: 95,
    generateSourceImage: async () => {
      callCount += 1;
      return callCount === 1 ? riskyImage : safeImage;
    },
  });

  assert.ok(callCount >= 2, "Expected retry path to run after first risky candidate.");
  assert.ok(result.meta.score >= 0 && result.meta.score <= 100);
}

async function main() {
  await testScoring();
  await testCandidateSelection();
  await testRetryBehavior();
  console.log("Thumbnail pipeline checks passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
