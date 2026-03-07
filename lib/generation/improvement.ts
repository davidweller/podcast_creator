import { callClaude } from "@/lib/claude/client";
import { buildImprovementPrompt, buildApplyImprovementsPrompt } from "@/lib/prompts/improvement";
import type { ImprovementAnalysis, ImprovementSuggestion } from "@/types/improvements";

export async function analyzeScript(
  script: string,
  _type?: string
): Promise<ImprovementAnalysis> {
  const improvementPrompt = buildImprovementPrompt(script);

  let suggestions: ImprovementSuggestion[] = [];
  let summary = "";

  try {
    const response = await callClaude(improvementPrompt, {
      maxTokens: 4096,
      temperature: 0.3,
    });

    try {
      const parsed = JSON.parse(response) as ImprovementAnalysis;
      suggestions = parsed.suggestions || [];
      summary = parsed.summary || "";
    } catch {
      const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1]) as ImprovementAnalysis;
        suggestions = parsed.suggestions || [];
        summary = parsed.summary || "";
      } else {
        suggestions = [{
          type: "copyedit",
          description: "AI analysis completed",
          suggestion: response,
        }];
        summary = "Analysis completed. Review suggestions below.";
      }
    }
  } catch (error) {
    console.error("Error getting Claude suggestions:", error);
    summary = "Analysis unavailable.";
  }

  return {
    suggestions,
    summary: summary || `Found ${suggestions.length} improvement suggestions.`,
  };
}

export async function applyImprovements(
  script: string,
  suggestions: ImprovementSuggestion[],
  _type?: string
): Promise<string> {
  // Format suggestions for the prompt
  const suggestionsText = suggestions
    .map((s, i) => {
      let text = `${i + 1}. [${s.type.toUpperCase()}] ${s.description}`;
      if (s.location) {
        text += `\n   Location: ${s.location}`;
      }
      if (s.suggestion) {
        text += `\n   Suggestion: ${s.suggestion}`;
      }
      if (s.original && s.improved) {
        text += `\n   Original: ${s.original}`;
        text += `\n   Improved: ${s.improved}`;
      }
      return text;
    })
    .join("\n\n");

  const prompt = buildApplyImprovementsPrompt(script, suggestionsText);

  try {
    const improvedScript = await callClaude(prompt, {
      maxTokens: 16384,
      temperature: 0.3,
    });

    // Clean up the response (remove any markdown formatting if present)
    let cleaned = improvedScript.trim();
    
    // Remove markdown code blocks if present
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/i, "");
    }

    return cleaned.trim();
  } catch (error) {
    console.error("Error applying improvements:", error);
    throw new Error("Failed to apply improvements. Please try again.");
  }
}
