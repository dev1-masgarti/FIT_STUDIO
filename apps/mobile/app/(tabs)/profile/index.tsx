import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DataSummaryCard } from '@/components/profile/DataSummaryCard';
import { SettingsRow } from '@/components/profile/SettingsRow';
import { BottomNav } from '@/components/navigation/BottomNav';
import { PinkBlurGlow, TealBlurGlow } from '@/components/ui/BackgroundGlow';
import { colors, fonts, layout } from '@/constants/theme';
import { computeBmi } from '@/lib/onboarding/metrics';
import { useAuth } from '@/providers/AuthProvider';

const firstName = (name?: string | null) => {
  const trimmed = name?.trim();
  if (!trimmed) return 'Athlete';
  return trimmed.split(/\s+/)[0] ?? 'Athlete';
};

const formatMemberLine = (createdAt?: string | null, age?: number | null): string => {
  const parts: string[] = [];
  if (createdAt) {
    const date = new Date(createdAt);
    if (!Number.isNaN(date.getTime())) {
      parts.push(`Member since ${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`);
    }
  }
  if (age != null) parts.push(`${age} yrs`);
  return parts.join(' · ');
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, signOut } = useAuth();
  const name = firstName(profile?.full_name);
  const memberLine = formatMemberLine(profile?.created_at, profile?.age);

  const metricTiles = [
    {
      icon: '◍',
      value: profile?.height_cm ? `${profile.height_cm} cm` : '—',
      label: 'Height',
    },
    {
      icon: '⚖',
      value: profile?.body_weight_kg ? `${profile.body_weight_kg} kg` : '—',
      label: 'Weight',
    },
    {
      icon: '▮',
      value:
        profile?.height_cm && profile?.body_weight_kg
          ? String(computeBmi(profile.body_weight_kg, profile.height_cm))
          : '—',
      label: 'BMI',
    },
  ];

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
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Pressable style={styles.editChip} accessibilityRole="button" accessibilityLabel="Edit profile">
            <Text style={styles.editChipText}>✎</Text>
          </Pressable>
        </View>

        <View style={styles.profileTop}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>{name[0]?.toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{name}</Text>
          {memberLine ? <Text style={styles.memberLine}>{memberLine}</Text> : null}
          <View style={styles.ownershipPill}>
            <Text style={styles.ownershipText}>You own your data</Text>
          </View>
        </View>

        <DataSummaryCard
          items={[
            { label: 'Workouts', value: '0' },
            { label: 'Coaches', value: '0' },
            { label: 'PARQ', value: '—' },
          ]}
        />

        <View style={styles.tilesRow}>
          {metricTiles.map((item) => (
            <View key={item.label} style={styles.tile}>
              <Text style={styles.tileIcon}>{item.icon}</Text>
              <Text style={styles.tileValue}>{item.value}</Text>
              <Text style={styles.tileLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionHeading}>MY DATA</Text>
        <View style={styles.sectionCard}>
          <SettingsRow
            title="Personal Details"
            subtitle="Name, age, height, weight"
            onPress={() => router.push('/(tabs)/profile/personal-details' as never)}
          />
          <SettingsRow
            title="Health Form (PARQ)"
            subtitle="Medical readiness questionnaire"
            onPress={() => router.push('/(tabs)/profile/parq' as never)}
            topBorder
          />
          <SettingsRow
            title="Body Measurements"
            subtitle="Track weight & body comp over time"
            onPress={() => router.push('/(tabs)/profile/body-measurements' as never)}
            topBorder
          />
        </View>

        <Text style={styles.sectionHeading}>DATA OWNERSHIP</Text>
        <View style={styles.sectionCard}>
          <SettingsRow
            title="Data & Privacy"
            subtitle="Control your data, sharing settings"
            onPress={() => router.push('/(tabs)/profile/privacy' as never)}
          />
          <SettingsRow
            title="Export My Data"
            subtitle="Download everything as CSV / JSON"
            onPress={() => router.push('/(tabs)/profile/export' as never)}
            topBorder
          />
        </View>

        <View style={styles.sectionCard}>
          <SettingsRow title="Sign Out" danger onPress={() => signOut().catch(() => undefined)} />
          <SettingsRow
            title="Delete Account"
            subtitle="Permanently removes all your data"
            danger
            topBorder
          />
        </View>

        <Text style={styles.footer}>FitOwn v1.0 · Your data, your rules</Text>
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
    left: 106,
    top: -171,
    width: 597,
    height: 597,
    opacity: 0.45,
  },
  bottomGlow: {
    position: 'absolute',
    left: -228,
    top: 410,
    width: 597,
    height: 597,
    opacity: 0.45,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 27,
    color: colors.white,
  },
  editChip: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editChipText: {
    color: '#777',
    fontSize: 13,
  },
  profileTop: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  avatarWrap: {
    width: 62,
    height: 62,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarText: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.white,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 34 * 0.75,
    lineHeight: 34,
    color: colors.white,
  },
  memberLine: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19.5,
    color: '#555',
  },
  ownershipPill: {
    marginTop: 8,
    paddingHorizontal: 14,
    height: 28,
    borderRadius: 999,
    borderWidth: 0.8,
    borderColor: 'rgba(27,243,203,0.3)',
    backgroundColor: 'rgba(0,83,60,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownershipText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    lineHeight: 16,
    color: colors.accent,
  },
  tilesRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 2,
  },
  tile: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 0.8,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 2,
  },
  tileIcon: {
    color: '#9aa0aa',
    fontSize: 14,
    lineHeight: 18,
  },
  tileValue: {
    fontFamily: fonts.semiBold,
    fontSize: 28 * 0.6,
    lineHeight: 24,
    color: colors.white,
  },
  tileLabel: {
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 12,
    color: '#666',
  },
  sectionHeading: {
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 12,
    color: '#555',
    letterSpacing: 1.1,
    marginTop: 2,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 0.8,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    overflow: 'hidden',
  },
  footer: {
    marginTop: 2,
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16.5,
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
