import { Stack } from 'expo-router';

const ShareLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="invite" />
    </Stack>
  );
};

export default ShareLayout;
