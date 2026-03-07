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

    let parsed: ImprovementAnalysis | null = null;

    // Clean up response - remove markdown code fences if present
    let jsonStr = response.trim();
    
    console.log("[Improvement] Raw response length:", jsonStr.length);
    console.log("[Improvement] First 300 chars:", JSON.stringify(jsonStr.substring(0, 300)));
    console.log("[Improvement] Last 100 chars:", JSON.stringify(jsonStr.substring(jsonStr.length - 100)));

    // Strategy 1: Remove markdown fences using multiple patterns
    // Handle ```json{ (no space), ```json { (with space), ```json\n{ (with newline)
    jsonStr = jsonStr.replace(/^```(?:json|JSON)?[\s\n]*/g, "");
    jsonStr = jsonStr.replace(/[\s\n]*```\s*$/g, "");
    
    console.log("[Improvement] After fence removal, first 200:", JSON.stringify(jsonStr.substring(0, 200)));

    // Strategy 2: Try direct parse
    try {
      parsed = JSON.parse(jsonStr.trim()) as ImprovementAnalysis;
      console.log("[Improvement] Direct parse SUCCESS, suggestions:", parsed.suggestions?.length);
    } catch (parseError) {
      console.log("[Improvement] Direct parse failed, trying to extract complete suggestions");
      
      // Strategy 3: Extract individual complete suggestion objects from potentially truncated JSON
      // This handles the case where Claude's response was cut off mid-stream
      const suggestionsMatch = jsonStr.match(/"suggestions"\s*:\s*\[/);
      if (suggestionsMatch) {
        const arrayStart = (suggestionsMatch.index || 0) + suggestionsMatch[0].length;
        const arrayContent = jsonStr.slice(arrayStart);
        
        // Extract complete suggestion objects using a bracket-matching approach
        const completeSuggestions: ImprovementSuggestion[] = [];
        let depth = 0;
        let objectStart = -1;
        let inString = false;
        let escapeNext = false;
        
        for (let i = 0; i < arrayContent.length; i++) {
          const char = arrayContent[i];
          
          if (escapeNext) {
            escapeNext = false;
            continue;
          }
          
          if (char === '\\') {
            escapeNext = true;
            continue;
          }
          
          if (char === '"') {
            inString = !inString;
            continue;
          }
          
          if (inString) continue;
          
          if (char === '{') {
            if (depth === 0) objectStart = i;
            depth++;
          } else if (char === '}') {
            depth--;
            if (depth === 0 && objectStart !== -1) {
              const objectStr = arrayContent.slice(objectStart, i + 1);
              try {
                const suggestion = JSON.parse(objectStr) as ImprovementSuggestion;
                completeSuggestions.push(suggestion);
                console.log("[Improvement] Extracted suggestion:", suggestion.type, "-", suggestion.description?.substring(0, 50));
              } catch {
                // This object couldn't be parsed, skip it
              }
              objectStart = -1;
            }
          } else if (char === ']' && depth === 0) {
            // End of suggestions array
            break;
          }
        }
        
        if (completeSuggestions.length > 0) {
          parsed = {
            suggestions: completeSuggestions,
            summary: `Found ${completeSuggestions.length} suggestions (some may have been truncated).`
          };
          console.log("[Improvement] Extracted", completeSuggestions.length, "complete suggestions from truncated response");
        }
      }
      
      // Strategy 4: If still no parsed result, try the old boundary method
      if (!parsed) {
        const startIdx = jsonStr.indexOf("{");
        const endIdx = jsonStr.lastIndexOf("}");
        
        if (startIdx !== -1 && endIdx > startIdx) {
          const extracted = jsonStr.slice(startIdx, endIdx + 1);
          try {
            parsed = JSON.parse(extracted) as ImprovementAnalysis;
            console.log("[Improvement] Boundary extraction SUCCESS, suggestions:", parsed.suggestions?.length);
          } catch {
            console.log("[Improvement] Boundary extraction also failed");
          }
        }
      }
    }

    if (parsed && Array.isArray(parsed.suggestions)) {
      suggestions = parsed.suggestions;
      summary = parsed.summary || "";
    } else {
      // Fallback: couldn't parse as structured suggestions
      suggestions = [{
        type: "copyedit",
        description: "AI analysis completed",
        suggestion: response,
      }];
      summary = "Analysis completed. Review suggestions below.";
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
