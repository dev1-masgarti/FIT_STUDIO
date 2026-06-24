import { Stack } from 'expo-router';

import { OnboardingProvider } from '@/providers/OnboardingProvider';

const OnboardingLayout = () => {
  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="step-1" />
        <Stack.Screen name="step-2" />
        <Stack.Screen name="step-3" />
        <Stack.Screen name="step-4" />
        <Stack.Screen name="step-5" />
        <Stack.Screen name="complete" />
      </Stack>
    </OnboardingProvider>
  );
};

export default OnboardingLayout;
