import Database from "better-sqlite3";
import path from "path";
import { existsSync, mkdirSync } from "fs";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "cozycrime.db");

// Ensure data directory exists
if (!existsSync(DB_DIR)) {
  mkdirSync(DB_DIR, { recursive: true });
}

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (db) {
    return db;
  }

  // #region agent log
  fetch("http://127.0.0.1:7650/ingest/b5d64e2f-1d56-4ff4-9b2a-5201e1076c1a", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "33d17f",
    },
    body: JSON.stringify({
      sessionId: "33d17f",
      runId: "pre-fix",
      hypothesisId: "A-B-C",
      location: "lib/db/schema.ts:getDatabase",
      message: "Opening SQLite before native load",
      data: {
        nodeVersion: process.version,
        nodeModuleVersion: process.versions.modules,
        execPath: process.execPath,
        dbPath: DB_PATH,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  try {
    db = new Database(DB_PATH);
  } catch (err) {
    // #region agent log
    fetch("http://127.0.0.1:7650/ingest/b5d64e2f-1d56-4ff4-9b2a-5201e1076c1a", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "33d17f",
      },
      body: JSON.stringify({
        sessionId: "33d17f",
        runId: "pre-fix",
        hypothesisId: "A",
        location: "lib/db/schema.ts:getDatabase",
        message: "SQLite native module load failed",
        data: {
          nodeVersion: process.version,
          nodeModuleVersion: process.versions.modules,
          errorCode: (err as NodeJS.ErrnoException).code,
          errorMessage: err instanceof Error ? err.message : String(err),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    throw err;
  }

  // #region agent log
  fetch("http://127.0.0.1:7650/ingest/b5d64e2f-1d56-4ff4-9b2a-5201e1076c1a", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "33d17f",
    },
    body: JSON.stringify({
      sessionId: "33d17f",
      runId: "pre-fix",
      hypothesisId: "A",
      location: "lib/db/schema.ts:getDatabase",
      message: "SQLite native module loaded",
      data: {
        nodeVersion: process.version,
        nodeModuleVersion: process.versions.modules,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  db.pragma("journal_mode = WAL");

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      era_location TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS project_data (
      project_id INTEGER PRIMARY KEY,
      research_text TEXT,
      script_90min TEXT,
      description TEXT,
      spotify_description TEXT,
      shorts TEXT,
      titles_json TEXT,
      metadata_json TEXT,
      image_prompt TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS project_status (
      project_id INTEGER PRIMARY KEY,
      script_90min_generated INTEGER DEFAULT 0,
      script_90min_generated_at TEXT,
      description_generated INTEGER DEFAULT 0,
      shorts_generated INTEGER DEFAULT 0,
      shorts_generated_at TEXT,
      metadata_generated INTEGER DEFAULT 0,
      image_prompt_generated INTEGER DEFAULT 0,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS project_images (
      project_id INTEGER NOT NULL,
      slot TEXT NOT NULL,
      prompt TEXT,
      image_path TEXT,
      thumbnail_title TEXT,
      thumbnail_meta_json TEXT,
      PRIMARY KEY (project_id, slot),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_project_images_project_id ON project_images(project_id);

    CREATE TABLE IF NOT EXISTS app_secrets (
      provider_id TEXT PRIMARY KEY,
      ciphertext BLOB NOT NULL,
      nonce BLOB NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS llm_usage_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      stage TEXT,
      provider TEXT NOT NULL,
      model TEXT NOT NULL,
      input_tokens INTEGER NOT NULL DEFAULT 0,
      output_tokens INTEGER NOT NULL DEFAULT 0,
      project_id INTEGER
    );

    CREATE INDEX IF NOT EXISTS idx_llm_usage_created ON llm_usage_log(created_at DESC);
  `);

  // Migration: add spotify_description to existing project_data tables
  const tableInfo = db.prepare("PRAGMA table_info(project_data)").all() as { name: string }[];
  const hasSpotifyDescription = tableInfo.some((col) => col.name === "spotify_description");
  if (!hasSpotifyDescription) {
    db.exec("ALTER TABLE project_data ADD COLUMN spotify_description TEXT");
  }

  // Migration: add generated_at timestamps to project_status
  const statusTableInfo = db.prepare("PRAGMA table_info(project_status)").all() as { name: string }[];
  const hasScript90GeneratedAt = statusTableInfo.some((col) => col.name === "script_90min_generated_at");
  if (!hasScript90GeneratedAt) {
    db.exec("ALTER TABLE project_status ADD COLUMN script_90min_generated_at TEXT");
  }
  const hasShortsGeneratedAt = statusTableInfo.some((col) => col.name === "shorts_generated_at");
  if (!hasShortsGeneratedAt) {
    db.exec("ALTER TABLE project_status ADD COLUMN shorts_generated_at TEXT");
  }

  // Migration: add thumbnail metadata payload to project_images.
  const imageTableInfo = db.prepare("PRAGMA table_info(project_images)").all() as { name: string }[];
  const hasThumbnailMeta = imageTableInfo.some((col) => col.name === "thumbnail_meta_json");
  if (!hasThumbnailMeta) {
    db.exec("ALTER TABLE project_images ADD COLUMN thumbnail_meta_json TEXT");
  }

  return db;
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}
