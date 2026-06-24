import { Stack } from 'expo-router';

const LogLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="exercise" />
      <Stack.Screen name="sets" />
      <Stack.Screen name="cardio" />
    </Stack>
  );
};

export default LogLayout;
