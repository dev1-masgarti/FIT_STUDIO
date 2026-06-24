# Plan 00 — Design System (Figma)

**Phase:** 1  
**Owner:** Design → Engineering handoff  
**Reference:** Wireframe `docs/MASGARTI's Fit Tech.html`, PRODUCT.md §6

---

## Objective

Build a Figma component library and design tokens that enable **pixel-accurate** mobile implementation with gradients, monochrome base, and single accent colour.

---

## Features to Implement

### Figma Foundations
- [ ] Colour variables: `neutral/0–900`, `accent/teal`, `alert/amber`, `semantic/success`, `semantic/error`
- [ ] Typography scale: display, title, body, caption, label (min 14px body)
- [ ] Spacing scale: 4px grid (4, 8, 12, 16, 20, 24, 32, 40, 48)
- [ ] Radius tokens: sm(6), md(8), lg(16), full(9999)
- [ ] Shadow/elevation tokens (subtle — professional aesthetic)

### Gradient Definitions
- [ ] Document each gradient: angle, stop colours, stop positions
- [ ] Primary CTA gradient (if hi-fi adds depth beyond wireframe black)
- [ ] Dashboard header / card highlight gradients (if specified in hi-fi)
- [ ] Map every gradient to `expo-linear-gradient` props in implementation notes

### Core Components (Figma)
- [ ] `Button/Primary`, `Button/Outline`, `Button/Small`, `Button/Destructive`
- [ ] `Input/Default`, `Input/Large`, `Input/Search`
- [ ] `Card/Default`, `Card/Highlight`, `Card/Dashed`
- [ ] `Chip/Badge`, `Chip/BadgeActive`
- [ ] `NavBar/Bottom` + 5 tab items (icon + label)
- [ ] `NavBar/Header` (back, title, action)
- [ ] `Toggle/On`, `Toggle/Off`
- [ ] `Slider/Intensity`
- [ ] `Progress/Bar`
- [ ] `Avatar/Default`
- [ ] `FAB/Add`
- [ ] `ListItem/Exercise`, `ListItem/Settings`
- [ ] `Metric/Stat`
- [ ] `Chart/ProgressionBar` (8-bar placeholder style from wireframe)
- [ ] `Banner/ViewOnly` (trainer view)
- [ ] `PhoneFrame` (design preview only)

### Screen Frames (20)
- [ ] Flow 1: 1.1–1.3
- [ ] Flow 2: 2.1–2.2
- [ ] Flow 3: 3.1–3.4
- [ ] Flow 4: 4.1–4.3
- [ ] Flow 5: 5.1–5.3
- [ ] Flow 6: 6.1–6.3
- [ ] Flow 7: 7.1–7.2

### Asset Export Spec
- [ ] Logo mark "F" — SVG @1x, @2x, @3x
- [ ] Tab icons — SVG (Home, Log, History, Share, Profile)
- [ ] Export naming: `icon-{name}-{size}.svg`

---

## Files (Implementation Phase)

| File | Purpose |
|------|---------|
| `apps/mobile/tailwind.config.ts` | Token → Tailwind mapping |
| `apps/mobile/components/ui/GradientBackground.tsx` | Gradient wrapper |
| `apps/mobile/constants/theme.ts` | Raw token values |
| `apps/mobile/assets/icons/*` | Exported SVGs |

---

## Acceptance Criteria

- All 20 screens use components (no one-off detached styles)
- Gradient specs documented per component instance
- Min touch target 44×44 annotated on interactive elements
- Design review sign-off before code implementation begins
