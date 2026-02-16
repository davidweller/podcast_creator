import { callClaude } from "@/lib/claude/client";
import { buildImprovementPrompt, buildApplyImprovementsPrompt } from "@/lib/prompts/improvement";
import { validateScript30Min, validateScript90Min } from "@/lib/validation/script";
import type { ImprovementAnalysis, ImprovementSuggestion } from "@/types/improvements";

export async function analyzeScript(
  script: string,
  type: "30min" | "90min"
): Promise<ImprovementAnalysis> {
  // First, run validation to get quality check violations
  const validation = type === "30min" 
    ? validateScript30Min(script)
    : validateScript90Min(script);

  // Build quality check suggestions from validation violations
  const qualityCheckSuggestions: ImprovementSuggestion[] = validation.violations.map(
    (violation) => ({
      type: "quality_check" as const,
      description: violation,
      suggestion: `Address this quality check violation: ${violation}`,
    })
  );

  // Call Claude for copyediting and style suggestions
  const improvementPrompt = buildImprovementPrompt(script, type);
  
  let claudeSuggestions: ImprovementSuggestion[] = [];
  let summary = "";

  try {
    const response = await callClaude(improvementPrompt, {
      maxTokens: 4096,
      temperature: 0.3,
    });

    // Parse JSON response
    try {
      const parsed = JSON.parse(response) as ImprovementAnalysis;
      claudeSuggestions = parsed.suggestions || [];
      summary = parsed.summary || "";
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from markdown code blocks
      const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1]) as ImprovementAnalysis;
        claudeSuggestions = parsed.suggestions || [];
        summary = parsed.summary || "";
      } else {
        // Fallback: create a single suggestion from the raw response
        claudeSuggestions = [{
          type: "copyedit",
          description: "AI analysis completed",
          suggestion: response,
        }];
        summary = "Analysis completed. Review suggestions below.";
      }
    }
  } catch (error) {
    console.error("Error getting Claude suggestions:", error);
    summary = "Quality checks completed. Claude analysis unavailable.";
  }

  // Combine quality check suggestions with Claude suggestions
  const allSuggestions = [...qualityCheckSuggestions, ...claudeSuggestions];

  return {
    suggestions: allSuggestions,
    summary: summary || `Found ${allSuggestions.length} improvement suggestions.`,
  };
}

export async function applyImprovements(
  script: string,
  suggestions: ImprovementSuggestion[],
  type: "30min" | "90min"
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
      maxTokens: type === "30min" ? 8192 : 16384,
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
