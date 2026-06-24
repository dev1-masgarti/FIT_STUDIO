import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { buildRange, DrumPicker } from '@/components/onboarding/DrumPicker';
import { OnboardingSectionHeader } from '@/components/onboarding/OnboardingSectionHeader';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { UnitToggle } from '@/components/onboarding/UnitToggle';
import { kgToLb, lbToKg } from '@/lib/onboarding/metrics';
import { useOnboarding } from '@/providers/OnboardingProvider';

const KG_VALUES = buildRange(30, 200);
const LB_VALUES = buildRange(66, 440);

const StepFourScreen = () => {
  const { draft, setWeightKg, setWeightUnit } = useOnboarding();

  const displayValues = useMemo(
    () => (draft.weightUnit === 'kg' ? KG_VALUES : LB_VALUES),
    [draft.weightUnit],
  );

  const displayValue = useMemo(() => {
    if (draft.weightUnit === 'kg') return Math.round(draft.weightKg);
    return kgToLb(draft.weightKg);
  }, [draft.weightKg, draft.weightUnit]);

  const handleDisplayChange = (value: number) => {
    if (draft.weightUnit === 'kg') {
      setWeightKg(value);
      return;
    }
    setWeightKg(lbToKg(value));
  };

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    router.push('./step-5');
  };

  return (
    <OnboardingShell step={4} onBack={handleBack} ctaLabel="Continue" onCtaPress={handleContinue}>
      <OnboardingSectionHeader
        step={4}
        showStepLabel
        title="What's your weight?"
        description="We'll track your progress and set realistic targets."
      />

      <View style={styles.toggleWrap}>
        <UnitToggle
          options={[
            { value: 'kg' as const, label: 'kg', width: 79 },
            { value: 'lb' as const, label: 'lb' },
          ]}
          value={draft.weightUnit}
          onChange={setWeightUnit}
        />
      </View>

      <View style={styles.pickerCard}>
        <DrumPicker
          values={displayValues}
          value={displayValue}
          onChange={handleDisplayChange}
          suffix={draft.weightUnit}
          width={56}
        />
      </View>
    </OnboardingShell>
  );
};

export default StepFourScreen;

const styles = StyleSheet.create({
  toggleWrap: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  pickerCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 0.8,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 16.8,
    paddingVertical: 8.8,
    alignItems: 'center',
  },
});
