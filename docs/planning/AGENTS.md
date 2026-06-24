# Planning — Agent Instructions

You are working in **FitOwn planning documentation**. This folder is the **source of truth** for product and implementation.

## Read first

@README.md — planning index with links to all documents.

## Before editing or extending plans

1. Check scope against @PRODUCT.md §4.1 (in scope) and §4.2 (deferred)
2. Match the plan file template in existing `plans/XX-*.md` files (Features checklist, Files to Create, Acceptance Criteria)
3. Update @IMPLEMENTATION_ROADMAP.md if phase order or dependencies change
4. Update @TECH_STACK.md if stack decisions change

## Plan file naming

`plans/{NN}-{module-name}.md` — two-digit prefix matches roadmap phase.

## Do not

- Duplicate full product spec into plan files — link to PRODUCT.md instead
- Add implementation code here — plans describe *what* to build, not the build itself
- Expand POC scope without explicit user approval
