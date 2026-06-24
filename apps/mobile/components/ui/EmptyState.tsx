import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';

type EmptyStateProps = {
  title: string;
  subtitle?: string;
  compact?: boolean;
};

export const EmptyState = ({ title, subtitle, compact }: EmptyStateProps) => (
  <View style={[styles.wrap, compact && styles.compact]}>
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingVertical: 22,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 6,
  },
  compact: {
    paddingVertical: 16,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: '#555555',
    textAlign: 'center',
  },
});
