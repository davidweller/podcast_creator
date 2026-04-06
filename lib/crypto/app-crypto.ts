import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGO = "aes-256-gcm";
const KEY_LEN = 32;
const NONCE_LEN = 12;
const TAG_LEN = 16;

function deriveKey(): Buffer {
  const secret = process.env.COZYCRIME_SECRET?.trim();
  if (!secret || secret.length < 16) {
    throw new Error(
      "COZYCRIME_SECRET must be set (min 16 characters) to store API keys in the database."
    );
  }
  return scryptSync(secret, "cozycrime-byok-v1", KEY_LEN);
}

export function isByokStorageAvailable(): boolean {
  const secret = process.env.COZYCRIME_SECRET?.trim();
  return Boolean(secret && secret.length >= 16);
}

/** Returns ciphertext (includes GCM auth tag) and nonce for DB storage */
export function encryptSecret(plaintext: string): { ciphertext: Buffer; nonce: Buffer } {
  const key = deriveKey();
  const nonce = randomBytes(NONCE_LEN);
  const cipher = createCipheriv(ALGO, key, nonce);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { ciphertext: Buffer.concat([enc, tag]), nonce };
}

export function decryptSecret(ciphertextWithTag: Buffer, nonce: Buffer): string {
  const key = deriveKey();
  if (nonce.length !== NONCE_LEN) {
    throw new Error("Invalid nonce length");
  }
  if (ciphertextWithTag.length < TAG_LEN) {
    throw new Error("Invalid ciphertext");
  }
  const tag = ciphertextWithTag.subarray(ciphertextWithTag.length - TAG_LEN);
  const enc = ciphertextWithTag.subarray(0, ciphertextWithTag.length - TAG_LEN);
  const decipher = createDecipheriv(ALGO, key, nonce);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}
