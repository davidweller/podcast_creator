export interface Project {
  id: number;
  title: string;
  era_location: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectData {
  project_id: number;
  research_text: string | null;
  script_90min: string | null;
  description: string | null;
  shorts: string | null;
  titles_json: string | null;
  metadata_json: string | null;
  image_prompt: string | null;
}

export interface ProjectStatus {
  project_id: number;
  script_90min_generated: boolean;
  description_generated: boolean;
  shorts_generated: boolean;
  metadata_generated: boolean;
  image_prompt_generated: boolean;
}

export interface ProjectWithStatus extends Project {
  status: ProjectStatus;
}

export type ImageSlot = 
  | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" 
  | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "19" | "20" 
  | "21" | "22" | "23" | "24" | "25" | "26" | "27" | "28" | "29" | "30" 
  | "31" | "32" | "33" | "34" | "35" | "36" | "thumbnail"
  | "doc-portrait" | "doc-mugshot" | "doc-newspaper" | "doc-street" 
  | "doc-interior" | "doc-map" | "doc-courtroom" | "doc-weather" 
  | "doc-object" | "doc-grave" | "doc-thumbnail";

export interface ProjectImage {
  project_id: number;
  slot: ImageSlot;
  prompt: string | null;
  image_path: string | null;
  thumbnail_title: string | null;
}

export const IMAGE_SLOTS: ImageSlot[] = [
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
  "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
  "21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
  "31", "32", "33", "34", "35", "36", "thumbnail",
  "doc-portrait", "doc-mugshot", "doc-newspaper", "doc-street",
  "doc-interior", "doc-map", "doc-courtroom", "doc-weather",
  "doc-object", "doc-grave", "doc-thumbnail"
];

export const DOCUMENTARY_SLOTS: ImageSlot[] = [
  "doc-portrait", "doc-mugshot", "doc-newspaper", "doc-street",
  "doc-interior", "doc-map", "doc-courtroom", "doc-weather",
  "doc-object", "doc-grave", "doc-thumbnail"
];

export const ILLUSTRATED_SLOTS: ImageSlot[] = [
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
  "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
  "21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
  "31", "32", "33", "34", "35", "36", "thumbnail"
];

export type ArchivalSource = "europeana" | "loc" | "wikimedia";

export interface RealImage {
  id: number;
  project_id: number;
  source: ArchivalSource;
  source_id: string;
  title: string | null;
  thumbnail_url: string;
  full_url: string;
  rights_info: string | null;
  attribution: string | null;
  local_path: string | null;
  scene_slot: ImageSlot | null;
  flagged: boolean;
  downloaded: boolean;
  metadata_json: string | null;
  created_at: string;
}

export interface ArchivalSearchResult {
  source: ArchivalSource;
  source_id: string;
  title: string;
  thumbnail_url: string;
  full_url: string;
  rights_info: string;
  attribution: string;
}
