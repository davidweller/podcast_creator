import { getDatabase } from "./schema";
import type { Project, ProjectData, ProjectStatus, ProjectWithStatus } from "@/types/database";

export function createProject(title: string, era_location: string): number {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO projects (title, era_location)
    VALUES (?, ?)
  `);
  const result = stmt.run(title, era_location);
  
  const projectId = result.lastInsertRowid as number;
  
  // Initialize project_data and project_status
  db.prepare(`
    INSERT INTO project_data (project_id)
    VALUES (?)
  `).run(projectId);
  
  db.prepare(`
    INSERT INTO project_status (project_id)
    VALUES (?)
  `).run(projectId);
  
  return projectId;
}

export function getAllProjects(): ProjectWithStatus[] {
  const db = getDatabase();
  const projects = db.prepare(`
    SELECT p.*, 
           ps.script_90min_generated,
           ps.description_generated,
           ps.shorts_generated,
           ps.metadata_generated,
           ps.image_prompt_generated
    FROM projects p
    LEFT JOIN project_status ps ON p.id = ps.project_id
    ORDER BY p.updated_at DESC
  `).all() as (Project & ProjectStatus)[];

  return projects.map(p => ({
    id: p.id,
    title: p.title,
    era_location: p.era_location,
    created_at: p.created_at,
    updated_at: p.updated_at,
    status: {
      project_id: p.id,
      script_90min_generated: Boolean(p.script_90min_generated),
      description_generated: Boolean(p.description_generated),
      shorts_generated: Boolean(p.shorts_generated),
      metadata_generated: Boolean(p.metadata_generated),
      image_prompt_generated: Boolean(p.image_prompt_generated),
    },
  }));
}

export function getProject(id: number): Project | null {
  const db = getDatabase();
  const project = db.prepare(`
    SELECT * FROM projects WHERE id = ?
  `).get(id) as Project | undefined;

  return project || null;
}

export function updateProject(id: number, title?: string, era_location?: string): void {
  const db = getDatabase();
  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (title !== undefined) {
    updates.push("title = ?");
    values.push(title);
  }
  if (era_location !== undefined) {
    updates.push("era_location = ?");
    values.push(era_location);
  }

  if (updates.length > 0) {
    updates.push("updated_at = datetime('now')");
    values.push(id);
    
    db.prepare(`
      UPDATE projects 
      SET ${updates.join(", ")}
      WHERE id = ?
    `).run(...values);
  }
}

export function deleteProject(id: number): void {
  const db = getDatabase();
  db.prepare("DELETE FROM projects WHERE id = ?").run(id);
}

export function duplicateProject(id: number): number {
  const db = getDatabase();
  const project = getProject(id);
  if (!project) {
    throw new Error("Project not found");
  }

  const newId = createProject(`${project.title} (Copy)`, project.era_location);
  
  // Copy project data
  const data = getProjectData(id);
  if (data) {
    updateProjectData(newId, data);
  }
  
  // Copy project status
  const status = getProjectStatus(id);
  if (status) {
    updateProjectStatus(newId, status);
  }

  return newId;
}

export function getProjectData(projectId: number): ProjectData | null {
  const db = getDatabase();
  const data = db.prepare(`
    SELECT * FROM project_data WHERE project_id = ?
  `).get(projectId) as ProjectData | undefined;

  return data || null;
}

export function updateProjectData(projectId: number, data: Partial<ProjectData>): void {
  const db = getDatabase();
  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.research_text !== undefined) {
    updates.push("research_text = ?");
    values.push(data.research_text);
  }
  if (data.script_90min !== undefined) {
    updates.push("script_90min = ?");
    values.push(data.script_90min);
  }
  if (data.description !== undefined) {
    updates.push("description = ?");
    values.push(data.description);
  }
  if (data.spotify_description !== undefined) {
    updates.push("spotify_description = ?");
    values.push(data.spotify_description);
  }
  if (data.shorts !== undefined) {
    updates.push("shorts = ?");
    values.push(data.shorts);
  }
  if (data.titles_json !== undefined) {
    updates.push("titles_json = ?");
    values.push(data.titles_json);
  }
  if (data.metadata_json !== undefined) {
    updates.push("metadata_json = ?");
    values.push(data.metadata_json);
  }
  if (data.image_prompt !== undefined) {
    updates.push("image_prompt = ?");
    values.push(data.image_prompt);
  }

  if (updates.length > 0) {
    values.push(projectId);
    db.prepare(`
      UPDATE project_data 
      SET ${updates.join(", ")}
      WHERE project_id = ?
    `).run(...values);
  }

  // Update project's updated_at timestamp
  db.prepare(`
    UPDATE projects 
    SET updated_at = datetime('now')
    WHERE id = ?
  `).run(projectId);
}

export function getProjectStatus(projectId: number): ProjectStatus | null {
  const db = getDatabase();
  const status = db.prepare(`
    SELECT * FROM project_status WHERE project_id = ?
  `).get(projectId) as ProjectStatus | undefined;

  return status || null;
}

export function updateProjectStatus(projectId: number, status: Partial<ProjectStatus>): void {
  const db = getDatabase();
  const updates: string[] = [];
  const values: (number | string | null)[] = [];

  if (status.script_90min_generated !== undefined) {
    updates.push("script_90min_generated = ?");
    values.push(status.script_90min_generated ? 1 : 0);
  }
  if (status.script_90min_generated_at !== undefined) {
    updates.push("script_90min_generated_at = ?");
    values.push(status.script_90min_generated_at ?? null);
  }
  if (status.description_generated !== undefined) {
    updates.push("description_generated = ?");
    values.push(status.description_generated ? 1 : 0);
  }
  if (status.shorts_generated !== undefined) {
    updates.push("shorts_generated = ?");
    values.push(status.shorts_generated ? 1 : 0);
  }
  if (status.shorts_generated_at !== undefined) {
    updates.push("shorts_generated_at = ?");
    values.push(status.shorts_generated_at ?? null);
  }
  if (status.metadata_generated !== undefined) {
    updates.push("metadata_generated = ?");
    values.push(status.metadata_generated ? 1 : 0);
  }
  if (status.image_prompt_generated !== undefined) {
    updates.push("image_prompt_generated = ?");
    values.push(status.image_prompt_generated ? 1 : 0);
  }

  if (updates.length > 0) {
    values.push(projectId);
    db.prepare(`
      UPDATE project_status 
      SET ${updates.join(", ")}
      WHERE project_id = ?
    `).run(...values);
  }
}
