import { Redirect } from 'expo-router';

const OnboardingIndex = () => {
  return <Redirect href="/(auth)/onboarding/step-1" />;
};

export default OnboardingIndex;
