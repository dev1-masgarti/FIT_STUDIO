import type { WorkoutType } from '@fitown/types';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { LogScreenShell } from '@/components/log/LogScreenShell';
import { colors, fonts } from '@/constants/theme';
import { useWorkoutDraft } from '@/providers/WorkoutDraftProvider';

const ExerciseIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 9.5 6 7.5l2 2m8 5 2-2 2 2M8 9.5l8 8M8 17.5l8-8"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CardioIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 13h4l2-3 3 6 2-3h5"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const MixedIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 12h4l2.2-6 3.4 12L16 12h4"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

type WorkoutTypeCardProps = {
  title: string;
  subtitle: string;
  accent: string;
  icon: React.ReactNode;
  onPress: () => void;
};

const WorkoutTypeCard = ({ title, subtitle, accent, icon, onPress }: WorkoutTypeCardProps) => (
  <Pressable style={styles.typeCard} onPress={onPress} accessibilityRole="button" accessibilityLabel={title}>
    <View style={[styles.iconBadge, { backgroundColor: accent }]}>{icon}</View>
    <View style={styles.typeText}>
      <Text style={styles.typeTitle}>{title}</Text>
      <Text style={styles.typeSubtitle}>{subtitle}</Text>
    </View>
    <Text style={styles.chevron}>›</Text>
  </Pressable>
);

const LogEntryScreen = () => {
  const { startDraft } = useWorkoutDraft();
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const handleSelectType = (type: WorkoutType, destination: 'exercise' | 'cardio') => {
    startDraft(type);
    router.push(`/(tabs)/log/${destination}` as never);
  };

  return (
    <LogScreenShell title="New Workout" leftMode="close">
      <Text style={styles.heading}>What are you doing today?</Text>
      <Text style={styles.date}>{today}</Text>

      <View style={styles.cardsWrap}>
        <WorkoutTypeCard
          title="Strength Training"
          subtitle="Weights, machines, bodyweight"
          accent="rgba(27,243,203,0.09)"
          icon={<ExerciseIcon color={colors.accent} />}
          onPress={() => handleSelectType('strength', 'exercise')}
        />
        <WorkoutTypeCard
          title="Cardio"
          subtitle="Running, cycling, swimming, HIIT"
          accent="rgba(255,143,171,0.09)"
          icon={<CardioIcon color="#ff8fab" />}
          onPress={() => handleSelectType('cardio', 'cardio')}
        />
        <WorkoutTypeCard
          title="Mixed Session"
          subtitle="Strength + cardio combined"
          accent="rgba(167,139,250,0.09)"
          icon={<MixedIcon color="#a78bfa" />}
          onPress={() => handleSelectType('mixed', 'exercise')}
        />
      </View>
    </LogScreenShell>
  );
};

export default LogEntryScreen;

const styles = StyleSheet.create({
  heading: {
    marginTop: 16,
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 30,
    color: colors.white,
  },
  date: {
    marginTop: 8,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19.5,
    color: '#555',
  },
  cardsWrap: {
    marginTop: 24,
    gap: 12,
  },
  typeCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1.18,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeText: {
    flex: 1,
    gap: 2,
  },
  typeTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 22.5,
    color: colors.white,
  },
  typeSubtitle: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 18,
    color: '#555',
  },
  chevron: {
    color: '#444',
    fontSize: 22,
    fontFamily: fonts.medium,
  },
});
