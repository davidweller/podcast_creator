export type ImprovementType = "quality_check" | "copyedit" | "style";

export type SuggestionStatus = "pending" | "applying" | "applied" | "error";

export interface ImprovementSuggestion {
  type: ImprovementType;
  description: string;
  location?: string;
  suggestion?: string;
  original?: string;
  improved?: string;
  status?: SuggestionStatus;
}

export interface ImprovementAnalysis {
  suggestions: ImprovementSuggestion[];
  summary: string;
}
