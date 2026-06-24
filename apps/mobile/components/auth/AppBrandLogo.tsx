import { StyleSheet, Text, View } from 'react-native';

import { GradientText } from '@/components/ui/GradientText';
import { APP_BRAND_NAME, BRAND_GRADIENT_FONT_SIZES } from '@/constants/branding';
import { colors, fonts } from '@/constants/theme';

type AppBrandLogoProps = {
  subtitle?: string;
};

export const AppBrandLogo = ({ subtitle }: AppBrandLogoProps) => {
  return (
    <View style={styles.container}>
      <GradientText
        text={APP_BRAND_NAME}
        fontSize={BRAND_GRADIENT_FONT_SIZES.auth}
        fontFamily={fonts.bold}
      />
      {subtitle ? (
        <Text style={styles.subtitle}>{subtitle}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22.5,
    color: colors.muted,
    textAlign: 'center',
  },
});
