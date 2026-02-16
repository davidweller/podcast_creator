export type ImprovementType = "quality_check" | "copyedit" | "style";

export interface ImprovementSuggestion {
  type: ImprovementType;
  description: string;
  location?: string;
  suggestion?: string;
  original?: string;
  improved?: string;
}

export interface ImprovementAnalysis {
  suggestions: ImprovementSuggestion[];
  summary: string;
}
