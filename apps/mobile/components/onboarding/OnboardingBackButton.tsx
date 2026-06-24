import { Pressable, StyleSheet, Text } from 'react-native';

import { BackChevronIcon } from '@/components/icons/OnboardingIcons';
import { colors, fonts } from '@/constants/theme';

type OnboardingBackButtonProps = {
  onPress: () => void;
};

export const OnboardingBackButton = ({ onPress }: OnboardingBackButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      style={styles.button}
    >
      <BackChevronIcon />
      <Text style={styles.label}>Back</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 32,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 21,
    color: colors.muted,
  },
});
