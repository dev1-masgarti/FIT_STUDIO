import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { colors, fonts } from '@/constants/theme';

export type HistoryFilter = 'all' | 'strength' | 'cardio' | 'mobility' | 'recovery';

const FILTERS: { key: HistoryFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'strength', label: 'Strength' },
  { key: 'cardio', label: 'Cardio' },
  { key: 'mobility', label: 'Mobility' },
  { key: 'recovery', label: 'Recovery' },
];

type FilterChipsProps = {
  value: HistoryFilter;
  onChange: (next: HistoryFilter) => void;
};

export const FilterChips = ({ value, onChange }: FilterChipsProps) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.row}
    accessibilityRole="tablist"
  >
    {FILTERS.map((item) => {
      const active = item.key === value;
      return (
        <Pressable
          key={item.key}
          onPress={() => onChange(item.key)}
          style={[styles.chip, active && styles.chipActive]}
          accessibilityRole="tab"
          accessibilityState={{ selected: active }}
          accessibilityLabel={`Filter by ${item.label}`}
        >
          <Text style={[styles.chipText, active && styles.chipTextActive]}>{item.label}</Text>
        </Pressable>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  row: {
    paddingVertical: 6,
    gap: 6,
  },
  chip: {
    height: 32,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  chipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
  },
  chipTextActive: {
    color: colors.black,
  },
});
