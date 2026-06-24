import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { buildRange, DrumPicker } from '@/components/onboarding/DrumPicker';
import { OnboardingSectionHeader } from '@/components/onboarding/OnboardingSectionHeader';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { UnitToggle } from '@/components/onboarding/UnitToggle';
import { colors, fonts } from '@/constants/theme';
import { cmToFeetInches, feetInchesToCm } from '@/lib/onboarding/metrics';
import { useOnboarding } from '@/providers/OnboardingProvider';

const CM_VALUES = buildRange(100, 250);
const FT_VALUES = buildRange(3, 8);
const IN_VALUES = buildRange(0, 11);

const StepThreeScreen = () => {
  const { draft, setHeightCm, setHeightUnit } = useOnboarding();
  const { feet, inches } = cmToFeetInches(draft.heightCm);

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    router.push('./step-4');
  };

  const handleFeetChange = (nextFeet: number) => {
    setHeightCm(feetInchesToCm(nextFeet, inches));
  };

  const handleInchesChange = (nextInches: number) => {
    setHeightCm(feetInchesToCm(feet, nextInches));
  };

  return (
    <OnboardingShell step={3} onBack={handleBack} ctaLabel="Continue" onCtaPress={handleContinue}>
      <OnboardingSectionHeader
        step={3}
        showStepLabel
        title="What's your height?"
        description="Used to calculate BMI and personalize your workout intensity."
      />

      <View style={styles.toggleWrap}>
        <UnitToggle
          options={[
            { value: 'cm' as const, label: 'cm', width: 66 },
            { value: 'ft' as const, label: 'ft / in' },
          ]}
          value={draft.heightUnit}
          onChange={setHeightUnit}
        />
      </View>

      <View style={styles.pickerCard}>
        {draft.heightUnit === 'cm' ? (
          <DrumPicker
            values={CM_VALUES}
            value={draft.heightCm}
            onChange={setHeightCm}
            suffix="cm"
            width={56}
          />
        ) : (
          <View style={styles.dualPicker}>
            <DrumPicker
              values={FT_VALUES}
              value={feet}
              onChange={handleFeetChange}
              suffix="ft"
              width={44}
            />
            <Text style={styles.separator}>·</Text>
            <DrumPicker
              values={IN_VALUES}
              value={inches}
              onChange={handleInchesChange}
              suffix="in"
              width={44}
            />
          </View>
        )}
      </View>
    </OnboardingShell>
  );
};

export default StepThreeScreen;

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
  dualPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  separator: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    color: colors.muted,
    marginTop: 24,
  },
});
