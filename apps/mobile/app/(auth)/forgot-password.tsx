import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AuthInput } from '@/components/auth/AuthInput';
import { AuthScreenLayout } from '@/components/auth/AuthScreenLayout';
import { PrimaryButton } from '@/components/auth/PrimaryButton';
import { colors, fonts, layout } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { isValidEmail } from '@fitown/utils';

const ForgotPasswordScreen = () => {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendReset = async () => {
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await resetPassword(email);
      Alert.alert(
        'Check your email',
        'If an account exists for this address, a reset link has been sent.',
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <AuthScreenLayout showTopGlow showBottomGlow={false}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={handleBack}
          style={styles.backRow}
          accessibilityRole="button"
          accessibilityLabel="Back to Login"
        >
          <Image
            source={require('@/assets/images/icon-back.png')}
            style={styles.backIcon}
            contentFit="contain"
          />
          <Text style={styles.backText}>Back to Login</Text>
        </Pressable>

        <View style={styles.iconWrap}>
          <View style={styles.iconCircle}>
            <Image
              source={require('@/assets/images/icon-mail.png')}
              style={styles.mailIcon}
              contentFit="contain"
            />
          </View>
        </View>

        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.description}>
          No worries. Enter your email and we&apos;ll send you a reset link.
        </Text>

        <View style={styles.form}>
          <AuthInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton
          label="Send Reset Link"
          onPress={handleSendReset}
          loading={loading}
        />
      </ScrollView>
    </AuthScreenLayout>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: layout.horizontalPadding,
    paddingTop: 8,
    paddingBottom: 48,
    flexGrow: 1,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 24,
    minHeight: 44,
  },
  backIcon: {
    width: 18,
    height: 18,
    tintColor: colors.muted,
  },
  backText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 21,
    color: colors.muted,
  },
  iconWrap: {
    paddingBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 22,
    borderWidth: 0.8,
    borderColor: colors.accentBorder,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mailIcon: {
    width: 28,
    height: 28,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 26,
    lineHeight: 39,
    color: colors.white,
    marginBottom: 8,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 24.375,
    color: colors.muted,
    marginBottom: 32,
    maxWidth: layout.contentWidth,
  },
  form: {
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  error: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: '#f87171',
    marginBottom: 12,
  },
});
