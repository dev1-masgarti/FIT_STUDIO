export const colors = {
  background: '#0c0c0c',
  white: '#ffffff',
  black: '#000000',
  accent: '#1bf3cb',
  accentMuted: 'rgba(27,243,203,0.1)',
  accentBorder: 'rgba(27,243,203,0.2)',
  muted: '#666666',
  label: '#999999',
  placeholder: '#555555',
  taglineLight: '#d3d3d3',
  taglineMuted: '#868686',
  inputBg: 'rgba(255,255,255,0.03)',
  inputBgStrong: 'rgba(255,255,255,0.06)',
  inputBorder: 'rgba(255,255,255,0.08)',
  inputBorderStrong: 'rgba(255,255,255,0.15)',
  socialBg: 'rgba(255,255,255,0.06)',
  divider: 'rgba(255,255,255,0.1)',
  homeIndicator: '#252525',
  gradientTeal: '#00533c',
  gradientPink: 'rgba(255,36,90,0.12)',
  gradientTealGlow: 'rgba(27,243,203,0.1)',
  selectedGradientStart: '#00533c',
  selectedGradientEnd: '#ffffff',
} as const;

/** CSS: linear-gradient(60deg, #00533C -12.72%, #FFF 87.67%) */
export const selectedGradient = {
  colors: [colors.selectedGradientStart, colors.selectedGradientEnd] as const,
  locations: [0.13, 0.88] as const,
  start: { x: 0.08, y: 0.95 },
  end: { x: 0.92, y: 0.05 },
} as const;

export const fonts = {
  regular: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semiBold: 'Outfit_600SemiBold',
  bold: 'Outfit_700Bold',
} as const;

export const layout = {
  horizontalPadding: 24,
  contentWidth: 342,
  inputHeight: 54,
  primaryButtonHeight: 56,
  socialButtonHeight: 50,
  borderRadiusInput: 16,
  borderRadiusButton: 28,
  borderRadiusSocial: 14,
  onboardingFrame: {
    borderRadius: 30,
    borderWidth: 10,
    borderColor: '#000000',
    backgroundColor: '#0c0c0c',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
} as const;
