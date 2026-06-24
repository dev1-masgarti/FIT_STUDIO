import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';
import { ONBOARDING_TOTAL_STEPS } from '@/constants/onboarding';

type OnboardingHeaderProps = {
  step: number;
  title: string;
  description?: string;
};

export const OnboardingHeader = ({ step, title, description }: OnboardingHeaderProps) => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.stepLabel}>
        STEP {step} OF {ONBOARDING_TOTAL_STEPS}
      </Text>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
    width: '100%',
    marginBottom: 24,
  },
  stepLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 19.5,
    letterSpacing: 0.65,
    color: colors.accent,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 42,
    color: colors.white,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 24.375,
    color: colors.muted,
  },
});
