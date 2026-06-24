import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CheckmarkIcon } from '@/components/icons/OnboardingIcons';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { colors, fonts, layout } from '@/constants/theme';
import { completeOnboarding } from '@/lib/api/profile';
import {
  ageFromDateOfBirth,
  computeBmi,
  firstNameFromFullName,
  kgToLb,
} from '@/lib/onboarding/metrics';
import { useAuth } from '@/providers/AuthProvider';
import { useOnboarding } from '@/providers/OnboardingProvider';

const toIsoDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseIsoDate = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatGender = (gender: string | null): string => {
  if (gender === 'male') return 'Male';
  if (gender === 'female') return 'Female';
  if (gender === 'other') return 'Other';
  if (gender === 'prefer_not_to_say') return 'Prefer not to say';
  return '—';
};

type SummaryStatProps = {
  label: string;
  value: string;
};

const SummaryStat = ({ label, value }: SummaryStatProps) => (
  <View style={styles.stat}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const CompleteScreen = () => {
  const { session, profile, setProfile } = useAuth();
  const { draft } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolvedFullName = draft.fullName.trim() || profile?.full_name || '';
  const resolvedGender = draft.gender ?? profile?.gender ?? null;
  const resolvedDateOfBirth =
    draft.dateOfBirth ?? parseIsoDate(profile?.date_of_birth ?? null);
  const resolvedHeightCm = draft.heightCm || profile?.height_cm || 170;
  const resolvedWeightKg = draft.weightKg || profile?.body_weight_kg || 70;
  const resolvedGoals = draft.goals.length > 0 ? draft.goals : profile?.focus ?? [];

  const firstName = firstNameFromFullName(resolvedFullName);
  const age = resolvedDateOfBirth ? ageFromDateOfBirth(resolvedDateOfBirth) : profile?.age;
  const bmi = computeBmi(resolvedWeightKg, resolvedHeightCm);
  const weightLabel =
    draft.weightUnit === 'kg'
      ? `${Math.round(resolvedWeightKg)} kg`
      : `${kgToLb(resolvedWeightKg)} lb`;

  const handleGoHome = async () => {
    if (!session?.user.id) {
      setError('Your session expired. Please log in again.');
      return;
    }

    if (!resolvedGender || !resolvedDateOfBirth) {
      setError('Missing profile details. Go back and complete all onboarding steps.');
      return;
    }

    if (!resolvedFullName) {
      setError('Please enter your name before continuing.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nextProfile = await completeOnboarding(session.user.id, {
        full_name: resolvedFullName,
        age: ageFromDateOfBirth(resolvedDateOfBirth),
        date_of_birth: toIsoDate(resolvedDateOfBirth),
        gender: resolvedGender,
        height_cm: resolvedHeightCm,
        body_weight_kg: resolvedWeightKg,
        focus: resolvedGoals,
      });
      setProfile(nextProfile);
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save your profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingShell
      step={5}
      variant="celebration"
      showBack={false}
      showStepBar={false}
      ctaLabel="Go to Home"
      onCtaPress={handleGoHome}
      ctaLoading={loading}
    >
      <View style={styles.content}>
        <View style={styles.successBadgeWrap}>
          <LinearGradient
            colors={['rgba(27,243,203,0.2)', 'rgba(8,172,158,0.08)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.successBadge}
          >
            <CheckmarkIcon size={38} color={colors.accent} />
          </LinearGradient>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.title}>You're all set </Text>
          <Text style={styles.titleAccent}>{firstName}</Text>
          <Text style={styles.title}>!</Text>
        </View>

        <Text style={styles.subtitle}>Here's your profile summary.</Text>

        <View style={styles.card}>
          <View style={styles.statsRow}>
            <SummaryStat label="Age" value={age != null ? `${age} yrs` : '—'} />
            <SummaryStat label="Gender" value={formatGender(resolvedGender)} />
          </View>

          <View style={styles.statsRow}>
            <SummaryStat label="Height" value={`${resolvedHeightCm} cm`} />
            <SummaryStat label="Weight" value={weightLabel} />
          </View>

          <View style={styles.statsRow}>
            <SummaryStat label="BMI" value={String(bmi)} />
            <View style={styles.statPlaceholder} />
          </View>
        </View>

        <View style={styles.taglinePill}>
          <View style={styles.taglineDot} />
          <Text style={styles.taglineText}>Your data. Your body. Your rules.</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </OnboardingShell>
  );
};

export default CompleteScreen;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 24,
    width: '100%',
  },
  successBadgeWrap: {
    marginBottom: 24,
  },
  successBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.6,
    borderColor: 'rgba(27,243,203,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 28,
    lineHeight: 42,
    color: colors.white,
    textAlign: 'center',
  },
  titleAccent: {
    fontFamily: fonts.bold,
    fontSize: 28,
    lineHeight: 42,
    color: colors.accent,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22.5,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 32,
  },
  card: {
    width: layout.contentWidth,
    borderRadius: 24,
    borderWidth: 0.8,
    borderColor: colors.inputBorder,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 20,
    gap: 16,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flex: 1,
    gap: 2,
  },
  statPlaceholder: {
    flex: 1,
  },
  statLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.label,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  statValue: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    lineHeight: 27,
    color: colors.white,
  },
  taglinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(27,243,203,0.08)',
    borderWidth: 0.8,
    borderColor: 'rgba(27,243,203,0.18)',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  taglineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  taglineText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.accent,
  },
  error: {
    marginTop: 16,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: '#ff6b6b',
    textAlign: 'center',
    width: '100%',
  },
});
