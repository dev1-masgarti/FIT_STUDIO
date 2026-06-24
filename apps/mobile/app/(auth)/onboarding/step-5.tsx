import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { GoalChip } from '@/components/onboarding/GoalChip';
import { OnboardingSectionHeader } from '@/components/onboarding/OnboardingSectionHeader';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { FITNESS_GOALS, type FitnessGoal } from '@/constants/onboarding';
import { layout } from '@/constants/theme';
import { useOnboarding } from '@/providers/OnboardingProvider';

const GOAL_WIDTHS: Record<FitnessGoal, number> = {
  'Build Muscle': 130,
  'Gain Strength': 150,
  'Improve Endurance': 176,
  'Lose Fat': 104,
  'Increase Flexibility & Mobility': 251,
  'Maintain Shape': 140,
  'General Health': 160,
  'Rehab / Recovery': 160,
  Other: 90,
};

const GOAL_ROWS: FitnessGoal[][] = [
  ['Build Muscle', 'Gain Strength'],
  ['Improve Endurance', 'Lose Fat'],
  ['Increase Flexibility & Mobility'],
  ['Maintain Shape', 'General Health'],
  ['Rehab / Recovery', 'Other'],
];

const StepFiveScreen = () => {
  const { draft, toggleGoal } = useOnboarding();

  const handleBack = () => {
    router.back();
  };

  const handleFinish = () => {
    router.push('./complete');
  };

  return (
    <OnboardingShell
      step={5}
      onBack={handleBack}
      ctaLabel="Finish Setup"
      onCtaPress={handleFinish}
      ctaDisabled={draft.goals.length === 0}
    >
      <OnboardingSectionHeader
        step={5}
        showStepLabel
        title="Your Fitness Goal"
        description="Choose the focus that best matches your training journey"
      />

      <View style={styles.chips}>
        {GOAL_ROWS.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.row}>
            {row.map((goal) => (
              <GoalChip
                key={goal}
                label={goal}
                selected={draft.goals.includes(goal)}
                onPress={() => toggleGoal(goal)}
                width={GOAL_WIDTHS[goal]}
              />
            ))}
          </View>
        ))}
      </View>
    </OnboardingShell>
  );
};

export default StepFiveScreen;

const styles = StyleSheet.create({
  chips: {
    width: layout.contentWidth,
    gap: 14.7,
    alignSelf: 'center',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14.7,
  },
});
