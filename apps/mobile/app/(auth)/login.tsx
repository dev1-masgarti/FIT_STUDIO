import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AuthFooterLink } from '@/components/auth/AuthFooterLink';
import { AuthInput, PasswordToggle } from '@/components/auth/AuthInput';
import { AuthScreenLayout } from '@/components/auth/AuthScreenLayout';
import { DividerOr } from '@/components/auth/DividerOr';
import { AppBrandLogo } from '@/components/auth/AppBrandLogo';
import { PrimaryButton } from '@/components/auth/PrimaryButton';
import { SocialButton } from '@/components/auth/SocialButton';
import { colors, fonts, layout } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { validateSignIn } from '@fitown/utils';

const LoginScreen = () => {
  const router = useRouter();
  const { signIn, signInApple, signInGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    const validation = validateSignIn({ email, password });
    if (!validation.ok) {
      setError(validation.message);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await signIn({ email, password });
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to log in.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (provider: 'google' | 'apple') => {
    setLoading(true);
    setError(null);
    try {
      if (provider === 'google') {
        await signInGoogle();
      } else {
        await signInApple();
      }
      router.replace('/');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : `Unable to sign in with ${provider}.`;
      setError(message);
      Alert.alert('Sign-in failed', message);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <AuthScreenLayout>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <AppBrandLogo subtitle="Welcome back. Log in to continue." />
        </View>

        <View style={styles.form}>
          <AuthInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
          />
          <AuthInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            autoComplete="password"
            textContentType="password"
            rightElement={
              <PasswordToggle visible={showPassword} onToggle={handleTogglePassword} />
            }
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          onPress={() => router.push('/(auth)/forgot-password')}
          style={styles.forgotWrap}
          accessibilityRole="button"
          accessibilityLabel="Forgot password"
        >
          <Text style={styles.forgotText}>Forgot password?</Text>
        </Pressable>

        <PrimaryButton label="Log In" onPress={handleLogin} loading={loading} />

        <DividerOr />

        <View style={styles.socialRow}>
          <SocialButton provider="google" onPress={() => handleSocial('google')} />
          <SocialButton provider="apple" onPress={() => handleSocial('apple')} />
        </View>

        <AuthFooterLink
          prefix="Don't have an account?"
          linkLabel="Sign Up"
          onPress={() => router.push('/(auth)/sign-up')}
        />
      </ScrollView>
    </AuthScreenLayout>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: layout.horizontalPadding,
    paddingTop: 16,
    paddingBottom: 48,
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  form: {
    gap: 16,
    alignItems: 'center',
  },
  error: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: '#f87171',
    width: layout.contentWidth,
    alignSelf: 'center',
    marginBottom: 8,
    textAlign: 'center',
  },
  forgotWrap: {
    alignSelf: 'flex-end',
    width: layout.contentWidth,
    paddingTop: 12,
    marginBottom: 8,
  },
  forgotText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.accent,
    textAlign: 'right',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    width: layout.contentWidth,
    alignSelf: 'center',
  },
});
