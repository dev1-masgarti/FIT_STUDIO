import type { GenderType } from '@fitown/types';
import { router } from 'expo-router';

import {
  FemaleSymbolIcon,
  MaleSymbolIcon,
  OtherGenderIcon,
} from '@/components/icons/OnboardingIcons';
import { GenderCard, GenderRow } from '@/components/onboarding/GenderCard';
import { OnboardingSectionHeader } from '@/components/onboarding/OnboardingSectionHeader';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { colors } from '@/constants/theme';
import { useOnboarding } from '@/providers/OnboardingProvider';
import { StyleSheet, View } from 'react-native';

const iconColor = (selected: boolean) => (selected ? colors.black : colors.muted);

const StepTwoScreen = () => {
  const { draft, setGender } = useOnboarding();

  const handleSelect = (gender: GenderType) => {
    setGender(gender);
  };

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    router.push('./step-3');
  };

  return (
    <OnboardingShell
      step={2}
      onBack={handleBack}
      ctaLabel="Continue"
      onCtaPress={handleContinue}
      ctaDisabled={!draft.gender}
    >
      <OnboardingSectionHeader
        step={2}
        showStepLabel
        title="How do you identify?"
        description="Used to refine body composition metrics."
      />

      <View style={styles.cardsWrap}>
        <GenderRow>
          <GenderCard
            label="Male"
            icon={<MaleSymbolIcon color={iconColor(draft.gender === 'male')} />}
            selected={draft.gender === 'male'}
            onPress={() => handleSelect('male')}
          />
          <GenderCard
            label="Female"
            icon={<FemaleSymbolIcon color={iconColor(draft.gender === 'female')} />}
            selected={draft.gender === 'female'}
            onPress={() => handleSelect('female')}
          />
        </GenderRow>

        <GenderCard
          label="Other"
          icon={<OtherGenderIcon color={iconColor(draft.gender === 'other')} />}
          selected={draft.gender === 'other'}
          onPress={() => handleSelect('other')}
          fullWidth
        />
      </View>
    </OnboardingShell>
  );
};

export default StepTwoScreen;

const styles = StyleSheet.create({
  cardsWrap: {
    gap: 12,
    width: '100%',
  },
});
