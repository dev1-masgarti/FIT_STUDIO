import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { colors } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { OnboardingProvider } from '@/providers/OnboardingProvider';

const OnboardingGate = ({ children }: { children: React.ReactNode }) => {
  const { isLoading, session, profile } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/splash" />;
  }

  if (profile?.onboarding_complete) {
    return <Redirect href="/(tabs)" />;
  }

  return <>{children}</>;
};

const OnboardingLayout = () => {
  return (
    <OnboardingProvider>
      <OnboardingGate>
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <Stack.Screen name="step-1" />
          <Stack.Screen name="step-2" />
          <Stack.Screen name="step-3" />
          <Stack.Screen name="step-4" />
          <Stack.Screen name="step-5" />
          <Stack.Screen name="complete" />
        </Stack>
      </OnboardingGate>
    </OnboardingProvider>
  );
};

export default OnboardingLayout;
