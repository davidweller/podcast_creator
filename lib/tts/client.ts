import { TextToSpeechClient, protos } from "@google-cloud/text-to-speech";
import { mergeLinear16AudioChunks } from "@/lib/tts/wav";

type ISynthesizeSpeechRequest = protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest;
type AudioEncoding = protos.google.cloud.texttospeech.v1.AudioEncoding;
type StreamingSynthesizeResponse =
  protos.google.cloud.texttospeech.v1.StreamingSynthesizeResponse;

const AudioEncodingEnum = protos.google.cloud.texttospeech.v1.AudioEncoding;

const MAX_BYTES = 4500; // Leave some margin below the 5000 byte limit

let client: TextToSpeechClient | null = null;

function getClient(): TextToSpeechClient {
  if (client) {
    return client;
  }
  client = new TextToSpeechClient();
  return client;
}

function bufferFromAudioContent(
  content: Uint8Array | string | Buffer | null | undefined
): Buffer | null {
  if (content == null) {
    return null;
  }
  if (Buffer.isBuffer(content)) {
    return content;
  }
  if (typeof content === "string") {
    return Buffer.from(content, "base64");
  }
  return Buffer.from(content);
}

/**
 * Split text into chunks that fit within the byte limit.
 * Tries to split on paragraph boundaries, then sentence boundaries, then word boundaries.
 */
function splitTextIntoChunks(text: string, maxBytes: number = MAX_BYTES): string[] {
  const chunks: string[] = [];
  
  // Split by paragraphs first
  const paragraphs = text.split(/\n\n+/);
  let currentChunk = "";
  
  for (const paragraph of paragraphs) {
    const paragraphWithBreak = currentChunk ? "\n\n" + paragraph : paragraph;
    const potentialChunk = currentChunk + paragraphWithBreak;
    
    if (Buffer.byteLength(potentialChunk, "utf8") <= maxBytes) {
      currentChunk = potentialChunk;
    } else {
      // Current paragraph would exceed limit
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
      }
      
      // Check if the paragraph itself is too long
      if (Buffer.byteLength(paragraph, "utf8") <= maxBytes) {
        currentChunk = paragraph;
      } else {
        // Need to split the paragraph by sentences
        const sentenceChunks = splitBySentences(paragraph, maxBytes);
        for (let i = 0; i < sentenceChunks.length - 1; i++) {
          chunks.push(sentenceChunks[i].trim());
        }
        currentChunk = sentenceChunks[sentenceChunks.length - 1] || "";
      }
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.filter(c => c.length > 0);
}

function splitBySentences(text: string, maxBytes: number): string[] {
  const chunks: string[] = [];
  // Split on sentence endings
  const sentences = text.split(/(?<=[.!?])\s+/);
  let currentChunk = "";
  
  for (const sentence of sentences) {
    const potentialChunk = currentChunk ? currentChunk + " " + sentence : sentence;
    
    if (Buffer.byteLength(potentialChunk, "utf8") <= maxBytes) {
      currentChunk = potentialChunk;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
        currentChunk = "";
      }
      
      // Check if sentence itself is too long
      if (Buffer.byteLength(sentence, "utf8") <= maxBytes) {
        currentChunk = sentence;
      } else {
        // Split by words as last resort
        const wordChunks = splitByWords(sentence, maxBytes);
        for (let i = 0; i < wordChunks.length - 1; i++) {
          chunks.push(wordChunks[i]);
        }
        currentChunk = wordChunks[wordChunks.length - 1] || "";
      }
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

function splitByWords(text: string, maxBytes: number): string[] {
  const chunks: string[] = [];
  const words = text.split(/\s+/);
  let currentChunk = "";
  
  for (const word of words) {
    const potentialChunk = currentChunk ? currentChunk + " " + word : word;
    
    if (Buffer.byteLength(potentialChunk, "utf8") <= maxBytes) {
      currentChunk = potentialChunk;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      currentChunk = word;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

export interface SynthesizeOptions {
  text: string;
  voiceName: string;
  languageCode: string;
  speakingRate?: number;
  audioEncoding?: "MP3" | "LINEAR16" | "OGG_OPUS";
}

export const CHIRP3_HD_VOICES = {
  female: [
    "Achernar",
    "Aoede",
    "Autonoe",
    "Callirrhoe",
    "Despina",
    "Erinome",
    "Gacrux",
    "Kore",
    "Laomedeia",
    "Leda",
    "Pulcherrima",
    "Sulafat",
    "Vindemiatrix",
    "Zephyr",
  ],
  male: [
    "Achird",
    "Algenib",
    "Algieba",
    "Alnilam",
    "Charon",
    "Enceladus",
    "Fenrir",
    "Iapetus",
    "Orus",
    "Puck",
    "Rasalgethi",
    "Sadachbia",
    "Sadaltager",
    "Schedar",
    "Umbriel",
    "Zubenelgenubi",
  ],
};

export const SUPPORTED_LANGUAGES = [
  { code: "en-US", label: "English (United States)" },
  { code: "en-GB", label: "English (United Kingdom)" },
  { code: "en-AU", label: "English (Australia)" },
  { code: "en-IN", label: "English (India)" },
  { code: "es-ES", label: "Spanish (Spain)" },
  { code: "es-US", label: "Spanish (United States)" },
  { code: "fr-FR", label: "French (France)" },
  { code: "fr-CA", label: "French (Canada)" },
  { code: "de-DE", label: "German (Germany)" },
  { code: "it-IT", label: "Italian (Italy)" },
  { code: "pt-BR", label: "Portuguese (Brazil)" },
  { code: "nl-NL", label: "Dutch (Netherlands)" },
  { code: "nl-BE", label: "Dutch (Belgium)" },
  { code: "pl-PL", label: "Polish (Poland)" },
  { code: "ru-RU", label: "Russian (Russia)" },
  { code: "ja-JP", label: "Japanese (Japan)" },
  { code: "ko-KR", label: "Korean (South Korea)" },
  { code: "cmn-CN", label: "Mandarin Chinese (China)" },
  { code: "hi-IN", label: "Hindi (India)" },
  { code: "ar-XA", label: "Arabic (Generic)" },
  { code: "tr-TR", label: "Turkish (Turkey)" },
  { code: "sv-SE", label: "Swedish (Sweden)" },
  { code: "da-DK", label: "Danish (Denmark)" },
  { code: "nb-NO", label: "Norwegian Bokmål (Norway)" },
  { code: "fi-FI", label: "Finnish (Finland)" },
  { code: "el-GR", label: "Greek (Greece)" },
  { code: "he-IL", label: "Hebrew (Israel)" },
  { code: "th-TH", label: "Thai (Thailand)" },
  { code: "vi-VN", label: "Vietnamese (Vietnam)" },
  { code: "id-ID", label: "Indonesian (Indonesia)" },
  { code: "uk-UA", label: "Ukrainian (Ukraine)" },
  { code: "cs-CZ", label: "Czech (Czech Republic)" },
  { code: "ro-RO", label: "Romanian (Romania)" },
  { code: "hu-HU", label: "Hungarian (Hungary)" },
  { code: "bg-BG", label: "Bulgarian (Bulgaria)" },
  { code: "sk-SK", label: "Slovak (Slovakia)" },
  { code: "hr-HR", label: "Croatian (Croatia)" },
  { code: "sl-SI", label: "Slovenian (Slovenia)" },
  { code: "sr-RS", label: "Serbian (Cyrillic)" },
  { code: "lt-LT", label: "Lithuanian (Lithuania)" },
  { code: "lv-LV", label: "Latvian (Latvia)" },
  { code: "et-EE", label: "Estonian (Estonia)" },
  { code: "ta-IN", label: "Tamil (India)" },
  { code: "te-IN", label: "Telugu (India)" },
  { code: "ml-IN", label: "Malayalam (India)" },
  { code: "kn-IN", label: "Kannada (India)" },
  { code: "mr-IN", label: "Marathi (India)" },
  { code: "gu-IN", label: "Gujarati (India)" },
  { code: "bn-IN", label: "Bengali (India)" },
  { code: "ur-IN", label: "Urdu (India)" },
  { code: "sw-KE", label: "Swahili (Kenya)" },
];

function buildVoiceName(languageCode: string, voiceName: string): string {
  return `${languageCode}-Chirp3-HD-${voiceName}`;
}

function getAudioEncoding(encoding: string): AudioEncoding {
  switch (encoding) {
    case "MP3":
      return AudioEncodingEnum.MP3;
    case "LINEAR16":
      return AudioEncodingEnum.LINEAR16;
    case "OGG_OPUS":
      return AudioEncodingEnum.OGG_OPUS;
    default:
      return AudioEncodingEnum.MP3;
  }
}

/**
 * Synthesize a single chunk of text (must be under 5000 bytes).
 */
async function synthesizeChunk(
  text: string,
  voiceName: string,
  languageCode: string,
  speakingRate: number,
  audioEncoding: AudioEncoding
): Promise<Buffer> {
  const ttsClient = getClient();
  const fullVoiceName = buildVoiceName(languageCode, voiceName);

  const request: ISynthesizeSpeechRequest = {
    input: { text },
    voice: {
      languageCode,
      name: fullVoiceName,
    },
    audioConfig: {
      audioEncoding,
      speakingRate,
    },
  };

  const [response] = await ttsClient.synthesizeSpeech(request);

  if (!response.audioContent) {
    throw new Error("No audio content in TTS response");
  }

  if (typeof response.audioContent === "string") {
    return Buffer.from(response.audioContent, "base64");
  }

  return Buffer.from(response.audioContent);
}

async function synthesizeSpeechChunkedLossyConcat(
  options: SynthesizeOptions,
  onProgress?: SynthesizeProgressCallback
): Promise<Buffer> {
  const { text, voiceName, languageCode, speakingRate = 1.0, audioEncoding = "MP3" } =
    options;
  const encoding = getAudioEncoding(audioEncoding);
  const chunks = splitTextIntoChunks(text);
  console.log(`TTS lossy concat: ${chunks.length} chunks (${audioEncoding})`);

  const audioBuffers: Buffer[] = [];
  for (let i = 0; i < chunks.length; i++) {
    onProgress?.(i + 1, chunks.length);
    console.log(
      `Synthesizing chunk ${i + 1}/${chunks.length} (${Buffer.byteLength(chunks[i], "utf8")} bytes)`
    );
    audioBuffers.push(
      await synthesizeChunk(chunks[i], voiceName, languageCode, speakingRate, encoding)
    );
  }
  return Buffer.concat(audioBuffers);
}

async function synthesizeSpeechChunkedLinearMerge(
  options: SynthesizeOptions,
  onProgress?: SynthesizeProgressCallback
): Promise<Buffer> {
  const { text, voiceName, languageCode, speakingRate = 1.0 } = options;
  const chunks = splitTextIntoChunks(text);
  console.log(`TTS chunked LINEAR16 merge: ${chunks.length} chunks`);

  const audioBuffers: Buffer[] = [];
  for (let i = 0; i < chunks.length; i++) {
    onProgress?.(i + 1, chunks.length);
    const audioBuffer = await synthesizeChunk(
      chunks[i],
      voiceName,
      languageCode,
      speakingRate,
      AudioEncodingEnum.LINEAR16
    );
    audioBuffers.push(audioBuffer);
  }
  return mergeLinear16AudioChunks(audioBuffers);
}

/**
 * Bidirectional streaming (Chirp 3 HD). First write must be streamingConfig only, then text chunks.
 */
async function synthesizeSpeechStreaming(
  options: SynthesizeOptions,
  onProgress?: SynthesizeProgressCallback
): Promise<Buffer> {
  const ttsClient = getClient();
  const { text, voiceName, languageCode, speakingRate = 1.0 } = options;
  const fullVoiceName = buildVoiceName(languageCode, voiceName);
  const textChunks = splitTextIntoChunks(text);

  return new Promise((resolve, reject) => {
    const stream = ttsClient.streamingSynthesize();
    const audioChunks: Buffer[] = [];
    let settled = false;

    const finish = (err: Error | null, result?: Buffer) => {
      if (settled) {
        return;
      }
      settled = true;
      if (err) {
        reject(err);
      } else if (result) {
        resolve(result);
      } else {
        reject(new Error("TTS streaming ended without audio"));
      }
    };

    stream.on("data", (response: StreamingSynthesizeResponse) => {
      const buf = bufferFromAudioContent(
        response.audioContent as Buffer | Uint8Array | string | undefined
      );
      if (buf && buf.length > 0) {
        audioChunks.push(buf);
      }
    });

    stream.on("error", (err: Error) => finish(err));

    stream.on("end", () => {
      try {
        if (audioChunks.length === 0) {
          finish(new Error("TTS streaming returned no audio"));
          return;
        }
        finish(null, mergeLinear16AudioChunks(audioChunks));
      } catch (e) {
        finish(e instanceof Error ? e : new Error(String(e)));
      }
    });

    stream.write({
      streamingConfig: {
        voice: {
          languageCode,
          name: fullVoiceName,
        },
        streamingAudioConfig: {
          audioEncoding: AudioEncodingEnum.LINEAR16,
          speakingRate,
        },
      },
    });

    onProgress?.(0, textChunks.length);
    for (let i = 0; i < textChunks.length; i++) {
      stream.write({ input: { text: textChunks[i] } });
      onProgress?.(i + 1, textChunks.length);
    }

    stream.end();
  });
}

export interface SynthesizeProgressCallback {
  (current: number, total: number): void;
}

/**
 * Synthesize speech from text using Google Cloud Text-to-Speech Chirp 3 HD voices.
 * LINEAR16 (default) produces one WAV via streaming, with chunked PCM merge as fallback.
 * MP3/OGG_OPUS long output still uses per-chunk encode + concat.
 */
export async function synthesizeSpeech(
  options: SynthesizeOptions,
  onProgress?: SynthesizeProgressCallback
): Promise<Buffer> {
  const {
    text,
    voiceName,
    languageCode,
    speakingRate = 1.0,
    audioEncoding = "LINEAR16",
  } = options;

  if (audioEncoding === "MP3" || audioEncoding === "OGG_OPUS") {
    const encoding = getAudioEncoding(audioEncoding);
    if (Buffer.byteLength(text, "utf8") <= MAX_BYTES) {
      onProgress?.(1, 1);
      return synthesizeChunk(text, voiceName, languageCode, speakingRate, encoding);
    }
    return synthesizeSpeechChunkedLossyConcat(options, onProgress);
  }

  if (Buffer.byteLength(text, "utf8") <= MAX_BYTES) {
    onProgress?.(1, 1);
    return synthesizeChunk(
      text,
      voiceName,
      languageCode,
      speakingRate,
      AudioEncodingEnum.LINEAR16
    );
  }

  try {
    return await synthesizeSpeechStreaming(options, onProgress);
  } catch (err) {
    console.warn("TTS streaming failed; falling back to chunked LINEAR16 merge:", err);
    return synthesizeSpeechChunkedLinearMerge(options, onProgress);
  }
}

/**
 * Get the file extension for an audio encoding.
 */
export function getAudioExtension(encoding: string): string {
  switch (encoding) {
    case "MP3":
      return "mp3";
    case "LINEAR16":
      return "wav";
    case "OGG_OPUS":
      return "ogg";
    default:
      return "mp3";
  }
}
