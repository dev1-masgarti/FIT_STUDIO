import type { Profile } from '@fitown/types';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  getCurrentSession,
  signInWithApple as apiSignInWithApple,
  signInWithEmail as apiSignInWithEmail,
  signInWithGoogle as apiSignInWithGoogle,
  signOut as authSignOut,
  signUpWithEmail as apiSignUpWithEmail,
  sendPasswordReset,
} from '@/lib/api/auth';
import { isBackendConfigured, type AppSession } from '@/lib/backend/client';
import { fetchProfile } from '@/lib/api/profile';
import { registerDeviceKeys } from '@/lib/crypto/deviceKeys';
import { withTimeout } from '@/lib/withTimeout';

const AUTH_BOOTSTRAP_TIMEOUT_MS = 8_000;

type AuthContextValue = {
  session: AppSession | null;
  profile: Profile | null;
  isLoading: boolean;
  isConfigured: boolean;
  bootstrapError: string | null;
  profileError: string | null;
  signUp: (input: Parameters<typeof apiSignUpWithEmail>[0]) => Promise<AppSession>;
  signIn: (input: Parameters<typeof apiSignInWithEmail>[0]) => Promise<AppSession>;
  signInGoogle: () => Promise<AppSession>;
  signInApple: () => Promise<AppSession>;
  signOut: () => Promise<void>;
  resetPassword: typeof sendPasswordReset;
  refreshProfile: () => Promise<void>;
  setProfile: (profile: Profile | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<AppSession | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const isConfigured = isBackendConfigured();

  const loadProfile = useCallback(async (userId: string) => {
    const next = await fetchProfile(userId);
    setProfile(next);
    setProfileError(null);
    return next;
  }, []);

  const establishSession = useCallback(
    async (next: AppSession) => {
      setSession(next);
      setBootstrapError(null);
      registerDeviceKeys(next.user.id, 'primary-mobile').catch((error) => {
        console.warn('[AuthProvider] device registration failed:', error);
      });
      try {
        await withTimeout(
          loadProfile(next.user.id),
          AUTH_BOOTSTRAP_TIMEOUT_MS,
          'Profile load timed out',
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unable to load your profile.';
        setProfile(null);
        setProfileError(message);
        console.warn('[AuthProvider] profile load after auth failed:', error);
      }
    },
    [loadProfile],
  );

  const refreshProfile = useCallback(async () => {
    if (!session?.user.id) return;
    try {
      await loadProfile(session.user.id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to refresh your profile.';
      setProfileError(message);
      throw error;
    }
  }, [loadProfile, session?.user.id]);

  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    const bootstrap = async () => {
      try {
        const current = await withTimeout(
          getCurrentSession(),
          AUTH_BOOTSTRAP_TIMEOUT_MS,
          'Session restore timed out',
        );
        if (!mounted) return;
        if (current?.user.id) {
          await establishSession(current);
        } else {
          setSession(null);
          setProfile(null);
        }
      } catch (error) {
        if (!mounted) return;
        const message =
          error instanceof Error ? error.message : 'Unable to restore your session.';
        setBootstrapError(message);
        console.warn('[AuthProvider] bootstrap failed:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, [isConfigured, establishSession]);

  const signUp = useCallback(
    async (input: Parameters<typeof apiSignUpWithEmail>[0]) => {
      const next = await apiSignUpWithEmail(input);
      await establishSession(next);
      return next;
    },
    [establishSession],
  );

  const signIn = useCallback(
    async (input: Parameters<typeof apiSignInWithEmail>[0]) => {
      const next = await apiSignInWithEmail(input);
      await establishSession(next);
      return next;
    },
    [establishSession],
  );

  const signInGoogle = useCallback(async () => {
    const next = await apiSignInWithGoogle();
    await establishSession(next);
    return next;
  }, [establishSession]);

  const signInApple = useCallback(async () => {
    const next = await apiSignInWithApple();
    await establishSession(next);
    return next;
  }, [establishSession]);

  const signOut = useCallback(async () => {
    await authSignOut();
    setSession(null);
    setProfile(null);
    setProfileError(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      isLoading,
      isConfigured,
      bootstrapError,
      profileError,
      signUp,
      signIn,
      signInGoogle,
      signInApple,
      signOut,
      resetPassword: sendPasswordReset,
      refreshProfile,
      setProfile,
    }),
    [
      session,
      profile,
      isLoading,
      isConfigured,
      bootstrapError,
      profileError,
      signUp,
      signIn,
      signInGoogle,
      signInApple,
      signOut,
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
