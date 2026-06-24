# FitOwn Asset Export Checklist

## CRITICAL: Figma MCP exports are often SVG disguised as `.png`

**This is the #1 cause of invisible icons in FitOwn.** It has broken splash arrows, chevrons, Google/Apple icons, and back/mail icons.

### What goes wrong

1. Figma MCP `get_design_context` or curl download saves **SVG markup** to a file named `icon-foo.png`
2. Code uses `require('@/assets/images/icon-foo.png')` with `expo-image` or `Image`
3. Metro bundles the file, but **nothing renders** — no error, blank UI

### How to verify (mandatory before shipping any icon)

```bash
# Must say "PNG image" or "JPEG" — NOT "SVG"
file apps/mobile/assets/images/icon-arrow-next.png

# Or read first line — if it starts with <svg, it is NOT a raster image
head -1 apps/mobile/assets/images/icon-arrow-next.png
```

| `file` output | Safe for `require()` + `expo-image`? |
|---------------|--------------------------------------|
| `PNG image data` | Yes |
| `JPEG image data` | Yes |
| `SVG Scalable Vector Graphics` | **No** — use `react-native-svg` |

### Correct approaches (in order of preference)

#### 1. Inline SVG component (preferred for icons)

Create `apps/mobile/components/icons/{Name}Icon.tsx` with paths from Figma export:

```tsx
import Svg, { Path } from 'react-native-svg';

export const ArrowNextIcon = ({ size = 24, color = '#000' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 28.9655 28.9655" fill="none">
    <Path d="M11.72..." fill={color} />
  </Svg>
);
```

**Existing examples:** `components/icons/SlideIcons.tsx` (`ArrowNextIcon`, `ChevronsForwardIcon`)

#### 2. Real `.svg` files + `react-native-svg`

- Save as `assets/icons/icon-home.svg` (correct extension)
- Import via SVGR if configured, or copy paths into a component
- **Never** save SVG content with a `.png` extension

#### 3. Raster export (photos / complex illustrations only)

- Export **PNG @2x/@3x** from Figma (Export panel → PNG, not MCP URL blindly)
- Use for `splash-bg.jpg`, photos, textured backgrounds
- Verify with `file` command

### Never do this

```tsx
// BAD — file is often SVG bytes with .png name; icons will be invisible
<Image source={require('@/assets/images/icon-arrow-next.png')} />
```

```bash
# BAD — saves SVG to .png without conversion
curl figma.com/api/mcp/asset/... -o icon-foo.png
```

### Agent checklist (every icon asset)

```
- [ ] Verified with `file` or `head -1` — not SVG masquerading as PNG
- [ ] Icons implemented as react-native-svg components OR real PNG
- [ ] Extension matches content (.svg for vector, .png/.jpg for raster)
- [ ] Visually confirmed in simulator — not just "asset file exists"
- [ ] Reused existing icon in components/icons/ when same asset appears twice
```

---

## Required Assets (POC v0.1)

| Asset | Format | Path | Implementation |
|-------|--------|------|----------------|
| Logo mark "F" | SVG component | `components/icons/` or `GradientText` | `react-native-svg` |
| Slide thumb arrow | SVG component | `components/icons/SlideIcons.tsx` | `ArrowNextIcon` |
| Slide track chevrons | SVG component | `components/icons/SlideIcons.tsx` | `ChevronsForwardIcon` |
| Tab icons | SVG component | `components/icons/` | one file per icon |
| Splash background | JPEG/PNG | `assets/images/splash-bg.jpg` | `expo-image` / `ImageBackground` |
| Social icons | SVG component | `components/icons/SocialIcons.tsx` | not fake `.png` |

## Export Steps from Figma

1. Select icon frame in Figma
2. **Icons:** copy SVG paths → `components/icons/{Name}Icon.tsx` (preferred)
3. **Photos:** Export → PNG/JPEG @2x from Figma UI → `assets/images/`
4. Run verification: `file <path>` on every new asset
5. Confirm in iOS Simulator / Android emulator before marking done

### MCP asset URLs

When `get_design_context` returns `imgFoo = "https://www.figma.com/api/mcp/asset/..."`:

1. Download and inspect: `curl -sL URL | head -5`
2. If SVG → create `react-native-svg` component; do not `require()` as image
3. If raster → save with correct extension (`.png`, `.jpg`)

## Font Export

If Figma uses custom font (not system):

1. Export `.ttf` / `.otf` from Figma or use `@expo-google-fonts/*`
2. Place in `assets/fonts/` or use Expo Google Fonts package
3. Register in root `_layout.tsx` with `expo-font`

## Verification

- [ ] Every asset passed `file` / `head` check (no SVG-as-PNG)
- [ ] Icons visible on device — not only in Figma screenshot
- [ ] SVG renders crisp at 1x, 2x, 3x
- [ ] Active/inactive tab icons visually distinct
- [ ] Logo matches Figma on splash
