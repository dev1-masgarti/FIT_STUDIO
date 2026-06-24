import { Pressable, StyleSheet, Text } from 'react-native';

import { SelectedGradientSurface } from '@/components/ui/SelectedGradientSurface';
import { colors, fonts } from '@/constants/theme';

type GoalChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  width?: number;
};

export const GoalChip = ({ label, selected, onPress, width }: GoalChipProps) => {
  if (selected) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ selected: true }}
        style={[styles.chipSelectedWrap, width ? { width } : undefined]}
      >
        <SelectedGradientSurface borderRadius={12} style={styles.chipSelected}>
          <Text style={styles.chipSelectedLabel}>{label}</Text>
        </SelectedGradientSurface>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: false }}
      style={[styles.chip, width ? { width } : undefined]}
    >
      <Text style={styles.chipLabel}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderRadius: 14.7,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: 'rgba(255,255,255,0.06)',
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14.7,
    paddingVertical: 6,
  },
  chipLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 24,
    color: colors.muted,
    textAlign: 'center',
  },
  chipSelectedWrap: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  chipSelected: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14.7,
    paddingVertical: 6,
  },
  chipSelectedLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 24,
    color: colors.black,
    textAlign: 'center',
  },
});
