import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Path, Polyline, Stop } from 'react-native-svg';

import { BackChevronIcon } from '@/components/icons/OnboardingIcons';
import { BottomNav } from '@/components/navigation/BottomNav';
import { EmptyState } from '@/components/ui/EmptyState';
import { PinkBlurGlow, TealBlurGlow } from '@/components/ui/BackgroundGlow';
import { colors, fonts, layout } from '@/constants/theme';
import { goBackOrHome } from '@/lib/navigation';
import { useAuth } from '@/providers/AuthProvider';

type WeightEntry = {
  date: string;
  kg: number;
};

const nextDateLabel = (): string => {
  const now = new Date();
  return now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function BodyMeasurementsScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const [currentInput, setCurrentInput] = useState(profile?.body_weight_kg ?? 70);
  const [history, setHistory] = useState<WeightEntry[]>([]);

  const hasHistory = history.length > 0;
  const currentWeight = history[0]?.kg ?? null;
  const previousWeight = history[1]?.kg ?? null;
  const delta =
    currentWeight != null && previousWeight != null
      ? Number((currentWeight - previousWeight).toFixed(1))
      : null;
  const deltaLabel = delta != null ? `${delta > 0 ? '+' : ''}${delta} kg` : null;

  const chartPoints = useMemo(() => {
    if (history.length === 0) return [] as string[];
    const points = [...history].reverse();
    const min = Math.min(...points.map((item) => item.kg));
    const max = Math.max(...points.map((item) => item.kg));
    const range = max - min || 1;
    return points.map((item, index) => {
      const x = (index / (points.length - 1 || 1)) * 300;
      const y = 46 - ((item.kg - min) / range) * 38;
      return `${x},${y}`;
    });
  }, [history]);

  const handleLogWeight = () => {
    const entry: WeightEntry = {
      date: nextDateLabel(),
      kg: Number(currentInput.toFixed(1)),
    };
    setHistory((prev) => [entry, ...prev]);
  };

  return (
    <View style={[styles.root, layout.onboardingFrame]}>
      <View style={styles.topGlow} pointerEvents="none">
        <PinkBlurGlow />
      </View>
      <View style={styles.bottomGlow} pointerEvents="none">
        <TealBlurGlow />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 120 },
        ]}
      >
        <View style={styles.header}>
          <Pressable
            onPress={goBackOrHome}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <BackChevronIcon color="#666" />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Body Measurements</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.currentCard}>
          <View style={styles.currentRow}>
            <View>
              <Text style={styles.currentLabel}>CURRENT WEIGHT</Text>
              <Text style={styles.currentValue}>
                {currentWeight != null ? currentWeight.toFixed(1) : '—'}
                <Text style={styles.currentUnit}>kg</Text>
              </Text>
            </View>
            {deltaLabel ? (
              <View style={styles.deltaPill}>
                <Text style={styles.deltaText}>{deltaLabel}</Text>
              </View>
            ) : null}
          </View>

          {chartPoints.length >= 2 ? (
            <View style={styles.chartWrap}>
              <Svg width={300} height={54} viewBox="0 0 300 54">
                <Defs>
                  <SvgLinearGradient id="weightArea" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#1bf3cb" stopOpacity="0.2" />
                    <Stop offset="100%" stopColor="#1bf3cb" stopOpacity="0" />
                  </SvgLinearGradient>
                </Defs>
                <Path
                  d={`M ${chartPoints[0] ?? '0,40'} L ${chartPoints.join(' L ')} L 300,54 L 0,54 Z`}
                  fill="url(#weightArea)"
                />
                <Polyline
                  points={chartPoints.join(' ')}
                  fill="none"
                  stroke={colors.accent}
                  strokeWidth={2}
                />
              </Svg>
              <View style={styles.chartTicks}>
                {[...history].reverse().map((item, index) => (
                  <Text key={`${item.date}-${index}`} style={styles.tickText}>
                    {item.date}
                  </Text>
                ))}
              </View>
            </View>
          ) : (
            <Text style={styles.chartHint}>Log your weight over time to see your trend.</Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>Log today's weight</Text>
        <View style={styles.numberWrap}>
          <Pressable
            style={styles.stepperBtn}
            onPress={() => setCurrentInput((prev) => Math.max(20, Number((prev - 0.1).toFixed(1))))}
            accessibilityRole="button"
            accessibilityLabel="Decrease weight input"
          >
            <Text style={styles.stepperText}>−</Text>
          </Pressable>
          <Text style={styles.numberValue}>{currentInput.toFixed(1)}</Text>
          <Text style={styles.kg}>kg</Text>
          <Pressable
            style={styles.stepperBtn}
            onPress={() => setCurrentInput((prev) => Math.min(300, Number((prev + 0.1).toFixed(1))))}
            accessibilityRole="button"
            accessibilityLabel="Increase weight input"
          >
            <Text style={styles.stepperText}>+</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.logButton}
          onPress={handleLogWeight}
          accessibilityRole="button"
          accessibilityLabel="Log weight"
        >
          <Text style={styles.logButtonText}>Log Weight</Text>
        </Pressable>

        <Text style={styles.historyLabel}>HISTORY</Text>
        {hasHistory ? (
          <View style={styles.historyCard}>
            {history.map((entry, index) => (
              <View key={`${entry.date}-${index}`} style={[styles.historyRow, index > 0 && styles.historyBorder]}>
                <Text style={styles.historyDate}>{entry.date}</Text>
                <Text style={styles.historyValue}>{entry.kg.toFixed(1)} kg</Text>
              </View>
            ))}
          </View>
        ) : (
          <EmptyState compact title="No entries yet" subtitle="Log your weight to start tracking." />
        )}
      </ScrollView>

      <View style={[styles.nav, { bottom: insets.bottom + 45 }]}>
        <BottomNav active="profile" />
      </View>
      <View style={[styles.homeIndicatorWrap, { bottom: insets.bottom > 0 ? insets.bottom : 8 }]}>
        <View style={styles.homeIndicator} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  topGlow: {
    position: 'absolute',
    left: 110,
    top: -100,
    width: 400,
    height: 400,
    opacity: 0.5,
  },
  bottomGlow: {
    position: 'absolute',
    left: -100,
    top: 424,
    width: 360,
    height: 360,
    opacity: 0.45,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 6,
  },
  backButton: {
    width: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 21,
    color: colors.muted,
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 24,
    color: colors.white,
  },
  currentCard: {
    borderRadius: 20,
    borderWidth: 0.8,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 16.8,
    gap: 8,
  },
  currentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  currentLabel: {
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 1,
    color: '#555',
    textTransform: 'uppercase',
  },
  currentValue: {
    fontFamily: fonts.bold,
    fontSize: 28,
    lineHeight: 42,
    color: colors.white,
  },
  currentUnit: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: '#555',
  },
  deltaPill: {
    height: 30,
    borderRadius: 999,
    backgroundColor: 'rgba(27,243,203,0.1)',
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  deltaText: {
    fontFamily: fonts.semiBold,
    fontSize: 16 * 0.69,
    lineHeight: 16.5,
    color: colors.accent,
  },
  chartWrap: {
    marginTop: 2,
    alignItems: 'center',
  },
  chartHint: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: '#555',
  },
  chartTicks: {
    width: 300,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -2,
  },
  tickText: {
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 12,
    color: '#444',
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    lineHeight: 18,
    color: colors.white,
    marginTop: 2,
  },
  numberWrap: {
    height: 54,
    borderRadius: 16,
    borderWidth: 0.8,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16.8,
  },
  stepperBtn: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    color: '#666',
    fontSize: 24,
    lineHeight: 24,
    fontFamily: fonts.regular,
  },
  numberValue: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 30,
    color: colors.white,
  },
  kg: {
    color: '#555',
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19.5,
    marginRight: 12,
  },
  logButton: {
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 22.5,
    color: colors.black,
  },
  historyLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 1,
    color: '#444',
    marginTop: 8,
  },
  historyCard: {
    borderRadius: 18,
    borderWidth: 0.8,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 16.8,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  historyBorder: {
    borderTopWidth: 0.8,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  historyDate: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.white,
  },
  historyValue: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 22.5,
    color: colors.white,
  },
  nav: {
    position: 'absolute',
    left: 8,
    right: 8,
  },
  homeIndicatorWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  homeIndicator: {
    width: 134,
    height: 5,
    borderRadius: 100,
    backgroundColor: colors.white,
  },
});
