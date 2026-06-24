import Svg, { Defs, Ellipse, FeGaussianBlur, Filter, G } from 'react-native-svg';

const PRIMARY_WIDTH = 1357;
const PRIMARY_HEIGHT = 700;

/** Figma Ellipse 283 — rgba(8,172,158,0.08) + blur 52.4px */
export const TealBlurGlow = () => (
  <Svg
    width={PRIMARY_WIDTH}
    height={PRIMARY_HEIGHT}
    viewBox="0 0 1566.6 909.6"
    pointerEvents="none"
  >
    <Defs>
      <Filter
        id="fitownTealBlur"
        x="0"
        y="0"
        width="1566.6"
        height="909.6"
        filterUnits="userSpaceOnUse"
      >
        <FeGaussianBlur stdDeviation={52.4} />
      </Filter>
    </Defs>
    <G filter="url(#fitownTealBlur)">
      <Ellipse cx={783.3} cy={454.8} rx={678.5} ry={350} fill="#08AC9E" fillOpacity={0.08} />
    </G>
  </Svg>
);

const SECONDARY_WIDTH = 587;
const SECONDARY_HEIGHT = 700;

/** Figma Ellipse 282 — accent pink ambient glow */
export const PinkBlurGlow = () => (
  <Svg
    width={SECONDARY_WIDTH}
    height={SECONDARY_HEIGHT}
    viewBox="0 0 1566.6 909.6"
    pointerEvents="none"
  >
    <Defs>
      <Filter
        id="fitownPinkBlur"
        x="0"
        y="0"
        width="1566.6"
        height="909.6"
        filterUnits="userSpaceOnUse"
      >
        <FeGaussianBlur stdDeviation={52.4} />
      </Filter>
    </Defs>
    <G filter="url(#fitownPinkBlur)">
      <Ellipse cx={783.3} cy={454.8} rx={293.5} ry={350} fill="#FF245A" fillOpacity={0.12} />
    </G>
  </Svg>
);

export const BackgroundGlow = () => (
  <>
    <TealBlurGlow />
    <PinkBlurGlow />
  </>
);
