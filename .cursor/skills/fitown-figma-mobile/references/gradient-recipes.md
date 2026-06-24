# FitOwn Gradient Recipes

Document each Figma gradient here as it is discovered during hi-fi design.

## Template

```markdown
### {preset-name}
- **Figma node:** {node name}
- **Type:** linear
- **Angle:** {degrees}°
- **Stops:**
  - 0%: #{hex}
  - 100%: #{hex}
- **Used on:** {Button Primary / Card Highlight / etc.}
- **Code preset:** `'preset-name'` in GradientBackground.tsx
```

## Placeholder — CTA Primary (Wireframe uses solid #111)

Hi-fi may add depth. Update when Figma specifies:

```typescript
'cta-primary': {
  colors: ['#111111', '#1a1a1a'],
  start: [0, 0],
  end: [0, 1],
},
```

## Placeholder — Accent Progress

```typescript
'accent-progress': {
  colors: ['#0D6B5C', '#14A892'],
  start: [0, 0],
  end: [1, 0],
},
```

## Radial Gradients

For radial fills, use `expo-linear-gradient` approximation or consider `react-native-svg` `RadialGradient` for exact match.

```tsx
// SVG radial — when linear approximation fails visual diff
<Svg>
  <Defs>
    <RadialGradient id="g" cx="50%" cy="50%" rx="50%" ry="50%">
      <Stop offset="0%" stopColor="#xxx" />
      <Stop offset="100%" stopColor="#yyy" />
    </RadialGradient>
  </Defs>
  <Rect width="100%" height="100%" fill="url(#g)" />
</Svg>
```
