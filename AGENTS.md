# FitOwn — Agent Instructions

This repository is **FitOwn (MASGARTI Fit Tech)** — a client-owned fitness data platform (POC v0.1).

**Before planning, implementing, or reviewing anything in this repo, read the planning index:**

→ [`docs/planning/README.md`](docs/planning/README.md)

---

## Document hierarchy (source of truth)

| Priority | Document | When to read |
|----------|----------|--------------|
| 1 | `docs/planning/README.md` | Every session — index and links |
| 2 | `docs/planning/plans/XX-*.md` | Before working on a specific module/screen |
| 3 | `docs/planning/PRODUCT.md` | Scope, features, design principles |
| 4 | `docs/planning/TECH_STACK.md` | Architecture, pnpm, Expo, Supabase |
| 5 | `docs/planning/IMPLEMENTATION_ROADMAP.md` | Phase order and dependencies |
| 6 | `docs/MASGARTI's Fit Tech.html` | Lo-fi wireframe (20 screens) |
| 7 | `docs/extracted/` | Raw text from PDF/DOCX sources |

**Do not implement features not listed in the active module plan.** Defer out-of-scope items per `PRODUCT.md` §4.2.

---

## Cursor skills (project)

Located in `.cursor/skills/`. Invoke with `/skill-name` or let Agent decide.

| Skill | Use when |
|-------|----------|
| `fitown-project` | Any FitOwn work — product context and scope |
| `fitown-mobile-standards` | Writing code in `apps/mobile/` or `packages/` |
| `fitown-figma-mobile` | Implementing UI from Figma (gradients, assets, pixel parity) |
| `fitown-supabase-migrations` | SQL migrations, schema changes, `pnpm db:migrate`, Supabase DDL |

**Figma asset trap:** MCP downloads are often SVG saved as `.png` — invisible with `expo-image`. Icons must use `react-native-svg` in `components/icons/`. See `.cursor/skills/fitown-figma-mobile/references/asset-export.md`.

**Figma plugin skills** (marketplace): load `figma-use` before any `use_figma` MCP call; use `figma-generate-design` when building screens in Figma.

---

## Workflow rules

### Planning or documentation
1. Read `docs/planning/README.md`
2. Update the relevant `docs/planning/plans/XX-*.md` file
3. Keep `PRODUCT.md` and roadmap in sync if scope changes

### Implementing a feature
1. Read the matching plan file in `docs/planning/plans/`
2. Confirm phase in `IMPLEMENTATION_ROADMAP.md`
3. Follow `TECH_STACK.md` (pnpm, Expo, Supabase, `@fitown/*` packages)
4. For UI: Figma hi-fi must exist → use `fitown-figma-mobile` skill
5. For icons from Figma: verify assets with `file` command; use `react-native-svg` components — never unverified `.png` requires

### Package manager
**pnpm only** — never npm or yarn. Run from repo root: `pnpm --filter @fitown/mobile <script>`

---

## Module plan → screen map

| Plan file | Screens |
|-----------|---------|
| `plans/00-design-system.md` | Figma tokens & components |
| `plans/01-auth-onboarding.md` | 1.1–1.3 |
| `plans/02-dashboard.md` | 2.1–2.2 |
| `plans/03-workout-logging.md` | 3.1–3.4 |
| `plans/04-history-progress.md` | 4.1–4.3 |
| `plans/05-sharing-rbac.md` | 5.1–5.3 |
| `plans/06-parq-health.md` | 6.1–6.3 |
| `plans/07-profile-settings.md` | 7.1–7.2 |
| `plans/08-shared-packages.md` | `@fitown/types`, `utils`, `constants` |
| `plans/09-database-api.md` | Supabase schema & RLS |

---

## Re-extract source documents

After PDF/DOCX updates in `docs/`:

```bash
python3 scripts/extract-docs.py
```
