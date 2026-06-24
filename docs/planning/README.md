# FitOwn Planning Index

Generated from document extraction + wireframe analysis.

## Source Documents

| File | Type | Extracted to |
|------|------|--------------|
| Fit Tech - Meeting Discussion Document.pdf | Product discovery | `docs/extracted/Fit Tech  - Meeting Discussion Document.txt` |
| PARQ only 240828.pdf | Health intake form | `docs/extracted/PARQ only 240828.txt` |
| John Bower - Lenovo.docx | Session transcript | `docs/extracted/John Bower  - Lenovo.txt` |
| John Bower - Iphone.docx | Session transcript | `docs/extracted/John Bower - Iphone.txt` |
| MASGARTI's Fit Tech.html | Lo-fi wireframe (20 screens) | Original HTML |

Re-extract after doc updates:

```bash
python3 scripts/extract-docs.py
```

## Planning Documents

| Document | Purpose |
|----------|---------|
| [PRODUCT.md](./PRODUCT.md) | Complete product requirements |
| [TECH_STACK.md](./TECH_STACK.md) | Lightweight pnpm + Expo + Supabase architecture |
| [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md) | 8-phase step-by-step plan |

## Module Plans (features per file)

| Plan | Module |
|------|--------|
| [00-design-system.md](./plans/00-design-system.md) | Figma tokens, components, gradients |
| [01-auth-onboarding.md](./plans/01-auth-onboarding.md) | Splash, signup, quick profile |
| [02-dashboard.md](./plans/02-dashboard.md) | Home + empty state |
| [03-workout-logging.md](./plans/03-workout-logging.md) | Log flow (strength + cardio) |
| [04-history-progress.md](./plans/04-history-progress.md) | History, exercise detail, session detail |
| [05-sharing-rbac.md](./plans/05-sharing-rbac.md) | My Team, access control, trainer view |
| [06-parq-health.md](./plans/06-parq-health.md) | PARQ health form |
| [07-profile-settings.md](./plans/07-profile-settings.md) | Profile, export, delete |
| [08-shared-packages.md](./plans/08-shared-packages.md) | @fitown/types, utils, constants |
| [09-database-api.md](./plans/09-database-api.md) | Supabase schema, RLS, edge functions |
| [10-e2ee-messaging.md](./plans/10-e2ee-messaging.md) | Device keys, encrypted chat envelopes, receipts |
| [11-encrypted-sync.md](./plans/11-encrypted-sync.md) | Local-first encrypted sync protocol |

## Agent Skills

| Skill | Invoke | Purpose |
|-------|--------|---------|
| `fitown-project` | Auto / `/fitown-project` | Product context & scope |
| `fitown-mobile-standards` | Auto on `apps/mobile/**` | Coding conventions |
| `fitown-figma-mobile` | `/fitown-figma-mobile` | Figma → RN exact replication |

Built-in Figma plugin skills (install [Figma marketplace plugin](https://cursor.com/marketplace/figma)):

- `figma-use` — before any `use_figma` MCP call
- `figma-generate-design` — building screens in Figma from code
- `figma-generate-library` — design system in Figma

## Cursor Agent Setup

The agent discovers plans and rules through three layers ([Cursor docs](https://cursor.com/docs/context/rules), [Skills](https://cursor.com/docs/skills)):

| Layer | Path | Behavior |
|-------|------|----------|
| **Always-on rule** | `.cursor/rules/fitown-source-of-truth.mdc` | Included in every Agent chat — points here |
| **Root instructions** | `AGENTS.md` | Project-wide agent entry point |
| **Nested instructions** | `docs/planning/AGENTS.md` | Applied when editing planning docs |
| **File-scoped rules** | `.cursor/rules/fitown-planning-docs.mdc` | Auto-attached for `docs/planning/**` |
| **File-scoped rules** | `.cursor/rules/fitown-mobile-code.mdc` | Auto-attached for `apps/**`, `packages/**` |
| **Skills** | `.cursor/skills/fitown-*/` | Agent Decides or `/skill-name` invoke |

Verify in **Cursor Settings → Rules**: `fitown-source-of-truth` should show as **Always Apply**.

## Next Steps

1. **Approve** PRODUCT.md + roadmap
2. **Phase 1:** Create Figma hi-fi (all 20 screens) via `/figma-generate-design`
3. **Phase 0:** Bootstrap pnpm monorepo when implementation begins
4. **Implement:** One screen at a time with `/fitown-figma-mobile`
