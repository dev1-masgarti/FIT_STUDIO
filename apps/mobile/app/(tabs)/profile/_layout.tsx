import { Stack } from 'expo-router';

const ProfileLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="personal-details" />
      <Stack.Screen name="body-measurements" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="export" />
      <Stack.Screen name="parq/index" />
    </Stack>
  );
};

export default ProfileLayout;
