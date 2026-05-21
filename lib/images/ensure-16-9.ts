import sharp from "sharp";

const TARGET_WIDTH = 1920;
const TARGET_HEIGHT = 1080;
const TARGET_ASPECT = 16 / 9;
const CONTAIN_BACKGROUND = { r: 18, g: 18, b: 18, alpha: 1 };

export type Ensure16x9Mode = "crop" | "contain" | "smartCrop";
interface Ensure16x9Options {
  mode?: Ensure16x9Mode;
}

export interface ImageCandidate16x9 {
  strategy: "attention" | "entropy" | "center";
  buffer: Buffer;
}

/**
 * Ensures the image is exactly 16:9.
 * - crop: center-crops to 16:9 when needed (full-bleed)
 * - contain: preserves entire frame and pads to 16:9 when needed
 * Returns PNG buffer.
 */
export async function ensure16x9(
  buffer: Buffer,
  options: Ensure16x9Options = {}
): Promise<Buffer> {
  const mode = options.mode ?? "crop";
  const image = sharp(buffer);
  const meta = await image.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;

  if (width <= 0 || height <= 0) {
    throw new Error("Could not read image dimensions");
  }

  if (mode === "contain") {
    return image
      .resize(TARGET_WIDTH, TARGET_HEIGHT, {
        fit: "contain",
        background: CONTAIN_BACKGROUND,
        position: "centre",
      })
      .png()
      .toBuffer();
  }

  if (mode === "smartCrop") {
    return image
      .resize(TARGET_WIDTH, TARGET_HEIGHT, {
        fit: "cover",
        position: sharp.strategy.attention,
      })
      .png()
      .toBuffer();
  }

  const aspect = width / height;
  let crop: { width: number; height: number; left: number; top: number } | null = null;

  if (Math.abs(aspect - TARGET_ASPECT) < 0.01) {
    // Already 16:9 (within 1%), just resize
  } else if (aspect > TARGET_ASPECT) {
    // Too wide: keep full height, crop width
    const cropWidth = Math.round(height * TARGET_ASPECT);
    crop = {
      width: cropWidth,
      height,
      left: Math.round((width - cropWidth) / 2),
      top: 0,
    };
  } else {
    // Too tall: keep full width, crop height
    const cropHeight = Math.round(width / TARGET_ASPECT);
    crop = {
      width,
      height: cropHeight,
      left: 0,
      top: Math.round((height - cropHeight) / 2),
    };
  }

  let pipeline = image;
  if (crop) {
    pipeline = pipeline.extract(crop);
  }
  return pipeline
    .resize(TARGET_WIDTH, TARGET_HEIGHT)
    .png()
    .toBuffer();
}

export async function generate16x9Candidates(
  buffer: Buffer
): Promise<ImageCandidate16x9[]> {
  const candidates: ImageCandidate16x9[] = [];
  const base = sharp(buffer);
  const meta = await base.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;

  if (width <= 0 || height <= 0) {
    throw new Error("Could not read image dimensions");
  }

  const addCandidate = async (
    strategy: ImageCandidate16x9["strategy"],
    options:
      | { fit: "cover"; position: sharp.Gravity | (typeof sharp.strategy)[keyof typeof sharp.strategy] }
      | { fit: "contain"; background: { r: number; g: number; b: number; alpha: number }; position: sharp.Gravity }
  ) => {
    const candidate = await sharp(buffer)
      .resize(TARGET_WIDTH, TARGET_HEIGHT, options)
      .png()
      .toBuffer();
    candidates.push({ strategy, buffer: candidate });
  };

  await addCandidate("attention", {
    fit: "cover",
    position: sharp.strategy.attention,
  });

  await addCandidate("entropy", {
    fit: "cover",
    position: sharp.strategy.entropy,
  });

  await addCandidate("center", {
    fit: "cover",
    position: "centre",
  });

  return candidates;
}
