import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Dimensions, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SlideToStartButton } from '@/components/auth/SlideToStartButton';
import { PinkBlurGlow, TealBlurGlow } from '@/components/ui/BackgroundGlow';
import { GradientText } from '@/components/ui/GradientText';
import { APP_BRAND_NAME, BRAND_GRADIENT_FONT_SIZES } from '@/constants/branding';
import { colors, fonts } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SplashScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const screenOffset = useSharedValue(0);
  const screenOpacity = useSharedValue(1);

  const navigateToSignUp = useCallback(() => {
    router.push('/(auth)/sign-up');
  }, [router]);

  const handleSlideComplete = useCallback(() => {
    screenOffset.value = withTiming(-SCREEN_WIDTH * 0.35, { duration: 420 });
    screenOpacity.value = withTiming(0, { duration: 420 });
    setTimeout(navigateToSignUp, 380);
  }, [navigateToSignUp, screenOffset, screenOpacity]);

  const animatedScreenStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: screenOffset.value }],
    opacity: screenOpacity.value,
  }));

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ImageBackground
        source={require('@/assets/images/splash-bg.jpg')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(12,12,12,0.3)', 'rgba(12,12,12,0.85)', '#0c0c0c']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.glowPrimary} pointerEvents="none">
        <TealBlurGlow />
      </View>
      <View style={styles.glowSecondary} pointerEvents="none">
        <PinkBlurGlow />
      </View>

      <Animated.View style={[styles.content, animatedScreenStyle]}>
        <View style={styles.center}>
          <GradientText
            text={APP_BRAND_NAME}
            fontSize={BRAND_GRADIENT_FONT_SIZES.splash}
            fontFamily={fonts.bold}
          />
          <Text style={styles.tagline}>
            <Text style={styles.taglineMuted}>Your </Text>
            <Text style={styles.taglineBold}>body.</Text>
            <Text style={styles.taglineMuted}> Your </Text>
            <Text style={styles.taglineBold}>Data.</Text>
          </Text>
        </View>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <SlideToStartButton onComplete={handleSlideComplete} />
          <Pressable
            onPress={() => router.push('/(auth)/login')}
            accessibilityRole="button"
            accessibilityLabel="Log in to existing account"
            style={styles.loginLink}
          >
            <Text style={styles.loginLinkText}>
              Already have an account? <Text style={styles.loginLinkAccent}>Log in</Text>
            </Text>
          </Pressable>
        </View>
      </Animated.View>

      <View style={[styles.homeIndicator, { bottom: insets.bottom > 0 ? insets.bottom - 4 : 8 }]}>
        <View style={styles.homeIndicatorBar} />
      </View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  glowPrimary: {
    position: 'absolute',
    top: -75,
    left: -371,
    width: 1357,
    height: 700,
  },
  glowSecondary: {
    position: 'absolute',
    top: -398,
    left: -188,
    width: 587,
    height: 700,
  },
  content: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  tagline: {
    textAlign: 'center',
  },
  taglineMuted: {
    fontFamily: fonts.regular,
    fontSize: 27,
    color: colors.taglineMuted,
  },
  taglineBold: {
    fontFamily: fonts.medium,
    fontSize: 27,
    color: colors.taglineLight,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  loginLink: {
    minHeight: 44,
    justifyContent: 'center',
  },
  loginLinkText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
  },
  loginLinkAccent: {
    fontFamily: fonts.semiBold,
    color: colors.accent,
    textDecorationLine: 'underline',
  },
  homeIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  homeIndicatorBar: {
    width: 134,
    height: 5,
    borderRadius: 100,
    backgroundColor: colors.homeIndicator,
  },
});
