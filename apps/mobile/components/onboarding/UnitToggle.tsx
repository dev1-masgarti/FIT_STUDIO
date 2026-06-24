import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';

type UnitToggleOption<T extends string> = {
  value: T;
  label: string;
  width?: number;
};

type UnitToggleProps<T extends string> = {
  options: UnitToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export const UnitToggle = <T extends string>({
  options,
  value,
  onChange,
}: UnitToggleProps<T>) => {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = option.value === value;

        if (isSelected) {
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected: true }}
              style={[styles.option, styles.selectedOption, option.width ? { width: option.width } : undefined]}
            >
              <Text style={styles.selectedLabel}>{option.label}</Text>
            </Pressable>
          );
        }

        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: false }}
            style={[styles.option, styles.unselectedOption, option.width ? { minWidth: option.width } : undefined]}
          >
            <Text style={styles.unselectedLabel}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBgStrong,
    borderWidth: 0.8,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    padding: 4.8,
    alignSelf: 'center',
  },
  option: {
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  selectedOption: {
    borderWidth: 0.8,
    borderColor: colors.inputBorderStrong,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  selectedLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.white,
  },
  unselectedOption: {
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  unselectedLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.muted,
    textAlign: 'center',
  },
});
