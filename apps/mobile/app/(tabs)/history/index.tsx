import type { WorkoutSession } from '@fitown/types';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FilterChips, type HistoryFilter } from '@/components/history/FilterChips';
import { SessionCard } from '@/components/history/SessionCard';
import { BottomNav } from '@/components/navigation/BottomNav';
import { EmptyState } from '@/components/ui/EmptyState';
import { PinkBlurGlow, TealBlurGlow } from '@/components/ui/BackgroundGlow';
import { colors, fonts, layout } from '@/constants/theme';
import { listWorkoutSessions } from '@/lib/api/workouts';
import { sessionDateBadge, sessionIcon, sessionMetrics } from '@/lib/workouts/format';
import { useAuth } from '@/providers/AuthProvider';

const matchesFilter = (type: WorkoutSession['type'], filter: HistoryFilter): boolean => {
  if (filter === 'all') return true;
  if (filter === 'strength') return type === 'strength' || type === 'mixed';
  if (filter === 'cardio') return type === 'cardio';
  return false;
};

const HistoryScreen = () => {
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const userId = session?.user.id;
      if (!userId) {
        setSessions([]);
        return;
      }
      listWorkoutSessions(userId)
        .then((result) => {
          if (active) setSessions(result);
        })
        .catch(() => {
          if (active) setSessions([]);
        });
      return () => {
        active = false;
      };
    }, [session?.user.id]),
  );

  const visibleSessions = useMemo(
    () => sessions.filter((item) => matchesFilter(item.type, filter)),
    [sessions, filter],
  );

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
        <Text style={styles.title}>History</Text>
        <FilterChips value={filter} onChange={setFilter} />

        {visibleSessions.length === 0 ? (
          <EmptyState
            title="No workouts logged yet"
            subtitle="Sessions you log will appear here with their stats and trends."
          />
        ) : (
          <View style={styles.section}>
            {visibleSessions.map((item) => {
              const icon = sessionIcon(item.type);
              return (
                <SessionCard
                  key={item.id}
                  title={item.title}
                  iconLabel={icon.iconLabel}
                  iconBg={icon.iconBg}
                  badge={sessionDateBadge(item)}
                  metrics={sessionMetrics(item)}
                  showChevron
                  onPress={() => router.push(`/(tabs)/history/${item.id}` as never)}
                />
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={[styles.nav, { bottom: insets.bottom + 45 }]}>
        <BottomNav active="history" />
      </View>
      <View style={[styles.homeIndicatorWrap, { bottom: insets.bottom > 0 ? insets.bottom : 8 }]}>
        <View style={styles.homeIndicator} />
      </View>
    </View>
  );
};

export default HistoryScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  topGlow: {
    position: 'absolute',
    left: 106,
    top: -171,
    width: 597,
    height: 597,
    opacity: 0.45,
  },
  bottomGlow: {
    position: 'absolute',
    left: -228,
    top: 410,
    width: 597,
    height: 597,
    opacity: 0.45,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 38.67,
    lineHeight: 58,
    color: 'rgba(255,255,255,0.42)',
    marginBottom: -2,
  },
  section: {
    gap: 12,
    marginTop: 6,
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
