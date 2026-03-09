/**
 * validate-prompts.ts
 *
 * Guardrails for prompt rules single source of truth. Run with: npm run validate:prompts
 *
 * - Fails if any file other than cozy-crime-constants.ts defines canonical exports.
 * - Fails if cozy-crime-constants.ts rule string values contain em-dash or en-dash.
 * - Fails if opening-template.ts defines any constant locally (must only re-export).
 */

import * as fs from "fs";
import * as path from "path";

const PROMPTS_DIR = path.join(process.cwd(), "lib", "prompts");
const CONSTANTS_FILE = path.join(PROMPTS_DIR, "cozy-crime-constants.ts");
const OPENING_TEMPLATE_FILE = path.join(PROMPTS_DIR, "opening-template.ts");

const CANONICAL_EXPORT_NAMES = [
  "OPENING_WELCOME_BLOCK",
  "STORY_HOOK_TEMPLATE",
  "OPENING_SEQUENCE_DESCRIPTION",
  "STYLE_RULES",
  "PHASE_RULES",
  "CHAPTER_BREAK_RULES",
  "CRIME_AS_THREAD_RULE",
  "WORD_COUNT_GUIDE",
  "QUALITY_CHECK_RULES",
  "DESCRIPTION_TONE_RULES",
  "SHORTS_HOOK_RULE",
];

const FORBIDDEN_CHARS = [
  { char: "\u2014", name: "em-dash" },
  { char: "\u2013", name: "en-dash" },
];

function main(): void {
  let failed = false;

  // 1. No duplicate definitions: only cozy-crime-constants.ts may define these.
  const tsFiles = fs.readdirSync(PROMPTS_DIR).filter((f) => f.endsWith(".ts"));
  for (const file of tsFiles) {
    const filePath = path.join(PROMPTS_DIR, file);
    if (path.basename(filePath) === "cozy-crime-constants.ts") continue;
    const content = fs.readFileSync(filePath, "utf-8");
    for (const name of CANONICAL_EXPORT_NAMES) {
      const re = new RegExp(`export\\s+const\\s+${name}\\s*=`, "m");
      if (re.test(content)) {
        console.error(`FAIL: ${file} must not define "${name}". It lives in cozy-crime-constants.ts only.`);
        failed = true;
      }
    }
  }

  // 2. opening-template.ts must only re-export (no local string/template definitions).
  if (fs.existsSync(OPENING_TEMPLATE_FILE)) {
    const content = fs.readFileSync(OPENING_TEMPLATE_FILE, "utf-8");
    if (/=\s*["`]/.test(content)) {
      console.error("FAIL: opening-template.ts must only re-export from constants. It must not define any string or template literal.");
      failed = true;
    }
  }

  // 3. Canonical constants must not contain em-dash or en-dash in their string values.
  if (fs.existsSync(CONSTANTS_FILE)) {
    const content = fs.readFileSync(CONSTANTS_FILE, "utf-8");
    for (const { char, name } of FORBIDDEN_CHARS) {
      if (content.includes(char)) {
        console.error(`FAIL: cozy-crime-constants.ts contains forbidden character: ${name} (${char}). Rules ban em-dashes and en-dashes.`);
        failed = true;
        break;
      }
    }
  }

  if (failed) {
    process.exit(1);
  }
  console.log("validate-prompts: all checks passed.");
}

main();
