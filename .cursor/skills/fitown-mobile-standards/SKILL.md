---
name: fitown-mobile-standards
description: >-
  Coding standards for FitOwn Expo React Native mobile app. Use when writing or reviewing
  TypeScript, components, hooks, or screens in apps/mobile or @fitown packages. Enforces
  pnpm monorepo conventions, NativeWind styling, accessibility, and POC patterns.
paths:
  - "apps/mobile/**"
  - "packages/**"
---

# FitOwn Mobile Coding Standards

## Stack Reminders

- **Expo + Expo Router** — file-based routing under `apps/mobile/app/`
- **NativeWind v4** — Tailwind classes; gradients via `expo-linear-gradient`
- **pnpm** — never npm/yarn; run from root with `pnpm --filter @fitown/mobile`
- **Supabase** — client in `lib/supabase.ts`; TanStack Query for server state
- **Zustand** — workout draft only; not for server data

## File Conventions

```
apps/mobile/
├── app/              # Routes only — minimal logic
├── components/       # UI by domain (dashboard/, log/, share/)
├── hooks/            # useXxx.ts — data fetching & mutations
├── lib/              # supabase, queryClient
├── stores/           # Zustand slices
└── constants/theme.ts
```

## Component Rules

- Use `const` arrow functions: `const HandlePress = () => {}`
- Event handlers prefixed `handle`: `handleSaveSet`, `handleTogglePermission`
- Early returns for loading/error/empty states
- Extract reusable UI to `components/ui/` (Button, Input, Card)
- Types from `@fitown/types` — never duplicate interfaces in app

## Styling

- Prefer NativeWind `className` over StyleSheet unless Reanimated requires it
- Design tokens from `tailwind.config.ts` — no hardcoded hex except in theme file
- Gradients: always use `<GradientBackground preset="...">` wrapper
- Min touch target: `min-h-[44px] min-w-[44px]`
- Min body text: `text-sm` (14px)

## Icons & assets (mandatory)

**Figma MCP downloads are often SVG files named `.png` — they render invisible with `expo-image`.**

1. Before any `require('*.png')` for an icon: run `file <path>` — must say PNG/JPEG, not SVG
2. **All UI icons:** implement as `react-native-svg` in `components/icons/{Name}Icon.tsx`
3. **Raster only:** photos/backgrounds in `assets/images/` with correct extension
4. Verify icons in simulator before marking UI complete

See `.cursor/skills/fitown-figma-mobile/references/asset-export.md` for full checklist.  
Reference: `components/icons/SlideIcons.tsx`

## Accessibility

- Pressable/tab items: `accessibilityRole="button"`, `accessibilityLabel`
- Form inputs: associated labels, error announcements
- No icon-only nav — always show text label under icon

## Data Patterns

```typescript
// Query keys — centralized
export const queryKeys = {
  dashboard: (userId: string) => ['dashboard', userId] as const,
  sessions: (userId: string) => ['sessions', userId] as const,
};

// Optimistic update on set save
onMutate: async (newSet) => { /* cancel queries, snapshot, optimistic */ }
```

## 1RM

Always use `@fitown/utils` `calculateOneRM` — never inline formula.

## Security

- Never use service role key in mobile app
- Assume RLS — don't bypass with admin client
- Export/delete flows require authenticated session

## Commit Scope

One plan module per PR when possible (e.g., "feat(log): set entry screen").
