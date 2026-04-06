import { getDatabase } from "./schema";
import { decryptSecret, encryptSecret, isByokStorageAvailable } from "@/lib/crypto/app-crypto";
import type { ProviderId } from "@/lib/models/types";

export function getStoredSecret(providerId: ProviderId): string | null {
  if (!isByokStorageAvailable()) return null;
  const db = getDatabase();
  const row = db
    .prepare(
      `SELECT ciphertext, nonce FROM app_secrets WHERE provider_id = ?`
    )
    .get(providerId) as { ciphertext: Buffer; nonce: Buffer } | undefined;
  if (!row) return null;
  try {
    return decryptSecret(Buffer.from(row.ciphertext), Buffer.from(row.nonce));
  } catch {
    return null;
  }
}

export function setStoredSecret(providerId: ProviderId, plaintext: string): void {
  const { ciphertext, nonce } = encryptSecret(plaintext);
  const db = getDatabase();
  db.prepare(
    `
    INSERT INTO app_secrets (provider_id, ciphertext, nonce, updated_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(provider_id) DO UPDATE SET
      ciphertext = excluded.ciphertext,
      nonce = excluded.nonce,
      updated_at = datetime('now')
  `
  ).run(providerId, ciphertext, nonce);
}

export function deleteStoredSecret(providerId: ProviderId): void {
  const db = getDatabase();
  db.prepare(`DELETE FROM app_secrets WHERE provider_id = ?`).run(providerId);
}

export function hasStoredSecret(providerId: ProviderId): boolean {
  const db = getDatabase();
  const row = db
    .prepare(`SELECT 1 FROM app_secrets WHERE provider_id = ? LIMIT 1`)
    .get(providerId);
  return row != null;
}

export function listStoredProviderIds(): ProviderId[] {
  const db = getDatabase();
  const rows = db.prepare(`SELECT provider_id FROM app_secrets`).all() as {
    provider_id: string;
  }[];
  return rows.map((r) => r.provider_id as ProviderId);
}
