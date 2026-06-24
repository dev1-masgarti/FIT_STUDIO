import type { GenderType } from '@fitown/types';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackChevronIcon } from '@/components/icons/OnboardingIcons';
import { BottomNav } from '@/components/navigation/BottomNav';
import { PinkBlurGlow, TealBlurGlow } from '@/components/ui/BackgroundGlow';
import { colors, fonts, layout } from '@/constants/theme';
import { updatePersonalDetails } from '@/lib/api/profile';
import { goBackOrHome } from '@/lib/navigation';
import { useAuth } from '@/providers/AuthProvider';

const GENDER_OPTIONS: { label: string; value: GenderType }[] = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Non-binary', value: 'other' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' },
];

const toDateInput = (iso: string | null | undefined): string => {
  if (!iso) return '';
  return iso.slice(0, 10);
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export default function PersonalDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { profile, setProfile } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(toDateInput(profile?.date_of_birth));
  const [gender, setGender] = useState<GenderType>((profile?.gender as GenderType) ?? 'male');
  const [height, setHeight] = useState<number>(profile?.height_cm ?? 170);
  const [weight, setWeight] = useState<number>(profile?.body_weight_kg ?? 65);
  const [saving, setSaving] = useState(false);

  const canSave = useMemo(() => fullName.trim().length > 0, [fullName]);

  const handleSave = async () => {
    if (!profile?.id || !canSave || saving) return;
    setSaving(true);
    try {
      const next = await updatePersonalDetails(profile.id, {
        full_name: fullName.trim(),
        date_of_birth: dateOfBirth.trim() ? dateOfBirth.trim() : null,
        gender,
        height_cm: height,
        body_weight_kg: weight,
      });
      setProfile(next);
      goBackOrHome();
    } catch (error) {
      console.warn('[profile] save personal details failed', error);
    } finally {
      setSaving(false);
    }
  };

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
          { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 120 },
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
          <Text style={styles.headerTitle}>Personal Details</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputWrap}>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              style={styles.textInput}
              placeholder="Alex"
              placeholderTextColor="#777"
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Date of Birth</Text>
          <View style={styles.inputWrap}>
            <TextInput
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              style={styles.textInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#444"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderGrid}>
            {GENDER_OPTIONS.map((item) => {
              const active = item.value === gender;
              return (
                <Pressable
                  key={item.value}
                  onPress={() => setGender(item.value)}
                  style={[styles.genderChip, active && styles.genderChipActive]}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${item.label}`}
                >
                  <Text style={[styles.genderChipText, active && styles.genderChipTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Height (cm)</Text>
          <View style={styles.numberWrap}>
            <Pressable
              style={styles.stepperBtn}
              onPress={() => setHeight((prev) => clamp(prev - 1, 100, 260))}
              accessibilityRole="button"
              accessibilityLabel="Decrease height"
            >
              <Text style={styles.stepperText}>−</Text>
            </Pressable>
            <Text style={styles.numberValue}>{height}</Text>
            <Pressable
              style={styles.stepperBtn}
              onPress={() => setHeight((prev) => clamp(prev + 1, 100, 260))}
              accessibilityRole="button"
              accessibilityLabel="Increase height"
            >
              <Text style={styles.stepperText}>+</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Weight (kg)</Text>
          <View style={styles.numberWrap}>
            <Pressable
              style={styles.stepperBtn}
              onPress={() => setWeight((prev) => clamp(prev - 1, 25, 320))}
              accessibilityRole="button"
              accessibilityLabel="Decrease weight"
            >
              <Text style={styles.stepperText}>−</Text>
            </Pressable>
            <Text style={styles.numberValue}>{weight}</Text>
            <Pressable
              style={styles.stepperBtn}
              onPress={() => setWeight((prev) => clamp(prev + 1, 25, 320))}
              accessibilityRole="button"
              accessibilityLabel="Increase weight"
            >
              <Text style={styles.stepperText}>+</Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          style={[styles.saveButton, (!canSave || saving) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!canSave || saving}
          accessibilityRole="button"
          accessibilityLabel="Save personal details"
        >
          <Text style={[styles.saveButtonText, (!canSave || saving) && styles.saveButtonTextDisabled]}>
            {saving ? 'Saving…' : 'Save Changes'}
          </Text>
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
    paddingBottom: 6,
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
  field: {
    gap: 6,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 19.5,
    color: '#999',
  },
  inputWrap: {
    height: 54,
    borderRadius: 16,
    borderWidth: 0.8,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    paddingHorizontal: 16.8,
  },
  textInput: {
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22.5,
  },
  genderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genderChip: {
    width: '48%',
    height: 44,
    borderRadius: 12,
    borderWidth: 0.8,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderChipActive: {
    borderColor: 'rgba(27,243,203,0.4)',
    backgroundColor: 'rgba(27,243,203,0.12)',
  },
  genderChipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 19.5,
    color: '#777',
  },
  genderChipTextActive: {
    color: colors.accent,
  },
  numberWrap: {
    height: 54,
    borderRadius: 16,
    borderWidth: 0.8,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16.8,
  },
  stepperBtn: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    color: '#666',
    fontSize: 24,
    lineHeight: 24,
    fontFamily: fonts.regular,
  },
  numberValue: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.bold,
    fontSize: 27 * 0.67,
    lineHeight: 27,
    color: colors.white,
  },
  saveButton: {
    marginTop: 20,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  saveButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 24,
    color: colors.black,
  },
  saveButtonTextDisabled: {
    color: '#444',
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
