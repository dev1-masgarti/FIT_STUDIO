---
name: fitown-figma-mobile
description: >-
  Step-by-step Figma-to-Expo React Native replication for FitOwn mobile screens.
  Use when implementing any FitOwn UI from Figma, exporting assets, matching gradients,
  colours, typography, or verifying pixel parity. Mandates loading figma-use before
  use_figma MCP calls. Triggers on "implement from Figma", "match design", "gradient",
  "export assets", or when a figma.com URL is provided for FitOwn screens.
---

# FitOwn — Figma → Mobile Exact Replication

Replicate Figma hi-fi designs **pixel-accurately** in `apps/mobile` using Expo + NativeWind + `expo-linear-gradient`.

## Prerequisites

Before any screen work:

1. Load `/fitown-project` — scope and design principles
2. Load `/fitown-mobile-standards` — code conventions
3. Read the module plan: `docs/planning/plans/0X-*.md`
4. For Figma MCP writes: load **`figma-use`** skill first (mandatory)
5. For full page builds in Figma: load **`figma-generate-design`** skill

---

## Workflow Overview

Copy this checklist and track progress per screen:

```
Screen: _______________
- [ ] Step 1: Get design context + screenshot
- [ ] Step 2: Extract & document tokens
- [ ] Step 3: Export assets
- [ ] Step 4: Map tokens → tailwind.config.ts
- [ ] Step 5: Build component tree (bottom-up)
- [ ] Step 6: Implement gradients
- [ ] Step 7: Wire navigation + data
- [ ] Step 8: Visual diff verification
```

---

## Step 1: Get Design Context

For each Figma frame (screen):

1. Parse URL: `figma.com/design/:fileKey/:name?node-id=:nodeId` → convert `-` to `:` in nodeId
2. Call MCP **`get_design_context`** with `fileKey` + `nodeId`
3. Call MCP **`get_screenshot`** for the same node — keep as visual ground truth
4. If Code Connect exists, call **`get_code_connect_map`** — prefer mapped components

**Do not** start coding from memory. Always have screenshot + context in the session.

---

## Step 2: Extract & Document Tokens

From Figma variables/styles, record in `apps/mobile/constants/theme.ts`:

| Token type | Figma source | Code target |
|------------|--------------|-------------|
| Colours | Variables / fills | `tailwind.config.ts` → `colors.neutral.*`, `colors.accent.*` |
| Typography | Text styles | `fontFamily`, `fontSize`, `lineHeight`, `letterSpacing` |
| Spacing | Auto-layout gap/padding | Tailwind spacing scale |
| Radius | Corner radius | `borderRadius.sm/md/lg/full` |
| Shadows | Effect styles | `shadowCard`, etc. (RN shadow props) |

### Colour direction (FitOwn)

- Primary UI: monochrome greys (#111, #666, #ddd, #f5f5f5, #fff)
- Accent: deep teal or forest green (progress, active states)
- Alert: warm amber (PARQ flags)
- Avoid neon fitness colours

Convert Figma 0–1 RGB to hex: `Math.round(c * 255).toString(16).padStart(2,'0')`

---

## Step 3: Export Assets

> **MANDATORY:** Read [references/asset-export.md](references/asset-export.md) before adding any file under `assets/`.  
> **Figma MCP often saves SVG as `.png` — those files render blank with `expo-image`.** Use `react-native-svg` components in `components/icons/` instead.

### From Figma MCP

1. Identify exportable nodes: icons, logo mark, tab bar icons, illustrations
2. For each download URL from `get_design_context`, run `file <path>` or `head -1 <path>`
3. **If content is SVG** → create `components/icons/{Name}Icon.tsx` with `react-native-svg` (see `SlideIcons.tsx`)
4. **If content is raster** → save as `.png` / `.jpg` under `assets/images/` only
5. **Never** `require('*.png')` for icons without verifying it is real PNG/JPEG data

### Naming convention

```
components/icons/{Name}Icon.tsx     # preferred for all UI icons (vector)
assets/images/{name}.jpg            # photos, splash backgrounds (raster only)
assets/images/{name}.png            # raster only — verify with `file` command
```

**Do not use** `assets/images/icon-*.png` for Figma MCP downloads without verification — they are usually SVG.

### Register fonts

```typescript
// apps/mobile/app/_layout.tsx
import { useFonts } from 'expo-font';
// Load before rendering screens
```

**Icons:** always `react-native-svg` components — never `expo-image` + `require()` for Figma-exported icons unless `file` confirms raster format.

---

## Step 4: Map Tokens → Tailwind

Update `apps/mobile/tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      neutral: { 900: '#111111', 600: '#666666', /* from Figma */ },
      accent: { DEFAULT: '#0D6B5C', light: '#14A892' },
      alert: { DEFAULT: '#D97706' },
    },
    fontFamily: {
      sans: ['Inter', 'System'],
    },
  },
},
```

**Rule:** No raw hex in components — only Tailwind token classes or `theme.ts` constants.

---

## Step 5: Build Component Tree (Bottom-Up)

Order of implementation:

1. **Primitives** — `Button`, `Input`, `Card`, `Chip`, `Toggle`, `Avatar`
2. **Composites** — `SetRow`, `MetricCard`, `SessionCard`, `ProfessionalCard`
3. **Screen layout** — safe areas, scroll, header, tab bar
4. **Screen** — compose in `app/(tabs)/...`

Match Figma auto-layout structure:

| Figma | React Native |
|-------|--------------|
| Vertical auto-layout, gap 12 | `<View className="flex-col gap-3">` |
| Horizontal, space-between | `<View className="flex-row justify-between items-center">` |
| Fill container | `flex-1` |
| Hug contents | no flex-1 on child |
| Padding 16 | `p-4` |

### Touch targets

Minimum **44×44** — add padding if visual size is smaller.

---

## Step 6: Implement Gradients (Critical)

Figma linear/radial gradients **must not** be approximated with solid colours.

### Extract gradient spec from Figma

Record per gradient instance:
- Type: linear | radial
- Angle (degrees) or start/end points (0–1)
- Stops: `[{ color: '#xxx', position: 0 }, { color: '#yyy', position: 1 }]`

### Create preset wrapper

```typescript
// apps/mobile/components/ui/GradientBackground.tsx
import { LinearGradient } from 'expo-linear-gradient';
import { ViewStyle } from 'react-native';

type GradientPreset = 'cta-primary' | 'card-highlight' | 'dashboard-header';

const GRADIENTS: Record<GradientPreset, { colors: string[]; start: [number, number]; end: [number, number] }> = {
  'cta-primary': {
    colors: ['#111111', '#2a2a2a'], // replace with Figma exact values
    start: [0, 0],
    end: [1, 1],
  },
  // ... one entry per Figma gradient
};

export const GradientBackground = ({ preset, children, className, style }) => (
  <LinearGradient
    colors={GRADIENTS[preset].colors}
    start={GRADIENTS[preset].start}
    end={GRADIENTS[preset].end}
    className={className}
    style={style}
  >
    {children}
  </LinearGradient>
);
```

### Figma angle → start/end conversion

For linear gradient at angle θ (CSS convention, 0° = to top):

```typescript
const angleRad = ((θ - 90) * Math.PI) / 180;
const start = { x: 0.5 - Math.cos(angleRad) * 0.5, y: 0.5 - Math.sin(angleRad) * 0.5 };
const end   = { x: 0.5 + Math.cos(angleRad) * 0.5, y: 0.5 + Math.sin(angleRad) * 0.5 };
```

### Gradient on text (if Figma uses gradient fills on text)

Use `@react-native-masked-view/masked-view` + `LinearGradient` behind clipped text — only when Figma specifies gradient text.

### Verification

Compare gradient direction and stop positions against `get_screenshot` — adjust start/end until match.

---

## Step 7: Wire Navigation + Data

After visual shell matches:

1. Connect Expo Router params (`[sessionId]`, `[id]`)
2. Replace mock data with TanStack Query hooks
3. Preserve loading skeletons that match Figma shimmer/card placeholders
4. Empty states must match Figma empty frame (e.g., Dashboard 2.2)

---

## Step 8: Visual Diff Verification

Before marking screen complete:

- [ ] Side-by-side: Figma screenshot vs iOS Simulator / Android emulator
- [ ] Typography: font, size, weight, line-height within 1px
- [ ] Spacing: padding/gap within 2px
- [ ] Colours: exact hex from tokens (use color picker on both)
- [ ] Gradients: direction and stops visually match
- [ ] Border radius matches
- [ ] Icons: correct asset, size, stroke weight — **visible in simulator** (not blank)
- [ ] Safe area: status bar + notch handled (`SafeAreaView` / `useSafeAreaInsets`)
- [ ] Bottom tab bar: 5 items with labels, active state matches Figma
- [ ] Accessibility: labels present, 44px targets

---

## Screen Implementation Order

Follow `docs/planning/IMPLEMENTATION_ROADMAP.md`:

1. Design system primitives (Plan 00)
2. Auth screens 1.1–1.3
3. Tab shell + Dashboard 2.1–2.2
4. Log flow 3.1–3.4
5. History 4.1–4.3
6. Share 5.1–5.3
7. PARQ 6.1–6.3
8. Profile 7.1–7.2

**One screen per agent session** when possible — reduces context drift.

---

## Common Mistakes to Avoid

| Mistake | Fix |
|---------|-----|
| **SVG saved as `.png` from Figma MCP** | Run `file` on asset; use `react-native-svg` in `components/icons/` — see [asset-export.md](references/asset-export.md) |
| **`expo-image` + `require()` for icons** | Icons → SVG components; `expo-image` only for verified raster (jpg/png) |
| Solid colour instead of gradient | Always check Figma fill type |
| Hardcoded hex in JSX | Use Tailwind tokens |
| Missing safe area | `useSafeAreaInsets()` on headers/FAB |
| Icon-only bottom nav | Wireframe requires text labels |
| Wrong font weight | Match Figma text style exactly |
| Skipping empty state | Implement both 2.1 and 2.2 |
| Approximate spacing | Use Figma inspect values → Tailwind |

---

## MCP Tool Reference

| Task | Tool |
|------|------|
| Read design + code hints | `get_design_context` |
| Visual ground truth | `get_screenshot` |
| Build/edit Figma file | `use_figma` (+ `figma-use` skill) |
| Find design system components | `search_design_system` |
| Push code layout to Figma | `generate_figma_design` (+ `figma-generate-design` skill) |

---

## Additional Resources

- Figma replication details: [references/gradient-recipes.md](references/gradient-recipes.md)
- Asset export checklist: [references/asset-export.md](references/asset-export.md)
- FitOwn wireframe fallback: `docs/MASGARTI's Fit Tech.html`
