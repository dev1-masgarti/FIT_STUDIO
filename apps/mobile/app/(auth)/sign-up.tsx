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
import { validateSignUp } from '@fitown/utils';

const SignUpScreen = () => {
  const router = useRouter();
  const { signInApple, signInGoogle, signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    const validation = validateSignUp({ fullName, email, password });
    if (!validation.ok) {
      setError(validation.message);
      return;
    }
    if (!agreed) return;

    setLoading(true);
    setError(null);
    try {
      await signUp({ fullName, email, password });
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account.');
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

  const handleToggleAgreed = () => {
    setAgreed((prev) => !prev);
  };

  return (
    <AuthScreenLayout showTopGlow>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <AppBrandLogo subtitle="Create your account to get started." />
        </View>

        <View style={styles.form}>
          <AuthInput
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Alex Johnson"
            autoComplete="name"
            textContentType="name"
          />
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
            placeholder="Create a strong password"
            secureTextEntry={!showPassword}
            autoComplete="new-password"
            textContentType="newPassword"
            rightElement={
              <PasswordToggle visible={showPassword} onToggle={handleTogglePassword} />
            }
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          onPress={handleToggleAgreed}
          style={styles.termsRow}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agreed }}
          accessibilityLabel="Agree to Terms of Service and Privacy Policy"
        >
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed ? <Text style={styles.checkmark}>✓</Text> : null}
          </View>
          <Text style={styles.termsText}>
            I agree to the <Text style={styles.termsLink}>Terms of Service</Text>
            {' and '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </Pressable>

        <PrimaryButton
          label="Create Account"
          onPress={handleSignUp}
          disabled={!agreed}
          loading={loading}
        />

        <DividerOr />

        <View style={styles.socialRow}>
          <SocialButton provider="google" onPress={() => handleSocial('google')} />
          <SocialButton provider="apple" onPress={() => handleSocial('apple')} />
        </View>

        <AuthFooterLink
          prefix="Already have an account?"
          linkLabel="Log In"
          onPress={() => router.push('/(auth)/login')}
        />
      </ScrollView>
    </AuthScreenLayout>
  );
};

export default SignUpScreen;

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
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    width: layout.contentWidth,
    alignSelf: 'center',
    paddingTop: 20,
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 0.8,
    borderColor: colors.inputBorderStrong,
    backgroundColor: colors.socialBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    borderColor: colors.accent,
    backgroundColor: colors.accentMuted,
  },
  checkmark: {
    fontSize: 12,
    color: colors.accent,
    fontFamily: fonts.semiBold,
  },
  termsText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 21,
    color: colors.muted,
  },
  termsLink: {
    color: colors.accent,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    width: layout.contentWidth,
    alignSelf: 'center',
  },
});
