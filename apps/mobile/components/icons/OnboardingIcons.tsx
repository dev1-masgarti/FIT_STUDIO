import Svg, { Path } from 'react-native-svg';

type IconProps = {
  size?: number;
  color?: string;
};

export const BackChevronIcon = ({ size = 18, color = '#666666' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    <Path
      d="M11.25 3.75L6.75 9l4.5 5.25"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CalendarIcon = ({ size = 20, color = '#1bf3cb' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M6.667 2.5v2.5M13.333 2.5v2.5M3.333 8.333h13.334M4.167 4.167h11.666c.92 0 1.667.746 1.667 1.666v11.667c0 .92-.746 1.667-1.667 1.667H4.167c-.92 0-1.667-.746-1.667-1.667V5.833c0-.92.746-1.666 1.667-1.666z"
      stroke={color}
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ChevronUpIcon = ({ size = 20, color = '#666666' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M5 12.5L10 7.5l5 5"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ChevronDownIcon = ({ size = 20, color = '#666666' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M5 7.5L10 12.5l5-5"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const MaleSymbolIcon = ({ size = 32, color = '#ffffff' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <Path
      d="M20.5 5.5h6v6M26.5 5.5l-7.25 7.25M13.25 25.25a6.75 6.75 0 1 0 0-13.5 6.75 6.75 0 0 0 0 13.5z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const FemaleSymbolIcon = ({ size = 32, color = '#ffffff' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <Path
      d="M16 23.5v4.5M13.2 25.8h5.6M16 20.9a7 7 0 1 0 0-14 7 7 0 0 0 0 14z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const OtherGenderIcon = ({ size = 32, color = '#ffffff' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <Path
      d="M16 12.4a4.1 4.1 0 1 0 0 8.2 4.1 4.1 0 0 0 0-8.2z"
      stroke={color}
      strokeWidth={1.8}
    />
    <Path
      d="M16 7.5v2.3M16 22.2v2.3M22.2 16h2.3M7.5 16h2.3M20.8 11.2l1.6-1.6M9.6 22.4l1.6-1.6M20.8 20.8l1.6 1.6M9.6 9.6l1.6 1.6"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

export const CheckmarkIcon = ({ size = 16, color = '#000000' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <Path
      d="M3.5 8.5l3 3 6-7"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
