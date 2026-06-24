import type { WorkoutSession } from '@fitown/types';

import type { SessionMetric } from '@/components/history/SessionCard';

export const sessionIcon = (
  type: WorkoutSession['type'],
): { iconLabel: string; iconBg: string } => {
  switch (type) {
    case 'cardio':
      return { iconLabel: '🏃', iconBg: 'rgba(255,143,171,0.12)' };
    case 'mixed':
      return { iconLabel: '🔀', iconBg: 'rgba(167,139,250,0.12)' };
    case 'strength':
    default:
      return { iconLabel: '🏋️', iconBg: 'rgba(27,243,203,0.12)' };
  }
};

export const formatDuration = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remMinutes = minutes % 60;
    return `${hours}h ${remMinutes}m`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

export const totalVolumeKg = (session: WorkoutSession): number =>
  session.exercises.reduce(
    (sum, exercise) =>
      sum +
      exercise.sets.reduce((setSum, set) => setSum + set.weight_kg * set.reps, 0),
    0,
  );

export const totalSets = (session: WorkoutSession): number =>
  session.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);

export const sessionMetrics = (session: WorkoutSession): SessionMetric[] => {
  if (session.type === 'cardio' && session.cardio) {
    const { duration_sec, distance_km, intensity_pct } = session.cardio;
    return [
      { label: 'Duration', value: formatDuration(duration_sec), accent: true },
      { label: 'Distance', value: `${distance_km.toFixed(2)} km` },
      { label: 'Intensity', value: `${intensity_pct}%` },
    ];
  }

  return [
    { label: 'Volume', value: `${Math.round(totalVolumeKg(session))} kg`, accent: true },
    { label: 'Sets', value: String(totalSets(session)) },
    { label: 'Exercises', value: String(session.exercises.length) },
  ];
};

export const sessionDateBadge = (session: WorkoutSession): string =>
  new Date(session.performed_at)
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    .toUpperCase();

export const sessionDateLong = (session: WorkoutSession): string =>
  new Date(session.performed_at).toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
