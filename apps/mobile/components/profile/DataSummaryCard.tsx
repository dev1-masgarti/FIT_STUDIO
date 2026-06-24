import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';

type SummaryItem = {
  label: string;
  value: string;
};

type DataSummaryCardProps = {
  items: SummaryItem[];
};

export const DataSummaryCard = ({ items }: DataSummaryCardProps) => (
  <View style={styles.card}>
    {items.map((item, index) => (
      <View key={item.label} style={[styles.cell, index > 0 && styles.cellBorder]}>
        <Text style={styles.value}>{item.value}</Text>
        <Text style={styles.label}>{item.label}</Text>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 0.8,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 2,
  },
  cellBorder: {
    borderLeftWidth: 0.8,
    borderLeftColor: 'rgba(255,255,255,0.06)',
  },
  value: {
    fontFamily: fonts.semiBold,
    fontSize: 32 * 0.75,
    lineHeight: 28,
    color: colors.white,
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 12,
    color: '#666',
    textTransform: 'uppercase',
  },
});
