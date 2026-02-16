## PRODUCT REQUIREMENTS DOCUMENT

**Cozy Crime Creator Suite**
Version 3.1
Last Updated: February 2026

---

# 1. Product Overview

## 1.1 Purpose

The Cozy Crime Creator Suite is a single-creator web application that converts historical research into fully publish-ready Cozy Crime media outputs.

The system transforms pasted research into:

* 30-minute Cozy Crime script
* 90-minute Cozy Crime script
* YouTube Shorts trailer script
* SEO-aligned Cozy Crime YouTube description
* Episode titles
* Episode metadata
* Painted/illustrative looping background image prompt

All outputs strictly enforce Cozy Crime structural, tonal, and pacing rules using locked master prompts and automated validation.

The tool is for personal production use only and prioritises consistency, tone protection, and workflow speed.

---

# 2. Core Goals

## 2.1 Primary Goals

* Eliminate manual restructuring of research into scripts
* Enforce Cozy Crime tone and structural integrity
* Generate publish-ready scripts in one pass
* Maintain consistency across all episode assets
* Reduce cognitive load and workflow fragmentation
* Store and revisit prior projects locally

## 2.2 Success Criteria

* Script requires minimal or zero editing before recording
* Structural violations eliminated
* Tone consistency maintained across outputs
* Full episode asset pack generated within minutes
* Creator can manage entire production pipeline in one app

---

# 3. System Scope

## 3.1 Single Creator System

* No user accounts
* Local project storage only
* No multi-user support
* No collaboration features
* Personal production environment

## 3.2 AI Model

* Primary generation: Claude
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

  * 30-min generated
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

## 6.4 Validation

Before any generation:
System checks:

* Minimum length threshold
* Presence of historical context
* Presence of named individuals
* Presence of location references

If insufficient:
Blocking warning:

> Research appears too thin for full script generation.

---

# 7. Tab 2 — Script Generator

## 7.1 Outputs

Buttons:

* Generate 30-Minute Script
* Generate 90-Minute Script
* Download TXT

Each generated independently.

---

## 7.2 Generation Method

Staged orchestration (hidden from user):

### Stage 1 — Structure Planning

Claude builds:

* Chapter structure
* Emotional spine placement
* Narrative arc
* Mystery seed placement

### Stage 2 — Chapter Drafting

Claude writes chapters individually.

### Stage 3 — Assembly

Chapters merged into full script.

### Stage 4 — Enforcement Pass

System runs validation + correction prompt.

### Stage 5 — Final Output

Clean narration-only script returned.

---

## 7.3 Script Structure (Opening and Chapters)

Scripts follow a fixed opening order and chapter format:

**Opening (no "OPENING:" label in output).** The script begins with prose in this order:
1. Story hook: era, place, sensory detail(s), then the curiosity thread (something was found, someone vanished). The listener must feel the pull of the story within the first 60 seconds (30-min) or 90 seconds (90-min).
2. Welcome: brief greeting (e.g. "Good evening, and welcome.").
3. Reassurance and CTA: quiet promise (no sudden sounds, gentle throughout), then invitation to return framed as companionship.
4. Permission: close your eyes, the story will be here. Then the first chapter heading.

**Chapter headings.** Number and full stop only; no descriptive titles. Format: "Chapter 1.", "Chapter 2.", and so on. 30-min scripts have 5 to 6 chapters; 90-min scripts have 10 chapters.

## 7.4 Hard Enforcement Rules

Generation will auto-correct until compliant:

* Word count within spec
* Chapter count correct (5–6 for 30-min, 10 for 90-min; headings as "Chapter N.")
* Opening structure correct (story hook first, then welcome, CTA, permission)
* Closing ritual exact
* Two CTA mentions only
* No em-dashes
* No modern slang
* Violence offstage
* Victim dignity preserved
* Mystery references per chapter

If Claude fails compliance:
Automatic regeneration loop.

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
* No modern YouTube clichés
* Companionable voice only

---

# 9. Tab 4 — Shorts Generator

## 9.1 Input

Uses:

* Episode title
* Key compelling details extracted from research

## 9.2 Output

50–100 word trailer script.

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

One master looping background prompt.

## 11.2 Style

* Oil painting or painted illustration
* Calm
* Period accurate
* Suitable for long looping video
* No characters staring directly at viewer
* No violence depiction

## 11.3 Engine Target

Optimised for:

* ChatGPT image generation
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

## 12.2 No Accounts

All local browser storage or local database.

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

Prompts locked internally.

User cannot edit.

Includes:

* 30-min master prompt
* 90-min master prompt
* Shorts prompt
* Description prompt
* Metadata prompt
* Image prompt generator
* Validation prompts

---

# 15. Validation Engine

## Hard Validation

* Structural compliance
* Word count compliance
* Banned language
* CTA placement
* Tone violations

## Auto-Correction Loop

If invalid:
System re-prompts Claude until valid.

---

# 16. Technical Build (Cursor Web App)

## Stack

Frontend:

* Next.js
* Tailwind
* Local storage or lightweight DB

Backend:

* Node
* Claude API orchestration
* Prompt pipeline engine
* Validation layer

## No Auth

Local only.

---

# 17. Future Expansion (Not in V1)

* Batch episode generation
* Audio narration export
* Thumbnail prompt generator
* Series planning
* Publishing calendar
* Multi-channel support

---

# 18. Build Priority Order

Phase 1:
Project system + research tab

Phase 2:
30-min script generator

Phase 3:
90-min generator

Phase 4:
Description + metadata

Phase 5:
Shorts + image prompt

Phase 6:
Validation + polish
