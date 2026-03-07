import sharp from "sharp";

const TARGET_WIDTH = 1920;
const TARGET_HEIGHT = 1080;
const TARGET_ASPECT = 16 / 9;

/**
 * Ensures the image is exactly 16:9 with no letterboxing or pillarboxing.
 * Center-crops to 16:9 if needed, then resizes to 1920x1080.
 * Returns PNG buffer.
 */
export async function ensure16x9(buffer: Buffer): Promise<Buffer> {
  const image = sharp(buffer);
  const meta = await image.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;

  if (width <= 0 || height <= 0) {
    throw new Error("Could not read image dimensions");
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
