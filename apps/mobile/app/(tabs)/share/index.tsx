import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/navigation/BottomNav';
import { PermissionToggle } from '@/components/share/PermissionToggle';
import { EmptyState } from '@/components/ui/EmptyState';
import { PinkBlurGlow, TealBlurGlow } from '@/components/ui/BackgroundGlow';
import { colors, fonts, layout } from '@/constants/theme';

const ShareScreen = () => {
  const insets = useSafeAreaInsets();
  const [permissions, setPermissions] = useState({
    strength: true,
    cardio: true,
    recovery: false,
    injury: false,
  });

  const togglePermission = (key: keyof typeof permissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
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
        <Text style={styles.title}>My Team</Text>
        <Pressable
          style={styles.inviteAction}
          onPress={() => router.push('/(tabs)/share/invite' as never)}
          accessibilityRole="button"
          accessibilityLabel="Invite a professional"
        >
          <Text style={styles.inviteActionText}>+ Invite</Text>
        </Pressable>

        <EmptyState
          title="No professionals yet"
          subtitle="Invite a coach or clinician to securely share selected data with them."
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Granular Privacy Controls</Text>
          <View style={styles.privacyCard}>
            <PermissionToggle
              title="Strength Data"
              subtitle="MAX REPS, VOL, LOAD"
              icon="✖"
              iconColor={colors.accent}
              enabled={permissions.strength}
              onToggle={() => togglePermission('strength')}
            />
            <PermissionToggle
              title="Cardio Data"
              subtitle="HR ZONES, VO2 MAX, SPLIT TIME"
              icon="▱"
              iconColor="#00dbe9"
              enabled={permissions.cardio}
              onToggle={() => togglePermission('cardio')}
              withTopBorder
            />
            <PermissionToggle
              title="Sleep & Recovery"
              subtitle="HRV, DEEP SLEEP, STRESS SCORES"
              icon="☾"
              iconColor="#cab0ff"
              enabled={permissions.recovery}
              onToggle={() => togglePermission('recovery')}
              withTopBorder
            />
            <PermissionToggle
              title="Injury History"
              subtitle="CLINICAL REPORTS, PHYSIOTHERAPY"
              icon="✣"
              iconColor="#ff6161"
              enabled={permissions.injury}
              onToggle={() => togglePermission('injury')}
              withTopBorder
            />
          </View>
        </View>

        <View style={styles.accessCard}>
          <Text style={styles.accessLabel}>ACCESS PERMISSIONS</Text>
          <View style={styles.permissionRowActive}>
            <Text style={styles.permissionTextActive}>View Only</Text>
            <Text style={styles.permissionCheck}>◉</Text>
          </View>
          <View style={styles.permissionRowLocked}>
            <Text style={styles.permissionTextLocked}>Full Collaboration</Text>
            <Text style={styles.permissionLock}>🔒</Text>
          </View>
          <Text style={styles.permissionHint}>ELITE TIER REQUIRED FOR COLLABORATIVE EDITING</Text>
        </View>

        <View style={styles.activityCard}>
          <Text style={styles.activityHeader}>RECENT ACTIVITY</Text>
          <Text style={styles.activityEmpty}>
            No access activity yet. When a professional views your shared data, it will be logged
            here.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.nav, { bottom: insets.bottom + 45 }]}>
        <BottomNav active="share" />
      </View>
      <View style={[styles.homeIndicatorWrap, { bottom: insets.bottom > 0 ? insets.bottom : 8 }]}>
        <View style={styles.homeIndicator} />
      </View>
    </View>
  );
};

export default ShareScreen;

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
    gap: 16,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 38.67,
    lineHeight: 58,
    color: 'rgba(255,255,255,0.42)',
  },
  inviteAction: {
    position: 'absolute',
    right: 20,
    top: 97,
  },
  inviteActionText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.accent,
  },
  coachRow: {
    gap: 16,
    paddingRight: 20,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontFamily: fonts.medium,
    fontSize: 20,
    lineHeight: 32,
    color: '#dedede',
  },
  privacyCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(20,20,20,0.6)',
    overflow: 'hidden',
  },
  accessCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(20,20,20,0.6)',
    padding: 20,
    gap: 8,
  },
  accessLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
    color: '#c3c3c3',
  },
  permissionRowActive: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  permissionTextActive: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    color: colors.white,
  },
  permissionCheck: {
    color: '#cfff2f',
    fontSize: 11,
  },
  permissionRowLocked: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  permissionTextLocked: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    color: '#c4c9ac',
  },
  permissionLock: {
    color: '#777',
    fontSize: 11,
  },
  permissionHint: {
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 14,
    color: '#8b8b7e',
    letterSpacing: 1.1,
    marginTop: 4,
  },
  activityCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(20,20,20,0.6)',
    padding: 20,
    gap: 10,
  },
  activityHeader: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
    color: '#c3c3c3',
    marginBottom: 2,
  },
  activityEmpty: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: '#6f6f6f',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  activityBullet: {
    color: '#b4ff2e',
    fontSize: 12,
    lineHeight: 18,
  },
  activityBulletMuted: {
    color: '#2f2f2f',
  },
  activityText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: '#dfdfdf',
  },
  activityTextMuted: {
    color: '#6f6f6f',
  },
  activityTime: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
    color: '#9d9d9d',
  },
  activityTimeMuted: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
    color: '#5a5a5a',
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
