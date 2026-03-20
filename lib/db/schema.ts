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

  db = new Database(DB_PATH);
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
      PRIMARY KEY (project_id, slot),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS real_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      source TEXT NOT NULL,
      source_id TEXT NOT NULL,
      title TEXT,
      thumbnail_url TEXT NOT NULL,
      full_url TEXT NOT NULL,
      rights_info TEXT,
      attribution TEXT,
      local_path TEXT,
      scene_slot TEXT,
      flagged INTEGER DEFAULT 0,
      downloaded INTEGER DEFAULT 0,
      metadata_json TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      UNIQUE(project_id, source, source_id)
    );

    CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_project_images_project_id ON project_images(project_id);
    CREATE INDEX IF NOT EXISTS idx_real_images_project_id ON real_images(project_id);
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

  return db;
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}
