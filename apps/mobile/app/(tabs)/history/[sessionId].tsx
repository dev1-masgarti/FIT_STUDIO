import type { WorkoutSession } from '@fitown/types';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { LogScreenShell } from '@/components/log/LogScreenShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors, fonts } from '@/constants/theme';
import { getWorkoutSession } from '@/lib/api/workouts';
import {
  formatDuration,
  sessionDateLong,
  sessionMetrics,
} from '@/lib/workouts/format';
import { useAuth } from '@/providers/AuthProvider';

const SessionDetailScreen = () => {
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const { session: authSession } = useAuth();
  const [loading, setLoading] = useState(true);
  const [workout, setWorkout] = useState<WorkoutSession | null>(null);

  useEffect(() => {
    let active = true;
    const userId = authSession?.user.id;
    if (!userId || !sessionId) {
      setLoading(false);
      return;
    }
    getWorkoutSession(userId, String(sessionId))
      .then((result) => {
        if (active) {
          setWorkout(result);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [authSession?.user.id, sessionId]);

  const title = workout?.title ?? 'Session Detail';

  return (
    <LogScreenShell title={title} activeTab="history" leftMode="back">
      {loading ? (
        <Text style={styles.loading}>Loading…</Text>
      ) : !workout ? (
        <EmptyState
          title="Session not found"
          subtitle="This workout could not be loaded. It may have been removed."
        />
      ) : (
        <View style={styles.body}>
          <Text style={styles.date}>{sessionDateLong(workout)}</Text>

          <View style={styles.summaryRow}>
            {sessionMetrics(workout).map((metric) => (
              <View key={metric.label} style={styles.summaryCell}>
                <Text style={styles.summaryLabel}>{metric.label}</Text>
                <Text style={[styles.summaryValue, metric.accent && styles.summaryAccent]}>
                  {metric.value}
                </Text>
              </View>
            ))}
          </View>

          {workout.cardio ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{workout.cardio.activity}</Text>
              <View style={styles.cardioGrid}>
                <Text style={styles.cardioItem}>
                  Duration: {formatDuration(workout.cardio.duration_sec)}
                </Text>
                <Text style={styles.cardioItem}>
                  Distance: {workout.cardio.distance_km.toFixed(2)} km
                </Text>
                <Text style={styles.cardioItem}>
                  Intensity: {workout.cardio.intensity_pct}%
                </Text>
              </View>
            </View>
          ) : null}

          {workout.exercises.map((exercise) => (
            <View key={exercise.id} style={styles.card}>
              <Text style={styles.cardTitle}>{exercise.name}</Text>
              <Text style={styles.cardSubtitle}>{exercise.muscles}</Text>

              <View style={styles.setHead}>
                <Text style={[styles.setHeadText, styles.colSet]}>SET</Text>
                <Text style={[styles.setHeadText, styles.colVal]}>WEIGHT</Text>
                <Text style={[styles.setHeadText, styles.colVal]}>REPS</Text>
                <Text style={[styles.setHeadText, styles.colVal]}>RPE</Text>
              </View>
              {exercise.sets.map((set, index) => (
                <View key={set.id} style={styles.setRow}>
                  <Text style={[styles.setCell, styles.colSet]}>
                    {String(index + 1).padStart(2, '0')}
                  </Text>
                  <Text style={[styles.setCell, styles.colVal]}>{set.weight_kg} kg</Text>
                  <Text style={[styles.setCell, styles.colVal]}>{set.reps}</Text>
                  <Text style={[styles.setCell, styles.colVal]}>{set.rpe ?? '–'}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}
    </LogScreenShell>
  );
};

export default SessionDetailScreen;

const styles = StyleSheet.create({
  loading: {
    marginTop: 40,
    textAlign: 'center',
    fontFamily: fonts.regular,
    fontSize: 14,
    color: '#666',
  },
  body: {
    marginTop: 8,
    gap: 12,
  },
  date: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: '#777',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
  },
  summaryCell: {
    flex: 1,
    gap: 4,
  },
  summaryLabel: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: '#7e7e7e',
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.white,
  },
  summaryAccent: {
    color: colors.accent,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 14,
    gap: 4,
  },
  cardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.white,
  },
  cardSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  cardioGrid: {
    gap: 4,
    marginTop: 4,
  },
  cardioItem: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: '#cfcfcf',
  },
  setHead: {
    flexDirection: 'row',
    marginTop: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  setHeadText: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: '#919191',
  },
  colSet: { width: 50 },
  colVal: { flex: 1, textAlign: 'center' as const },
  setRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  setCell: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: '#e5e2e1',
  },
});
