import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';

type ChipSelectorProps<T extends string> = {
  label: string;
  options: readonly T[] | { label: string; value: T }[];
  selected: T | T[];
  onChange: (value: T | T[]) => void;
  multiple?: boolean;
};

export const ChipSelector = <T extends string>({
  label,
  options,
  selected,
  onChange,
  multiple = false,
}: ChipSelectorProps<T>) => {
  const normalized = options.map((option) =>
    typeof option === 'string' ? { label: option, value: option } : option,
  );

  const isSelected = (value: T) => {
    if (multiple && Array.isArray(selected)) {
      return selected.includes(value);
    }
    return selected === value;
  };

  const handlePress = (value: T) => {
    if (multiple && Array.isArray(selected)) {
      if (selected.includes(value)) {
        onChange(selected.filter((item) => item !== value));
      } else {
        onChange([...selected, value]);
      }
      return;
    }
    onChange(value);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {normalized.map((option) => {
          const active = isSelected(option.value);
          return (
            <Pressable
              key={option.value}
              onPress={() => handlePress(option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={option.label}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
    width: '100%',
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.white,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 0.8,
    borderColor: colors.inputBorderStrong,
    backgroundColor: colors.socialBg,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentMuted,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.muted,
  },
  chipTextActive: {
    color: colors.accent,
  },
});
