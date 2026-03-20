/**
 * Helpers for merging Google Cloud TTS LINEAR16 output (WAV with RIFF header and/or raw PCM segments).
 */

export function parseWav(buffer: Buffer): {
  pcm: Buffer;
  sampleRate: number;
  channels: number;
  bitsPerSample: number;
} {
  if (buffer.length < 12 || buffer.subarray(0, 4).toString("ascii") !== "RIFF") {
    throw new Error("Not a RIFF file");
  }
  if (buffer.subarray(8, 12).toString("ascii") !== "WAVE") {
    throw new Error("Not a WAVE RIFF file");
  }

  let offset = 12;
  let sampleRate = 24000;
  let channels = 1;
  let bitsPerSample = 16;
  let pcm: Buffer | null = null;

  while (offset + 8 <= buffer.length) {
    const chunkId = buffer.subarray(offset, offset + 4).toString("ascii");
    const chunkSize = buffer.readUInt32LE(offset + 4);
    const dataOffset = offset + 8;
    const paddedSize = chunkSize + (chunkSize % 2);

    if (chunkId === "fmt ") {
      const audioFormat = buffer.readUInt16LE(dataOffset);
      if (audioFormat !== 1) {
        throw new Error(`Unsupported WAV wave format codec ${audioFormat}`);
      }
      channels = buffer.readUInt16LE(dataOffset + 2);
      sampleRate = buffer.readUInt32LE(dataOffset + 4);
      bitsPerSample = buffer.readUInt16LE(dataOffset + 14);
    } else if (chunkId === "data") {
      pcm = buffer.subarray(dataOffset, dataOffset + chunkSize);
    }

    offset = dataOffset + paddedSize;
  }

  if (!pcm) {
    throw new Error("WAV file has no data chunk");
  }

  return { pcm, sampleRate, channels, bitsPerSample };
}

export function buildWav(
  pcm: Buffer,
  sampleRate: number,
  channels: number,
  bitsPerSample: number
): Buffer {
  const blockAlign = (channels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = pcm.length;
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);
  return Buffer.concat([header, pcm]);
}

function isWav(buffer: Buffer): boolean {
  return (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WAVE"
  );
}

/**
 * Combine streaming or batched TTS buffers into one WAV.
 * Each piece may be a full WAV (header + PCM) or a raw PCM continuation.
 */
export function mergeLinear16AudioChunks(chunks: Buffer[]): Buffer {
  if (chunks.length === 0) {
    throw new Error("No audio chunks to merge");
  }

  if (chunks.length === 1 && isWav(chunks[0])) {
    return chunks[0];
  }

  const pcmParts: Buffer[] = [];
  let sampleRate = 24000;
  let channels = 1;
  let bitsPerSample = 16;

  for (const chunk of chunks) {
    if (isWav(chunk)) {
      const parsed = parseWav(chunk);
      pcmParts.push(parsed.pcm);
      sampleRate = parsed.sampleRate;
      channels = parsed.channels;
      bitsPerSample = parsed.bitsPerSample;
    } else {
      pcmParts.push(chunk);
    }
  }

  const pcm = Buffer.concat(pcmParts);
  return buildWav(pcm, sampleRate, channels, bitsPerSample);
}
