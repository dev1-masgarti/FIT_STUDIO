---
name: fitown-project
description: >-
  FitOwn (MASGARTI Fit Tech) product context and planning doc router. Use for ANY work in
  this repository — before planning, implementing, or reviewing FitOwn features. Points to
  docs/planning/README.md, module plans in docs/planning/plans/, PRODUCT.md, TECH_STACK.md,
  and IMPLEMENTATION_ROADMAP.md. Covers data ownership, 1RM, PARQ, RBAC, POC scope.
---

# FitOwn Project Context

## Agent: Start Here

1. **Index:** `docs/planning/README.md` (or root `AGENTS.md`)
2. **Module plan:** `docs/planning/plans/XX-*.md` for the feature you are building
3. **Scope check:** `docs/planning/PRODUCT.md` §4.2 — defer out-of-scope items

Cursor loads `.cursor/rules/fitown-source-of-truth.mdc` (always apply) automatically.

## Product in One Line

**FitOwn** — client-owned fitness data; professionals are guests with permission.

## POC v0.1 Scope

**In:** Manual workout logging (strength + cardio), 1RM derivation, dashboard, history, PARQ, sharing/RBAC, trainer read-only view, export/delete.

**Out:** Wearables, computer vision, AI coaching, nutrition, blockchain, video upload, recovery modeling.

## Core Data Variables

| Type | Fields |
|------|--------|
| Strength | weight (kg), reps, sets, RPE |
| Cardio | activity, duration, intensity, optional distance/intervals |
| Derived | 1RM per movement, progressive overload context |

## Design Principles

1. Data ownership visible on every screen
2. Set entry in <10 seconds (pre-fill, increment buttons)
3. Previous best + 1RM at point of decision (during logging)
4. PARQ non-blocking; progressive disclosure
5. Accessibility: 44px touch, 14px body text, labeled nav

## Visual Direction

Monochrome base + single accent (teal/green) + amber alerts. Professional, not gamified.

## Key Documents

| Doc | Path |
|-----|------|
| Product requirements | `docs/planning/PRODUCT.md` |
| Tech stack | `docs/planning/TECH_STACK.md` |
| Roadmap | `docs/planning/IMPLEMENTATION_ROADMAP.md` |
| Module plans | `docs/planning/plans/*.md` |
| Wireframe | `docs/MASGARTI's Fit Tech.html` |
| Extracted sources | `docs/extracted/` |

## Navigation IA

Bottom tabs: **Home | Log | History | Share | Profile** — max 3 taps to any data point.

## Before Implementing a Feature

1. Read the matching plan file in `docs/planning/plans/`
2. Check POC scope — defer out-of-scope items
3. Match `@fitown/*` package conventions
4. For UI: use `/fitown-figma-mobile` skill after Figma hi-fi exists
