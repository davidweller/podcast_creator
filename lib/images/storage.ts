import path from "path";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";

const DATA_DIR = path.join(process.cwd(), "data");
const PROJECTS_DIR = path.join(DATA_DIR, "projects");

export function getProjectImagesDir(projectId: number): string {
  return path.join(PROJECTS_DIR, String(projectId), "images");
}

export function ensureProjectImagesDir(projectId: number): string {
  const dir = getProjectImagesDir(projectId);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function getImageFilePath(projectId: number, slot: string): string {
  const dir = ensureProjectImagesDir(projectId);
  const filename = slot === "thumbnail" ? "thumbnail.png" : `${slot}.png`;
  return path.join(dir, filename);
}

export function saveProjectImage(projectId: number, slot: string, buffer: Buffer): string {
  const filePath = getImageFilePath(projectId, slot);
  writeFileSync(filePath, buffer);
  return `${slot}.png`;
}

export function readProjectImage(projectId: number, slot: string): Buffer | null {
  const dir = getProjectImagesDir(projectId);
  const filename = slot === "thumbnail" ? "thumbnail.png" : `${slot}.png`;
  const filePath = path.join(dir, filename);
  if (!existsSync(filePath)) return null;
  return readFileSync(filePath);
}
