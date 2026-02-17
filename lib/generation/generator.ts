import { callClaude, SCRIPT_MODEL } from "@/lib/claude/client";
import { PROMPT_30MIN } from "@/lib/prompts/script-30min";
import { PROMPT_90MIN } from "@/lib/prompts/script-90min";
import { validateScript30Min, validateScript90Min } from "@/lib/validation/script";
import { buildCorrectionPrompt } from "@/lib/prompts/correction";

const MAX_RETRIES = 3;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isOverloadedError(error: any): boolean {
  return error?.message?.includes("overloaded") || 
         error?.message?.includes("Overloaded") ||
         error?.error?.type === "overloaded_error";
}

export async function generateScript30Min(researchText: string): Promise<{
  script: string;
  attempts: number;
  violations?: string[];
}> {
  const fullPrompt = `${PROMPT_30MIN}\n\n${researchText}`;
  let script = "";
  let attempts = 0;
  let violations: string[] = [];

  for (let i = 0; i < MAX_RETRIES; i++) {
    let shouldRetry = false;
    
    try {
      attempts++;
      if (i === 0) {
        script = await callClaude(fullPrompt, {
          maxTokens: 8192,
          temperature: 0.7,
          model: SCRIPT_MODEL,
        });
      } else {
        // Regenerate with correction prompt
        const correctionPrompt = buildCorrectionPrompt(fullPrompt, violations);
        script = await callClaude(correctionPrompt, {
          maxTokens: 8192,
          temperature: 0.7,
          model: SCRIPT_MODEL,
        });
      }

      const validation = validateScript30Min(script);
      if (validation.isValid) {
        return { script, attempts };
      }

      violations = validation.violations;
      if (i < MAX_RETRIES - 1) {
        console.log(`Validation failed, attempt ${i + 1}/${MAX_RETRIES}:`, violations);
      }
    } catch (error) {
      console.error(`Error generating script (attempt ${i + 1}):`, error);
      
      // If it's an overloaded error and not the last retry, wait with exponential backoff
      if (isOverloadedError(error) && i < MAX_RETRIES - 1) {
        const waitTime = Math.min(1000 * Math.pow(2, i), 10000); // Max 10 seconds
        console.log(`API overloaded, waiting ${waitTime}ms before retry...`);
        await sleep(waitTime);
        i--; // Retry the same attempt by decrementing i
        shouldRetry = true;
      } else if (i === MAX_RETRIES - 1) {
        throw error;
      }
    }
    
    if (shouldRetry) {
      continue; // Retry the same iteration
    }
  }

  // Return script even if validation failed after max retries
  return { script, attempts, violations };
}

export async function generateScript90Min(researchText: string): Promise<{
  script: string;
  attempts: number;
  violations?: string[];
}> {
  const fullPrompt = `${PROMPT_90MIN}\n\n${researchText}`;
  let script = "";
  let attempts = 0;
  let violations: string[] = [];

  for (let i = 0; i < MAX_RETRIES; i++) {
    let shouldRetry = false;
    
    try {
      attempts++;
      if (i === 0) {
        script = await callClaude(fullPrompt, {
          maxTokens: 16384,
          temperature: 0.7,
          model: SCRIPT_MODEL,
        });
      } else {
        // Regenerate with correction prompt
        const correctionPrompt = buildCorrectionPrompt(fullPrompt, violations);
        script = await callClaude(correctionPrompt, {
          maxTokens: 16384,
          temperature: 0.7,
          model: SCRIPT_MODEL,
        });
      }

      const validation = validateScript90Min(script);
      if (validation.isValid) {
        return { script, attempts };
      }

      violations = validation.violations;
      if (i < MAX_RETRIES - 1) {
        console.log(`Validation failed, attempt ${i + 1}/${MAX_RETRIES}:`, violations);
      }
    } catch (error) {
      console.error(`Error generating script (attempt ${i + 1}):`, error);
      
      // If it's an overloaded error and not the last retry, wait with exponential backoff
      if (isOverloadedError(error) && i < MAX_RETRIES - 1) {
        const waitTime = Math.min(1000 * Math.pow(2, i), 10000); // Max 10 seconds
        console.log(`API overloaded, waiting ${waitTime}ms before retry...`);
        await sleep(waitTime);
        i--; // Retry the same attempt by decrementing i
        shouldRetry = true;
      } else if (i === MAX_RETRIES - 1) {
        throw error;
      }
    }
    
    if (shouldRetry) {
      continue; // Retry the same iteration
    }
  }

  // Return script even if validation failed after max retries
  return { script, attempts, violations };
}
