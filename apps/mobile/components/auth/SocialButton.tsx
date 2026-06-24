import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { AppleIcon, GoogleIcon } from '@/components/icons/SocialIcons';
import { colors, fonts, layout } from '@/constants/theme';

type SocialProvider = 'google' | 'apple';

type SocialButtonProps = {
  provider: SocialProvider;
  onPress: () => void;
  style?: ViewStyle;
};

const icons: Record<SocialProvider, ReactNode> = {
  google: <GoogleIcon size={18} />,
  apple: <AppleIcon size={18} />,
};

const labels: Record<SocialProvider, string> = {
  google: 'Google',
  apple: 'Apple',
};

export const SocialButton = ({ provider, onPress, style }: SocialButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Continue with ${labels[provider]}`}
      style={[styles.button, style]}
    >
      {icons[provider]}
      <Text style={styles.label}>{labels[provider]}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    height: layout.socialButtonHeight,
    borderRadius: layout.borderRadiusSocial,
    borderWidth: 0.8,
    borderColor: colors.inputBorder,
    backgroundColor: colors.socialBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 21,
    color: colors.white,
  },
});
