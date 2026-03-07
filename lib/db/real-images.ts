import { getDatabase } from "./schema";
import type { RealImage, ArchivalSource, ImageSlot } from "@/types/database";

export function getRealImages(projectId: number): RealImage[] {
  const db = getDatabase();
  const rows = db
    .prepare(
      `SELECT id, project_id, source, source_id, title, thumbnail_url, full_url,
              rights_info, attribution, local_path, scene_slot, flagged, downloaded,
              metadata_json, created_at
       FROM real_images WHERE project_id = ? ORDER BY created_at DESC`
    )
    .all(projectId) as any[];

  return rows.map((row) => ({
    ...row,
    flagged: Boolean(row.flagged),
    downloaded: Boolean(row.downloaded),
  }));
}

export function getFlaggedRealImages(projectId: number): RealImage[] {
  const db = getDatabase();
  const rows = db
    .prepare(
      `SELECT id, project_id, source, source_id, title, thumbnail_url, full_url,
              rights_info, attribution, local_path, scene_slot, flagged, downloaded,
              metadata_json, created_at
       FROM real_images WHERE project_id = ? AND flagged = 1 ORDER BY created_at DESC`
    )
    .all(projectId) as any[];

  return rows.map((row) => ({
    ...row,
    flagged: Boolean(row.flagged),
    downloaded: Boolean(row.downloaded),
  }));
}

export function getRealImageById(id: number): RealImage | null {
  const db = getDatabase();
  const row = db
    .prepare(
      `SELECT id, project_id, source, source_id, title, thumbnail_url, full_url,
              rights_info, attribution, local_path, scene_slot, flagged, downloaded,
              metadata_json, created_at
       FROM real_images WHERE id = ?`
    )
    .get(id) as any | undefined;

  if (!row) return null;
  return {
    ...row,
    flagged: Boolean(row.flagged),
    downloaded: Boolean(row.downloaded),
  };
}

export function addRealImage(data: {
  project_id: number;
  source: ArchivalSource;
  source_id: string;
  title: string | null;
  thumbnail_url: string;
  full_url: string;
  rights_info: string | null;
  attribution: string | null;
  metadata_json?: string | null;
}): RealImage {
  const db = getDatabase();

  const existing = db
    .prepare(`SELECT id FROM real_images WHERE project_id = ? AND source = ? AND source_id = ?`)
    .get(data.project_id, data.source, data.source_id) as { id: number } | undefined;

  if (existing) {
    return getRealImageById(existing.id)!;
  }

  const result = db
    .prepare(
      `INSERT INTO real_images (project_id, source, source_id, title, thumbnail_url, full_url, rights_info, attribution, metadata_json, flagged)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`
    )
    .run(
      data.project_id,
      data.source,
      data.source_id,
      data.title,
      data.thumbnail_url,
      data.full_url,
      data.rights_info,
      data.attribution,
      data.metadata_json ?? null
    );

  db.prepare(`UPDATE projects SET updated_at = datetime('now') WHERE id = ?`).run(data.project_id);

  return getRealImageById(Number(result.lastInsertRowid))!;
}

export function updateRealImage(
  id: number,
  data: {
    flagged?: boolean;
    downloaded?: boolean;
    local_path?: string | null;
    scene_slot?: ImageSlot | null;
  }
): void {
  const db = getDatabase();
  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.flagged !== undefined) {
    updates.push("flagged = ?");
    values.push(data.flagged ? 1 : 0);
  }
  if (data.downloaded !== undefined) {
    updates.push("downloaded = ?");
    values.push(data.downloaded ? 1 : 0);
  }
  if (data.local_path !== undefined) {
    updates.push("local_path = ?");
    values.push(data.local_path);
  }
  if (data.scene_slot !== undefined) {
    updates.push("scene_slot = ?");
    values.push(data.scene_slot);
  }

  if (updates.length > 0) {
    values.push(id);
    db.prepare(`UPDATE real_images SET ${updates.join(", ")} WHERE id = ?`).run(...values);

    const image = getRealImageById(id);
    if (image) {
      db.prepare(`UPDATE projects SET updated_at = datetime('now') WHERE id = ?`).run(image.project_id);
    }
  }
}

export function deleteRealImage(id: number): void {
  const db = getDatabase();
  const image = getRealImageById(id);
  db.prepare(`DELETE FROM real_images WHERE id = ?`).run(id);
  if (image) {
    db.prepare(`UPDATE projects SET updated_at = datetime('now') WHERE id = ?`).run(image.project_id);
  }
}

export function toggleRealImageFlag(id: number): RealImage | null {
  const db = getDatabase();
  const image = getRealImageById(id);
  if (!image) return null;

  const newFlagged = image.flagged ? 0 : 1;
  db.prepare(`UPDATE real_images SET flagged = ? WHERE id = ?`).run(newFlagged, id);
  db.prepare(`UPDATE projects SET updated_at = datetime('now') WHERE id = ?`).run(image.project_id);

  return getRealImageById(id);
}
