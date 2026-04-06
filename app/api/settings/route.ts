import { NextRequest, NextResponse } from "next/server";
import { isByokStorageAvailable } from "@/lib/crypto/app-crypto";
import {
  deleteStoredSecret,
  hasStoredSecret,
  setStoredSecret,
} from "@/lib/db/app-secrets";
import { BYOK_PROVIDERS } from "@/lib/settings/byok-providers";
import type { ProviderId } from "@/lib/models/types";

const ENV_LOOKUP: Record<ProviderId, string | undefined> = {
  anthropic: process.env.ANTHROPIC_API_KEY,
  openai: process.env.OPENAI_API_KEY,
  google_gemini: process.env.GOOGLE_GEMINI_API_KEY,
  openrouter: process.env.OPENROUTER_API_KEY,
  xai: process.env.XAI_API_KEY,
  mistral: process.env.MISTRAL_API_KEY,
  cohere: process.env.COHERE_API_KEY,
  groq: process.env.GROQ_API_KEY,
  perplexity: process.env.PERPLEXITY_API_KEY,
  google_cloud_tts: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
};

export async function GET() {
  const canStoreKeys = isByokStorageAvailable();
  const providers = BYOK_PROVIDERS.map((p) => {
    const hasEnv = Boolean(ENV_LOOKUP[p.id]?.trim());
    const hasDb = hasStoredSecret(p.id);
    return {
      id: p.id,
      label: p.label,
      envVar: p.envVar,
      hint: p.hint ?? null,
      hasEnvKey: hasEnv,
      hasDatabaseKey: hasDb,
      configured: hasEnv || hasDb,
    };
  });

  return NextResponse.json({
    canStoreKeys,
    cozycrimeSecretConfigured: canStoreKeys,
    providers,
  });
}

export async function POST(request: NextRequest) {
  try {
    if (!isByokStorageAvailable()) {
      return NextResponse.json(
        {
          error:
            "Set COZYCRIME_SECRET (min 16 characters) in the environment to enable storing API keys in the database.",
        },
        { status: 400 }
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const allowed = new Set(BYOK_PROVIDERS.map((p) => p.id));

    /** Copy every key that exists in process.env into encrypted SQLite (BYOK). */
    const importedFromEnv: ProviderId[] = [];
    if (body.importFromEnv === true) {
      for (const p of BYOK_PROVIDERS) {
        const v = ENV_LOOKUP[p.id]?.trim();
        if (v) {
          setStoredSecret(p.id, v);
          importedFromEnv.push(p.id);
        }
      }
    }

    for (const key of Object.keys(body)) {
      if (key === "importFromEnv") continue;
      if (!allowed.has(key as ProviderId)) continue;
      const val = body[key];
      if (val === null || val === "") {
        deleteStoredSecret(key as ProviderId);
        continue;
      }
      if (typeof val === "string" && val.trim()) {
        setStoredSecret(key as ProviderId, val.trim());
      }
    }

    return NextResponse.json({
      ok: true,
      importedFromEnv:
        importedFromEnv.length > 0 ? importedFromEnv : undefined,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to save settings";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
