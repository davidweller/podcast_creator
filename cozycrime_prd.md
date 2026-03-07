## PRODUCT REQUIREMENTS DOCUMENT

**Cozy Crime Creator Suite**
Version 4.0
Last Updated: March 2026

---

# 1. Product Overview

## 1.1 Purpose

The Cozy Crime Creator Suite is a single-creator web application that converts historical research into fully publish-ready Cozy Crime media outputs.

The system transforms pasted research into:

* 90-minute Cozy Crime script (Descending Spiral format)
* YouTube Shorts trailer script
* SEO-aligned Cozy Crime YouTube description
* Episode titles
* Episode metadata
* Painted/illustrative background image prompt set

All outputs strictly enforce Cozy Crime structural, tonal, and pacing rules using locked master prompts.

The tool is for personal production use only and prioritises consistency, tone protection, and workflow speed.

---

# 2. Core Goals

## 2.1 Primary Goals

* Eliminate manual restructuring of research into scripts
* Enforce Cozy Crime tone and structural integrity
* Generate publish-ready scripts guided by an emotional arc, not topic coverage
* Maintain consistency across all episode assets
* Reduce cognitive load and workflow fragmentation
* Store and revisit prior projects locally

## 2.2 Success Criteria

* Script follows the Descending Spiral: five emotional phases, 4-7 chapter breaks
* Script requires minimal or zero editing before recording
* No circular repetition or topic-driven chapter proliferation
* Tone consistency maintained across outputs
* Full episode asset pack generated within minutes
* Creator can manage entire production pipeline in one app

---

# 3. System Scope

## 3.1 Single Creator System

* No user accounts
* Local project storage only (SQLite)
* No multi-user support
* No collaboration features
* Personal production environment

## 3.2 AI Model

* Script generation: Claude Sonnet 4.6
* Improvements, metadata, descriptions: Claude Sonnet 4.6
* Image prompt model targets: ChatGPT + Gemini image systems
* Prompts locked and non-editable

## 3.3 Output Format

All long outputs must be:

* Fully publish-ready
* Clean prose only
* Downloadable as .txt files
* No markup
* No stage directions
* No metadata inside scripts

---

# 4. Application Structure

## 4.1 Entry Screen — Project Library

### Purpose

Central hub for all created cases.

### Displays

Each saved project shows:

* Case title
* Era/location subtitle
* Date created
* Last edited date
* Output status icons:
  * 90-min generated
  * Description generated
  * Shorts generated
  * Metadata generated

### Actions

* Create New Project
* Open Project
* Delete Project
* Duplicate Project

---

# 5. Project Workspace Layout

Once inside a project:

### Top Navigation Tabs

1. Research
2. Script Generator
3. YouTube Description
4. Shorts Generator
5. Title & Metadata Generator
6. Background Image Prompt

Each tab generates independently.

All outputs saved to project.

---

# 6. Tab 1 — Research Input

## 6.1 Purpose

Single source of truth for case data.

## 6.2 Input Method

User pastes fact clusters manually.

Large scrollable text field.

## 6.3 Stored Data

Saved locally per project:

* Full research paste
* Last edit timestamp

## 6.4 Guidance

For best script quality, research should include:

* At least 500 words of source material
* Era or period context (e.g. Victorian, specific century)
* Named people and places
* Chronological detail where available

---

# 7. Tab 2 — Script Generator

## 7.1 Outputs

Buttons:

* Generate 90-Minute Script
* Look for Improvements
* Apply Improvements
* Download TXT

## 7.2 Generation Method — Two-Stage Pipeline

The 90-minute script is generated through a two-stage pipeline, hidden from the user.

### Stage 1 — Narrative Architecture

Claude reads the research fact clusters and produces a structured narrative plan. This plan is NOT prose; it is a set of instructions that the script generation stage will follow. The plan includes:

* Assignment of specific facts to each of the 5 emotional phases (by emotional purpose, not by topic)
* Placement of 4-7 chapter breaks, each tied to an emotional shift
* Opening image: a specific physical scene to begin the script
* Closing image: a specific still, quiet scene to end the script
* Character introductions: key people, human details, and when they enter the arc
* The crime thread: how the central event stays present throughout

This stage uses the default model (fast, structured output).

### Stage 2 — Full Script Generation

Claude generates the complete 10,800-11,700 word script in a single pass, guided by the narrative plan from Stage 1. The full research text is provided as source material alongside the plan.

Single-pass generation ensures:

* One coherent narrative voice throughout (no tonal seams)
* No circular repetition (the AI sees everything it has written)
* Chapter breaks placed in context as the story unfolds
* The emotional arc drives the structure, not topic coverage

This stage uses the script model with high output token capacity.

### Post-Generation — Improvement Pass (Manual)

After generation, the user can trigger "Look for Improvements" which analyses the script against the Descending Spiral template checklist. Suggested improvements can then be applied in a single editing pass.

## 7.3 The Descending Spiral — Script Structure

The 90-minute script follows the Descending Spiral structure defined in `cozy_crime_template.md`. The governing idea: the episode begins at its widest, most atmospheric point and slowly, gently narrows toward the human and the intimate.

### The Five Phases

| Phase | Name | Timing | Words | The Listener's Experience |
|---|---|---|---|---|
| 1 | Draw In | 0-10 min | 1,200-1,500 | Arrives inside the world and the mystery simultaneously |
| 2 | Settle | 10-30 min | 2,400-3,000 | Meets the people. The world deepens around them |
| 3 | Unfold | 30-60 min | 3,600-4,500 | Lives inside the events as they happened |
| 4 | Sit With It | 60-80 min | 2,400-3,000 | The aftermath, the theories, the incompleteness |
| 5 | Rest | 80-90 min | 900-1,200 | Honoured. Held. Ready to sleep |

Total: 10,800-11,700 words at 120-130 words per minute.

### Opening Structure

The script begins with prose in this order (no "OPENING:" label):

1. Story hook: a physical image in a specific place and time. The mystery is present from the first sentence. Uses the pattern: "Tonight, we travel to [place, period]..."
2. Welcome: the exact verbatim welcome block (see `lib/prompts/opening-template.ts`)
3. "Good evening, and welcome."
4. Permission to rest, then "Chapter 1."

### Chapters

* Number and full stop only; no descriptive titles. Format: "Chapter 1.", "Chapter 2.", etc.
* 4 to 7 chapter breaks total. Fewer is usually better.
* Chapters are punctuation, not filing cabinets. They mark emotional shifts, not topic changes.
* Each chapter break follows an emotional completion: a scene has ended, the focus shifts, time moves, or the listener needs a moment of rest.

### Closing

The script ends with:

1. A passage honouring the people by name
2. A still, quiet physical image from the world of the story
3. A farewell of three sentences or fewer
4. The exact sign-off: "Rest well. A peaceful night to you."

## 7.4 Style Rules

These are enforced in both generation and improvement passes:

* No em-dashes or en-dashes anywhere
* No gore or graphic description; violence happens offstage
* No sensational language or modern true crime tropes
* No exclamation marks
* No modern slang or contemporary framing
* No banned words: subscribe, like, bell icon, content, algorithm
* No bracketed markers: [pause], [music], [SFX]
* The victim is introduced as a person first (the Mother Test)
* The crime is present as a living thread in every phase
* Context arrives through people, not as standalone information

---

# 8. Tab 3 — YouTube Description Generator

## 8.1 Outputs

Generate Description button.

## 8.2 Structure Generated

* Literary opening hook
* Historical context paragraph
* Calm synopsis
* Gentle CTA language
* Timestamps (if script exists)
* SEO keyword integration (invisible tone alignment)
* Hashtags
* Search tags list

## 8.3 Tone Rules

* Cozy Crime tone only
* No algorithm language
* No hype language
* No modern YouTube cliches
* Companionable voice only

---

# 9. Tab 4 — Shorts Generator

## 9.1 Input

Uses:

* Episode title
* Key compelling details extracted from research

## 9.2 Output

50-100 word trailer script.

## 9.3 Rules

* Atmospheric opening
* Gentle curiosity
* Calm intrigue
* No sensationalism
* No em-dashes
* Soft invitation to listen

---

# 10. Tab 5 — Title & Metadata Generator

## 10.1 Title Generator

Produces:

* 5 primary title options
* 5 alternative SEO-forward titles

Rules:

* Period appropriate
* Calm intrigue
* No sensationalism
* No clickbait language

## 10.2 Metadata Output

* Episode summary (short)
* Long synopsis
* SEO keywords
* Tags list
* Category suggestions
* Upload checklist

---

# 11. Tab 6 — Background Image Prompt Generator

## 11.1 Output

36 illustrated scene image prompts plus a YouTube thumbnail prompt.

## 11.2 Style

* Period-accurate, Rick and Morty-esque illustrated style
* Calm, atmospheric scenes
* Suitable for long looping video
* No characters staring directly at viewer
* No violence depiction

## 11.3 Engine Target

Prompts generated with Claude, images generated with:

* Gemini image generation

---

# 12. Storage System

## 12.1 Local Project Storage

Each project stores:

* Research text
* Generated scripts
* Description
* Shorts
* Titles
* Metadata
* Image prompt

## 12.2 Database

SQLite (via better-sqlite3), local file storage. No accounts, no authentication.

---

# 13. Export System

Each output has:
**Download as TXT**

Clean formatting:

* Plain text
* No markdown
* No hidden metadata

---

# 14. Prompt Architecture

Prompts locked internally in `lib/prompts/`.

User cannot edit.

Includes:

* Narrative architecture prompt (Stage 1 planning)
* 90-min master script prompt (Stage 2 generation, Descending Spiral)
* Shorts prompt
* Description prompt
* Description & metadata combined prompt
* Metadata prompt
* Image prompt generator
* Image set prompt generator
* Improvement analysis prompt
* Improvement application prompt

The authoritative style guide is `cozy_crime_template.md` (the Descending Spiral template).

---

# 15. Technical Build

## Stack

Frontend:

* Next.js (App Router)
* Tailwind CSS
* React

Backend:

* Node.js
* Claude API (Anthropic SDK)
* SQLite (better-sqlite3)

## No Auth

Local only. Single creator.

---

# 16. Future Expansion (Not in Current Version)

* Batch episode generation
* Audio narration export
* Series planning
* Publishing calendar
* Multi-channel support
