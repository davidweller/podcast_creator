import { getDatabase } from "./schema";
import type { ProjectImage } from "@/types/database";
import { IMAGE_SLOTS } from "@/types/database";

export function getProjectImages(projectId: number): ProjectImage[] {
  const db = getDatabase();
  const rows = db
    .prepare(
      `SELECT project_id, slot, prompt, image_path, thumbnail_title
       FROM project_images WHERE project_id = ? ORDER BY slot`
    )
    .all(projectId) as ProjectImage[];

  if (rows.length === 0) {
    initProjectImages(projectId);
    return getProjectImages(projectId);
  }

  // Ensure all slots exist in the database (for projects created before slots were added)
  const bySlot = new Map(rows.map((r) => [r.slot, r]));
  const insert = db.prepare(`INSERT INTO project_images (project_id, slot) VALUES (?, ?)`);
  const select = db.prepare(`SELECT project_id, slot, prompt, image_path, thumbnail_title FROM project_images WHERE project_id = ? AND slot = ?`);
  
  const result: ProjectImage[] = [];
  for (const slot of IMAGE_SLOTS) {
    let row = bySlot.get(slot);
    if (!row) {
      // Slot doesn't exist, create it
      insert.run(projectId, slot);
      row = select.get(projectId, slot) as ProjectImage | undefined;
      if (!row) {
        // Fallback to placeholder if select fails
        row = { project_id: projectId, slot, prompt: null, image_path: null, thumbnail_title: null };
      }
    }
    result.push(row);
  }
  
  return result;
}

function initProjectImages(projectId: number): void {
  const db = getDatabase();
  const insert = db.prepare(`
    INSERT INTO project_images (project_id, slot) VALUES (?, ?)
  `);
  for (const slot of IMAGE_SLOTS) {
    insert.run(projectId, slot);
  }
}

export function updateProjectImage(
  projectId: number,
  slot: string,
  data: { prompt?: string | null; image_path?: string | null; thumbnail_title?: string | null }
): void {
  const db = getDatabase();
  const existing = db.prepare(`SELECT 1 FROM project_images WHERE project_id = ? AND slot = ?`).get(projectId, slot);
  if (!existing) {
    db.prepare(`INSERT INTO project_images (project_id, slot, prompt, image_path, thumbnail_title) VALUES (?, ?, ?, ?, ?)`).run(
      projectId,
      slot,
      data.prompt ?? null,
      data.image_path ?? null,
      data.thumbnail_title ?? null
    );
  } else {
    const updates: string[] = [];
    const values: (string | null)[] = [];
    if (data.prompt !== undefined) {
      updates.push("prompt = ?");
      values.push(data.prompt);
    }
    if (data.image_path !== undefined) {
      updates.push("image_path = ?");
      values.push(data.image_path);
    }
    if (data.thumbnail_title !== undefined) {
      updates.push("thumbnail_title = ?");
      values.push(data.thumbnail_title);
    }
    if (updates.length > 0) {
      values.push(String(projectId), slot);
      db.prepare(`UPDATE project_images SET ${updates.join(", ")} WHERE project_id = ? AND slot = ?`).run(...values);
    }
  }

  db.prepare(`UPDATE projects SET updated_at = datetime('now') WHERE id = ?`).run(projectId);
}

export function getProjectImage(projectId: number, slot: string): ProjectImage | null {
  const db = getDatabase();
  const row = db
    .prepare(`SELECT project_id, slot, prompt, image_path, thumbnail_title FROM project_images WHERE project_id = ? AND slot = ?`)
    .get(projectId, slot) as ProjectImage | undefined;
  return row ?? null;
}

export function setProjectImagesPrompts(
  projectId: number,
  items: { slot: string; prompt: string; thumbnail_title?: string | null }[]
): void {
  const db = getDatabase();
  for (const item of items) {
    const existing = db.prepare(`SELECT 1 FROM project_images WHERE project_id = ? AND slot = ?`).get(projectId, item.slot);
    if (existing) {
      if (item.thumbnail_title !== undefined) {
        db.prepare(`UPDATE project_images SET prompt = ?, thumbnail_title = ? WHERE project_id = ? AND slot = ?`).run(
          item.prompt,
          item.thumbnail_title ?? null,
          projectId,
          item.slot
        );
      } else {
        db.prepare(`UPDATE project_images SET prompt = ? WHERE project_id = ? AND slot = ?`).run(item.prompt, projectId, item.slot);
      }
    } else {
      db.prepare(
        `INSERT INTO project_images (project_id, slot, prompt, thumbnail_title) VALUES (?, ?, ?, ?)`
      ).run(projectId, item.slot, item.prompt, item.thumbnail_title ?? null);
    }
  }
  db.prepare(`UPDATE projects SET updated_at = datetime('now') WHERE id = ?`).run(projectId);
}
