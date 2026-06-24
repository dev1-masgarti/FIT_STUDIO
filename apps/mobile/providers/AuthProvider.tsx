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
  signInWithApple,
  signInWithEmail,
  signInWithGoogle,
  signOut as authSignOut,
  signUpWithEmail,
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
  signUp: typeof signUpWithEmail;
  signIn: typeof signInWithEmail;
  signInGoogle: typeof signInWithGoogle;
  signInApple: typeof signInWithApple;
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
  const isConfigured = isBackendConfigured();

  const loadProfile = useCallback(async (userId: string) => {
    const next = await fetchProfile(userId);
    setProfile(next);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session?.user.id) return;
    await loadProfile(session.user.id);
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
        setSession(current);
        if (current?.user.id) {
          registerDeviceKeys(current.user.id, 'primary-mobile').catch((error) => {
            console.warn('[AuthProvider] device registration failed:', error);
          });
          // Await the profile so routing decisions (onboarding vs tabs) only run
          // once we actually know onboarding_complete — otherwise a returning user
          // is briefly routed back into onboarding on every cold start.
          try {
            await withTimeout(
              loadProfile(current.user.id),
              AUTH_BOOTSTRAP_TIMEOUT_MS,
              'Profile load timed out',
            );
          } catch (profileError) {
            console.warn('[AuthProvider] profile load failed:', profileError);
          }
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
  }, [isConfigured, loadProfile]);

  const signOut = useCallback(async () => {
    await authSignOut();
    setSession(null);
    setProfile(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      isLoading,
      isConfigured,
      bootstrapError,
      signUp: signUpWithEmail,
      signIn: signInWithEmail,
      signInGoogle: signInWithGoogle,
      signInApple: signInWithApple,
      signOut,
      resetPassword: sendPasswordReset,
      refreshProfile,
      setProfile,
    }),
    [session, profile, isLoading, isConfigured, bootstrapError, refreshProfile, signOut],
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
