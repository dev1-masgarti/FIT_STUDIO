import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackChevronIcon } from '@/components/icons/OnboardingIcons';
import { BottomNav } from '@/components/navigation/BottomNav';
import { PermissionToggle } from '@/components/share/PermissionToggle';
import { PinkBlurGlow, TealBlurGlow } from '@/components/ui/BackgroundGlow';
import { colors, fonts, layout } from '@/constants/theme';
import { goBackOrHome } from '@/lib/navigation';

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const [sharing, setSharing] = useState({
    coaches: true,
    healthKit: true,
  });
  const [permissions, setPermissions] = useState({
    notifications: true,
    biometrics: false,
    analytics: false,
  });

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
          <Text style={styles.headerTitle}>Data & Privacy</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.ownershipCard}>
          <Text style={styles.ownershipTitle}>You own your data</Text>
          <Text style={styles.ownershipText}>
            FitOwn never sells your data. You can export or delete everything at any time.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>DATA SHARING</Text>
        <View style={styles.sectionCard}>
          <PermissionToggle
            title="Sync with coaches"
            subtitle="Allow connected coaches to see your data"
            enabled={sharing.coaches}
            onToggle={() => setSharing((prev) => ({ ...prev, coaches: !prev.coaches }))}
            icon="↻"
            iconColor={colors.accent}
          />
          <PermissionToggle
            title="Apple Health / Google Fit"
            subtitle="Sync steps, heart rate, sleep"
            enabled={sharing.healthKit}
            onToggle={() => setSharing((prev) => ({ ...prev, healthKit: !prev.healthKit }))}
            icon="◎"
            iconColor={colors.accent}
            withTopBorder
          />
        </View>

        <Text style={styles.sectionLabel}>APP PERMISSIONS</Text>
        <View style={styles.sectionCard}>
          <PermissionToggle
            title="Push notifications"
            subtitle="Workout reminders and PR alerts"
            enabled={permissions.notifications}
            onToggle={() => setPermissions((prev) => ({ ...prev, notifications: !prev.notifications }))}
            icon="◉"
            iconColor={colors.accent}
          />
          <PermissionToggle
            title="Face ID / Biometric login"
            subtitle="Unlock app without password"
            enabled={permissions.biometrics}
            onToggle={() => setPermissions((prev) => ({ ...prev, biometrics: !prev.biometrics }))}
            icon="◍"
            iconColor="#8e8e8e"
            withTopBorder
          />
          <PermissionToggle
            title="Anonymous usage analytics"
            subtitle="Help improve the app (no PII)"
            enabled={permissions.analytics}
            onToggle={() => setPermissions((prev) => ({ ...prev, analytics: !prev.analytics }))}
            icon="◌"
            iconColor="#8e8e8e"
            withTopBorder
          />
        </View>

        <Text style={styles.sectionLabel}>DANGER ZONE</Text>
        <View style={styles.sectionCard}>
          <Pressable style={styles.dangerRow} accessibilityRole="button" accessibilityLabel="Revoke all coach access">
            <View style={styles.dangerTextWrap}>
              <Text style={styles.dangerTitle}>Revoke all coach access</Text>
              <Text style={styles.dangerSubtitle}>Disconnects all professionals immediately</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
          <Pressable
            style={[styles.dangerRow, styles.dangerBorder]}
            accessibilityRole="button"
            accessibilityLabel="Delete all workout data"
          >
            <View style={styles.dangerTextWrap}>
              <Text style={[styles.dangerTitle, styles.deleteTitle]}>Delete all workout data</Text>
              <Text style={styles.dangerSubtitle}>Cannot be undone</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </View>
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
  root: { flex: 1, backgroundColor: colors.background, overflow: 'hidden' },
  topGlow: { position: 'absolute', left: 110, top: -100, width: 400, height: 400, opacity: 0.5 },
  bottomGlow: { position: 'absolute', left: -100, top: 424, width: 360, height: 360, opacity: 0.45 },
  scrollContent: { paddingHorizontal: 20, gap: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 6,
  },
  backButton: { width: 64, flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 21, color: colors.muted },
  headerTitle: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 24, color: colors.white },
  ownershipCard: {
    borderRadius: 18,
    borderWidth: 0.8,
    borderColor: 'rgba(27,243,203,0.3)',
    backgroundColor: 'rgba(27,243,203,0.07)',
    padding: 16.8,
    gap: 4,
  },
  ownershipTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 28 * 0.5,
    lineHeight: 21,
    color: colors.accent,
  },
  ownershipText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 21,
    color: '#555',
  },
  sectionLabel: {
    marginTop: 6,
    fontFamily: fonts.semiBold,
    fontSize: 10,
    lineHeight: 15,
    color: '#444',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionCard: {
    borderRadius: 18,
    borderWidth: 0.8,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    overflow: 'hidden',
  },
  dangerRow: {
    paddingHorizontal: 16.8,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dangerBorder: {
    borderTopWidth: 0.8,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  dangerTextWrap: {
    flex: 1,
    gap: 1,
  },
  dangerTitle: {
    fontFamily: fonts.medium,
    fontSize: 28 * 0.5,
    lineHeight: 21,
    color: colors.white,
  },
  deleteTitle: { color: '#ff245a' },
  dangerSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13 * 0.85,
    lineHeight: 16.5,
    color: '#444',
  },
  chevron: {
    color: '#333',
    fontSize: 18,
    lineHeight: 18,
  },
  nav: { position: 'absolute', left: 8, right: 8 },
  homeIndicatorWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  homeIndicator: {
    width: 134,
    height: 5,
    borderRadius: 100,
    backgroundColor: colors.white,
  },
});
