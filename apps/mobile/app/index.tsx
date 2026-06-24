import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ONBOARDING_START } from '@/constants/onboardingRoutes';
import { colors, fonts } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';

const Index = () => {
  const { isLoading, isConfigured, bootstrapError, session, profile } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} size="large" />
        <Text style={styles.loadingText}>Loading MASGARTI Fit…</Text>
      </View>
    );
  }

  if (!isConfigured) {
    return (
      <View style={styles.loading}>
        <Text style={styles.configTitle}>Backend not configured</Text>
        <Text style={styles.configText}>
          Set EXPO_PUBLIC_BACKEND_URL in apps/mobile/.env.local, then restart the dev server.
        </Text>
      </View>
    );
  }

  if (bootstrapError && !session) {
    return (
      <View style={styles.loading}>
        <Text style={styles.configTitle}>Could not connect</Text>
        <Text style={styles.configText}>{bootstrapError}</Text>
        <Text style={styles.configHint}>
          Check your network and backend configuration, then reload the app.
        </Text>
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/splash" />;
  }

  if (!profile?.onboarding_complete) {
    return <Redirect href={ONBOARDING_START} />;
  }

  return <Redirect href="/(tabs)" />;
};

export default Index;

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  loadingText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.muted,
  },
  configTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  configText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 22,
    color: colors.muted,
    textAlign: 'center',
  },
  configHint: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colors.label,
    textAlign: 'center',
    marginTop: 8,
  },
});
