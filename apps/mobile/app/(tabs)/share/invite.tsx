import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { BottomNav } from '@/components/navigation/BottomNav';
import { BackChevronIcon } from '@/components/icons/OnboardingIcons';
import { PermissionToggle } from '@/components/share/PermissionToggle';
import { colors, fonts, layout } from '@/constants/theme';
import { goBackOrHome } from '@/lib/navigation';

type Role = 'strength' | 'cardio' | 'physio' | 'doctor' | 'nutritionist' | 'other';

const ROLES: { key: Role; label: string }[] = [
  { key: 'strength', label: 'Strength Coach' },
  { key: 'cardio', label: 'Cardio Coach' },
  { key: 'physio', label: 'Physio' },
  { key: 'doctor', label: 'Doctor' },
  { key: 'nutritionist', label: 'Nutritionist' },
  { key: 'other', label: 'Other' },
];

const InviteScreen = () => {
  const [email, setEmail] = useState('john.bower@email.com');
  const [role, setRole] = useState<Role>('strength');
  const [permissions, setPermissions] = useState({
    strength: true,
    cardio: false,
    parq: true,
    notes: true,
    body: false,
  });

  const togglePermission = (key: keyof typeof permissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <View style={[styles.root, layout.onboardingFrame]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={goBackOrHome}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <BackChevronIcon color="#666" />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Invite Professional</Text>
          <View style={{ width: 64 }} />
        </View>

        <Text style={styles.subtitle}>
          Share your fitness data with a coach or health professional. You control exactly what they
          can see.
        </Text>

        <Text style={styles.label}>Their email or username</Text>
        <View style={styles.inputWrap}>
          <Text style={styles.inputIcon}>✉</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholder="john.bower@email.com"
            placeholderTextColor="#444"
            autoCapitalize="none"
          />
        </View>

        <Text style={styles.label}>Their role</Text>
        <View style={styles.roleWrap}>
          {ROLES.map((item) => {
            const active = item.key === role;
            return (
              <Pressable
                key={item.key}
                onPress={() => setRole(item.key)}
                style={[styles.roleChip, active && styles.roleChipActive]}
                accessibilityRole="button"
                accessibilityLabel={`Set role ${item.label}`}
              >
                <Text style={[styles.roleText, active && styles.roleTextActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>What can they see?</Text>
        <Text style={styles.hint}>Defaults set for Strength Coach. Customise below.</Text>

        <View style={styles.permissionsCard}>
          <PermissionToggle
            title="Strength workouts"
            subtitle="Sets, reps, RPE, 1RM estimates"
            icon="✖"
            iconColor={colors.accent}
            enabled={permissions.strength}
            onToggle={() => togglePermission('strength')}
          />
          <PermissionToggle
            title="Cardio sessions"
            subtitle="Duration, distance, intensity"
            icon="▱"
            iconColor="#00dbe9"
            enabled={permissions.cardio}
            onToggle={() => togglePermission('cardio')}
            withTopBorder
          />
          <PermissionToggle
            title="Health form (PARQ)"
            subtitle="Medical flags and readiness"
            icon="☾"
            iconColor="#cab0ff"
            enabled={permissions.parq}
            onToggle={() => togglePermission('parq')}
            withTopBorder
          />
          <PermissionToggle
            title="Notes & comments"
            subtitle="Session notes and observations"
            icon="✎"
            iconColor="#1bf3cb"
            enabled={permissions.notes}
            onToggle={() => togglePermission('notes')}
            withTopBorder
          />
          <PermissionToggle
            title="Body measurements"
            subtitle="Weight and body composition"
            icon="⎔"
            iconColor="#9ea2ad"
            enabled={permissions.body}
            onToggle={() => togglePermission('body')}
            withTopBorder
          />
        </View>

        <Pressable style={styles.sendButton} accessibilityRole="button" accessibilityLabel="Send invitation">
          <Text style={styles.sendButtonText}>Send Invitation</Text>
        </Pressable>
        <Text style={styles.footerHint}>You can change or revoke access anytime</Text>
      </ScrollView>

      <View style={styles.nav}>
        <BottomNav active="share" />
      </View>
      <View style={styles.homeIndicatorWrap}>
        <View style={styles.homeIndicator} />
      </View>
    </View>
  );
};

export default InviteScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingTop: 62,
    paddingHorizontal: 20,
    paddingBottom: 120,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 21.2,
    color: '#555',
    marginBottom: 6,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.white,
    marginTop: 2,
  },
  inputWrap: {
    height: 54,
    borderRadius: 16,
    borderWidth: 0.8,
    borderColor: 'rgba(27,243,203,0.2)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputIcon: {
    color: colors.accent,
    fontSize: 14,
  },
  input: {
    flex: 1,
    color: '#444',
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  roleWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
    marginBottom: 2,
  },
  roleChip: {
    height: 36,
    borderRadius: 999,
    borderWidth: 0.8,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  roleChipActive: {
    borderColor: 'rgba(27,243,203,0.8)',
    backgroundColor: colors.accent,
  },
  roleText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 19.5,
    color: '#777',
  },
  roleTextActive: {
    color: colors.black,
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16.5,
    color: '#444',
    marginBottom: 4,
  },
  permissionsCard: {
    borderRadius: 20,
    borderWidth: 0.8,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    overflow: 'hidden',
    marginTop: 2,
  },
  sendButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  sendButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    lineHeight: 25.5,
    color: colors.black,
  },
  footerHint: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16.5,
    color: '#444',
    textAlign: 'center',
  },
  nav: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 42,
  },
  homeIndicatorWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 4,
    alignItems: 'center',
  },
  homeIndicator: {
    width: 134,
    height: 5,
    borderRadius: 100,
    backgroundColor: colors.white,
  },
});
