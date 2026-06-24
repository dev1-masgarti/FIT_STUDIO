import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackChevronIcon } from '@/components/icons/OnboardingIcons';
import { BottomNav } from '@/components/navigation/BottomNav';
import { YesNoButtons, type YesNoValue } from '@/components/parq/YesNoButtons';
import { PinkBlurGlow, TealBlurGlow } from '@/components/ui/BackgroundGlow';
import { colors, fonts, layout } from '@/constants/theme';
import { goBackOrHome } from '@/lib/navigation';

const QUESTIONS = [
  'Do you have any heart or cardiovascular conditions?',
  'Any recent surgeries or operations in the past year?',
  'Do you experience any breathing difficulties?',
  'Do you have any joint, bone, or muscle issues?',
  'Do you ever feel faint, dizzy, or lose balance?',
  'Are you currently taking any prescribed medications?',
] as const;

export default function HealthFormScreen() {
  const insets = useSafeAreaInsets();
  const [answers, setAnswers] = useState<Record<number, YesNoValue>>({});

  const answeredCount = useMemo(
    () => Object.values(answers).filter((value) => value !== null && value !== undefined).length,
    [answers],
  );
  const allAnswered = answeredCount === QUESTIONS.length;

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
          { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 140 },
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
          <Text style={styles.headerTitle}>Health Form</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(answeredCount / QUESTIONS.length) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {answeredCount} of {QUESTIONS.length} answered
        </Text>

        <Text style={styles.subtitle}>
          This helps your coaches understand your body. You control who sees it — you can revoke
          access anytime.
        </Text>

        {QUESTIONS.map((question, index) => (
          <View key={question} style={styles.questionCard}>
            <Text style={styles.questionText}>{question}</Text>
            <YesNoButtons
              value={answers[index] ?? null}
              onChange={(value) => setAnswers((prev) => ({ ...prev, [index]: value }))}
            />
          </View>
        ))}

        <Pressable
          style={[styles.cta, !allAnswered && styles.ctaDisabled]}
          disabled={!allAnswered}
          accessibilityRole="button"
          accessibilityLabel="Continue health form"
        >
          <Text style={[styles.ctaText, !allAnswered && styles.ctaTextDisabled]}>
            {allAnswered ? 'Continue' : 'Answer all questions to continue'}
          </Text>
        </Pressable>

        <Pressable style={styles.laterAction} accessibilityRole="button" accessibilityLabel="Complete later">
          <Text style={styles.laterActionText}>Complete later →</Text>
        </Pressable>
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
    paddingBottom: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 64,
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
  progressTrack: {
    marginTop: 4,
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
  progressText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16.5,
    color: '#444',
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 21.125,
    color: '#555',
    marginBottom: 2,
  },
  questionCard: {
    borderRadius: 18,
    borderWidth: 0.8,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 16.8,
  },
  questionText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 19.25,
    color: colors.white,
  },
  cta: {
    marginTop: 4,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaDisabled: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 0.8,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  ctaText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 24,
    color: colors.black,
  },
  ctaTextDisabled: {
    color: '#444',
  },
  laterAction: {
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -2,
  },
  laterActionText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 18,
    color: '#333',
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
