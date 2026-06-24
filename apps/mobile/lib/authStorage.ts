import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Supabase session storage. SecureStore is preferred on device; AsyncStorage is the
 * reliable fallback for simulators and when SecureStore is unavailable.
 */
let secureStoreAvailable: boolean | null = null;

const resolveSecureStore = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return false;
  if (secureStoreAvailable !== null) return secureStoreAvailable;
  try {
    secureStoreAvailable = await SecureStore.isAvailableAsync();
  } catch {
    secureStoreAvailable = false;
  }
  return secureStoreAvailable;
};

export const authStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (await resolveSecureStore()) {
      try {
        return await SecureStore.getItemAsync(key);
      } catch {
        // fall through to AsyncStorage
      }
    }
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (await resolveSecureStore()) {
      try {
        await SecureStore.setItemAsync(key, value);
        return;
      } catch {
        // fall through to AsyncStorage
      }
    }
    await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (await resolveSecureStore()) {
      try {
        await SecureStore.deleteItemAsync(key);
        return;
      } catch {
        // fall through to AsyncStorage
      }
    }
    await AsyncStorage.removeItem(key);
  },
};
