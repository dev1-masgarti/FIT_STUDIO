import 'react-native-gesture-handler';
import 'react-native-get-random-values';
import '@/lib/crypto/secureRandom';

import '../global.css';

import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  useFonts,
} from '@expo-google-fonts/outfit';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { colors } from '@/constants/theme';
import { AuthProvider } from '@/providers/AuthProvider';
import { SyncProvider } from '@/providers/SyncProvider';
import { StreamingProvider } from '@/providers/StreamingProvider';
import { WorkoutDraftProvider } from '@/providers/WorkoutDraftProvider';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

const FONT_LOAD_TIMEOUT_MS = 4_000;

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  useEffect(() => {
    if (error) {
      console.warn('[RootLayout] Font load failed, using system fonts:', error);
    }
  }, [error]);

  useEffect(() => {
    const hideSplash = () => {
      SplashScreen.hideAsync().catch(() => undefined);
    };

    if (loaded || error) {
      hideSplash();
      return;
    }

    const timeoutId = setTimeout(hideSplash, FONT_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timeoutId);
  }, [loaded, error]);

  const fontsReady = loaded || Boolean(error);

  if (!fontsReady) {
    return (
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, backgroundColor: colors.background }} />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <SyncProvider>
          <StreamingProvider>
            <WorkoutDraftProvider>
              <StatusBar barStyle="light-content" />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
              </Stack>
            </WorkoutDraftProvider>
          </StreamingProvider>
        </SyncProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
