import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { ONBOARDING_TOTAL_STEPS } from '@/constants/onboarding';

type OnboardingStepBarProps = {
  currentStep: number;
};

export const OnboardingStepBar = ({ currentStep }: OnboardingStepBarProps) => {
  return (
    <View style={styles.row} accessibilityRole="progressbar">
      {Array.from({ length: ONBOARDING_TOTAL_STEPS }, (_, index) => {
        const stepNumber = index + 1;

        if (stepNumber < currentStep) {
          return (
            <LinearGradient
              key={stepNumber}
              colors={['#1bf3cb', '#08ac9e']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.segment}
            />
          );
        }

        if (stepNumber === currentStep) {
          return <View key={stepNumber} style={[styles.segment, styles.segmentCurrent]} />;
        }

        return <View key={stepNumber} style={[styles.segment, styles.segmentInactive]} />;
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    width: '100%',
  },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: 999,
  },
  segmentCurrent: {
    backgroundColor: 'rgba(27,243,203,0.35)',
  },
  segmentInactive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});
