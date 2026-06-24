import { Stack } from 'expo-router';

const HistoryLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[sessionId]" />
    </Stack>
  );
};

export default HistoryLayout;
