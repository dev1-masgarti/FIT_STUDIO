import type { SignInInput, SignUpInput } from '@fitown/types';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import {
  backendFetch,
  clearSession,
  loadSession,
  saveSession,
  type AppSession,
} from '@/lib/backend/client';

WebBrowser.maybeCompleteAuthSession();

const mapAuthError = (message: string): string => {
  if (message.includes('Incorrect email or password')) {
    return 'Incorrect email or password.';
  }
  if (message.includes('already exists')) {
    return 'An account with this email already exists.';
  }
  if (message.includes('at least')) {
    return 'Password must be at least 8 characters.';
  }
  return message;
};

const googleIosClientId =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ??
  '273146193394-hsdi6crd79s541nudod7do78gkudah47.apps.googleusercontent.com';
const googleAndroidClientId =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ??
  '273146193394-hrb4emh6vgap0dj0m68majj0800ruba7.apps.googleusercontent.com';
const googleWebClientId =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ??
  '273146193394-hrb4emh6vgap0dj0m68majj0800ruba7.apps.googleusercontent.com';
const googleIosReversedClientId =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_REVERSED_CLIENT_ID ??
  'com.googleusercontent.apps.273146193394-hsdi6crd79s541nudod7do78gkudah47';

const googleClientIdForPlatform = (): string => {
  if (Platform.OS === 'ios') return googleIosClientId;
  if (Platform.OS === 'android') return googleAndroidClientId;
  return googleWebClientId;
};

const defaultGoogleReverseClientId = (clientId: string): string =>
  `com.googleusercontent.apps.${clientId.replace('.apps.googleusercontent.com', '')}`;

const googleRedirectUriForPlatform = (clientId: string): string => {
  if (Platform.OS === 'ios') return `${googleIosReversedClientId}:/oauthredirect`;
  if (Platform.OS === 'android') return `${defaultGoogleReverseClientId(clientId)}:/oauthredirect`;
  return AuthSession.makeRedirectUri({ scheme: 'masgarti-fit', path: 'oauth' });
};

const exchangeSocialToken = async (input: {
  provider: 'google' | 'apple';
  idToken: string;
  fullName?: string | null;
  email?: string | null;
}): Promise<AppSession> => {
  const data = await backendFetch<{ session: AppSession }>('/auth/social-sign-in', {
    method: 'POST',
    body: {
      provider: input.provider,
      idToken: input.idToken,
      fullName: input.fullName ?? undefined,
      email: input.email ?? undefined,
    },
  });
  await saveSession(data.session);
  return data.session;
};

const googleDiscovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

export const signUpWithEmail = async (
  input: SignUpInput,
): Promise<AppSession> => {
  try {
    const data = await backendFetch<{
      session: AppSession;
    }>('/auth/sign-up', {
      method: 'POST',
      body: {
        fullName: input.fullName.trim(),
        email: input.email.trim(),
        password: input.password,
      },
    });
    await saveSession(data.session);
    return data.session;
  } catch (error) {
    throw new Error(mapAuthError(error instanceof Error ? error.message : 'Unable to sign up'));
  }
};

export const signInWithEmail = async (input: SignInInput): Promise<AppSession> => {
  try {
    const data = await backendFetch<{
      session: AppSession;
    }>('/auth/sign-in', {
      method: 'POST',
      body: {
        email: input.email.trim(),
        password: input.password,
      },
    });
    await saveSession(data.session);
    return data.session;
  } catch (error) {
    throw new Error(mapAuthError(error instanceof Error ? error.message : 'Unable to sign in.'));
  }
};

export const signInWithGoogle = async (): Promise<AppSession> => {
  const clientId = googleClientIdForPlatform();
  if (!clientId) {
    throw new Error('Google OAuth is not configured. Missing Google client ID.');
  }

  const redirectUri = googleRedirectUriForPlatform(clientId);
  const request = new AuthSession.AuthRequest({
    clientId,
    redirectUri,
    scopes: ['openid', 'email', 'profile'],
    responseType: AuthSession.ResponseType.Code,
    usePKCE: true,
    prompt: AuthSession.Prompt.SelectAccount,
  });
  const result = await request.promptAsync(googleDiscovery);
  if (result.type !== 'success') throw new Error('Google sign-in was cancelled.');

  const authCode = typeof result.params.code === 'string' ? result.params.code : null;
  if (!authCode) {
    throw new Error('Google sign-in failed: missing authorization code.');
  }
  if (!request.codeVerifier) {
    throw new Error('Google sign-in failed: missing PKCE verifier.');
  }

  const tokenResponse = await AuthSession.exchangeCodeAsync(
    {
      clientId,
      code: authCode,
      redirectUri,
      extraParams: {
        code_verifier: request.codeVerifier,
      },
    },
    googleDiscovery,
  );
  const idToken = tokenResponse.idToken;
  if (!idToken) {
    throw new Error('Google sign-in failed: missing identity token.');
  }

  return exchangeSocialToken({
    provider: 'google',
    idToken,
    email: null,
  });
};

export const signInWithApple = async (): Promise<AppSession> => {
  if (Platform.OS !== 'ios') {
    throw new Error('Apple sign-in is available only on iOS devices.');
  }

  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });
  if (!credential.identityToken) {
    throw new Error('Apple sign-in failed: missing identity token.');
  }

  const pieces = [credential.fullName?.givenName, credential.fullName?.familyName].filter(Boolean);
  const fullName = pieces.length ? pieces.join(' ') : null;

  return exchangeSocialToken({
    provider: 'apple',
    idToken: credential.identityToken,
    fullName,
    email: credential.email ?? null,
  });
};

export const sendPasswordReset = async (email: string): Promise<void> => {
  await backendFetch('/auth/forgot-password', {
    method: 'POST',
    body: { email: email.trim() },
  });
};

export const signOut = async (): Promise<void> => {
  const session = await loadSession();
  if (session?.accessToken) {
    try {
      await backendFetch('/auth/sign-out', {
        method: 'POST',
        token: session.accessToken,
      });
    } catch {
      // best-effort server signout
    }
  }
  await clearSession();
};

export const getCurrentSession = async (): Promise<AppSession | null> => {
  const current = await loadSession();
  if (!current?.accessToken) return null;
  try {
    const data = await backendFetch<{ session: AppSession }>('/auth/session', {
      token: current.accessToken,
    });
    await saveSession(data.session);
    return data.session;
  } catch {
    await clearSession();
    return null;
  }
};
