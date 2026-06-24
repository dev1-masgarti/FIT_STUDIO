import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors, fonts } from '@/constants/theme';

export type SessionMetric = {
  label: string;
  value: string;
  accent?: boolean;
};

type SessionCardProps = {
  title: string;
  iconLabel: string;
  iconBg: string;
  badge?: string;
  metrics: SessionMetric[];
  reducedOpacity?: boolean;
  showChevron?: boolean;
  onPress?: () => void;
};

const Chevron = () => (
  <Svg width={10} height={10} viewBox="0 0 10 10" fill="none">
    <Path
      d="M3 1.5 6.5 5 3 8.5"
      stroke={colors.accent}
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const SessionCard = ({
  title,
  iconLabel,
  iconBg,
  badge,
  metrics,
  reducedOpacity = false,
  showChevron = false,
  onPress,
}: SessionCardProps) => (
  <Pressable
    style={[styles.card, reducedOpacity && styles.cardDim]}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`Open ${title} session details`}
  >
    <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
      <Text style={styles.iconLabel}>{iconLabel}</Text>
    </View>

    <View style={styles.content}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.metricRow}>
        {metrics.map((metric) => (
          <View key={`${metric.label}-${metric.value}`} style={styles.metricCell}>
            <Text style={styles.metricLabel}>{metric.label}</Text>
            <Text style={[styles.metricValue, metric.accent && styles.metricValueAccent]}>
              {metric.value}
            </Text>
          </View>
        ))}
      </View>
    </View>

    {showChevron ? (
      <View style={styles.chevronWrap}>
        <Chevron />
      </View>
    ) : null}
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(14,14,14,0.6)',
    padding: 17,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  cardDim: {
    opacity: 0.7,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLabel: {
    fontSize: 20,
    lineHeight: 22,
  },
  content: {
    flex: 1,
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: fonts.regular,
    fontSize: 24 * 0.75,
    lineHeight: 28,
    color: colors.white,
    flexShrink: 1,
  },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(0,105,86,0.1)',
  },
  badgeText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 12,
    color: colors.accent,
    textTransform: 'uppercase',
  },
  metricRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metricCell: {
    gap: 0,
  },
  metricLabel: {
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 13.5,
    color: '#7e7e7e',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: '#e5e2e1',
  },
  metricValueAccent: {
    color: colors.accent,
  },
  chevronWrap: {
    marginLeft: 4,
  },
});
