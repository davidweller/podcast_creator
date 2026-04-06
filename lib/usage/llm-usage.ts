import { getDatabase } from "@/lib/db/schema";
import type { LlmStage } from "@/lib/models/types";

export function logLlmUsage(params: {
  stage: LlmStage | string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  projectId?: number | null;
}): void {
  try {
    const db = getDatabase();
    db.prepare(
      `
      INSERT INTO llm_usage_log (created_at, stage, provider, model, input_tokens, output_tokens, project_id)
      VALUES (datetime('now'), ?, ?, ?, ?, ?, ?)
    `
    ).run(
      params.stage,
      params.provider,
      params.model,
      params.inputTokens,
      params.outputTokens,
      params.projectId ?? null
    );
  } catch {
    // never throw from logging
  }
}
