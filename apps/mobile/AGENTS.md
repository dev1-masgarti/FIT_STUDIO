# FitOwn Mobile — Agent Instructions

Parent: @../../AGENTS.md

## Auth screens (Figma)

| Route | Figma node | Screen |
|-------|------------|--------|
| `app/(auth)/splash.tsx` | 126:415 | Splash |
| `app/(auth)/login.tsx` | 126:438 | Login |
| `app/(auth)/sign-up.tsx` | 126:502 | Sign Up |
| `app/(auth)/forgot-password.tsx` | 126:576 | Forgot Password |

## Run

```bash
pnpm dev          # from repo root
cd apps/mobile && pnpm ios
```

## Design tokens

`constants/theme.ts` — match Figma hex values. Gradients via `expo-linear-gradient`.

## Icons & Figma assets (critical)

**Do not use `require('*.png')` + `expo-image` for Figma-exported icons without verification.**

Figma MCP often saves SVG as `.png` → icons render **blank** with no error.

| Do | Don't |
|----|-------|
| `react-native-svg` in `components/icons/` | `require('@/assets/images/icon-foo.png')` for MCP downloads |
| Run `file <asset>` — must be PNG/JPEG | Assume `.png` extension means raster |
| Confirm visible in simulator | Ship because file exists on disk |

Examples: `components/icons/SlideIcons.tsx`  
Full checklist: `.cursor/skills/fitown-figma-mobile/references/asset-export.md`

## Next

Wire Supabase auth per `docs/planning/plans/01-auth-onboarding.md`.
