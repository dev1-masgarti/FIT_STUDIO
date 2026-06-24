import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { CalendarIcon } from '@/components/icons/OnboardingIcons';
import { OnboardingSectionHeader } from '@/components/onboarding/OnboardingSectionHeader';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { OnboardingTextInput } from '@/components/onboarding/OnboardingTextInput';
import { formatDob } from '@/lib/onboarding/metrics';
import { useAuth } from '@/providers/AuthProvider';
import { useOnboarding } from '@/providers/OnboardingProvider';

const defaultDob = new Date(2000, 0, 1);

const StepOneScreen = () => {
  const { profile } = useAuth();
  const { draft, setFullName, setDateOfBirth } = useOnboarding();
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (!draft.fullName && profile?.full_name) {
      setFullName(profile.full_name);
    }
  }, [draft.fullName, profile?.full_name, setFullName]);

  const handleBack = () => {
    router.back();
  };

  const handleOpenPicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: draft.dateOfBirth ?? defaultDob,
        mode: 'date',
        maximumDate: new Date(),
        onChange: (_event, date) => {
          if (date) setDateOfBirth(date);
        },
      });
      return;
    }
    setShowPicker(true);
  };

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'ios' && event.type === 'dismissed') {
      setShowPicker(false);
      return;
    }
    if (date) setDateOfBirth(date);
    if (Platform.OS === 'ios') setShowPicker(false);
  };

  const handleContinue = () => {
    router.push('./step-2');
  };

  const canContinue = draft.fullName.trim().length > 0 && draft.dateOfBirth !== null;

  return (
    <OnboardingShell
      step={1}
      showBack
      onBack={handleBack}
      ctaLabel="Continue"
      onCtaPress={handleContinue}
      ctaDisabled={!canContinue}
    >
      <View style={styles.form}>
        <OnboardingSectionHeader
          step={1}
          showStepLabel
          title="What's your name?"
          description="We'll personalize your experience around you."
        />

        <OnboardingTextInput
          placeholder="Your full name"
          value={draft.fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
          autoComplete="name"
          returnKeyType="next"
        />

        <View style={styles.dobSection}>
          <OnboardingSectionHeader
            step={1}
            title="When were you born?"
            description="Your age helps us calibrate workout intensity."
          />

          <Pressable onPress={handleOpenPicker} accessibilityRole="button">
            <OnboardingTextInput
              placeholder="dd-mm-yyyy"
              value={draft.dateOfBirth ? formatDob(draft.dateOfBirth) : ''}
              editable={false}
              pointerEvents="none"
              leftElement={<CalendarIcon />}
            />
          </Pressable>
        </View>
      </View>

      {showPicker && Platform.OS === 'ios' ? (
        <DateTimePicker
          value={draft.dateOfBirth ?? defaultDob}
          mode="date"
          display="spinner"
          maximumDate={new Date()}
          onChange={handleDateChange}
          themeVariant="dark"
        />
      ) : null}
    </OnboardingShell>
  );
};

export default StepOneScreen;

const styles = StyleSheet.create({
  form: {
    gap: 10,
    width: '100%',
  },
  dobSection: {
    marginTop: 24,
    gap: 10,
    width: '100%',
  },
});
