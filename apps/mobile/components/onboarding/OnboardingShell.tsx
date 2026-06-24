import { ImageBackground, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/auth/PrimaryButton';
import { OnboardingBackButton } from '@/components/onboarding/OnboardingBackButton';
import { OnboardingStepBar } from '@/components/onboarding/OnboardingStepBar';
import { PinkBlurGlow, TealBlurGlow } from '@/components/ui/BackgroundGlow';
import { colors, layout } from '@/constants/theme';

type OnboardingShellVariant = 'solid' | 'celebration';

type OnboardingShellProps = {
  step: number;
  onBack?: () => void;
  showBack?: boolean;
  showStepBar?: boolean;
  variant?: OnboardingShellVariant;
  children: React.ReactNode;
  footer?: React.ReactNode;
  ctaLabel?: string;
  onCtaPress?: () => void;
  ctaDisabled?: boolean;
  ctaLoading?: boolean;
};

export const OnboardingShell = ({
  step,
  onBack,
  showBack = true,
  showStepBar = true,
  variant = 'solid',
  children,
  footer,
  ctaLabel,
  onCtaPress,
  ctaDisabled = false,
  ctaLoading = false,
}: OnboardingShellProps) => {
  const insets = useSafeAreaInsets();
  const isCelebration = variant === 'celebration';

  return (
    <View
      style={[
        styles.root,
        layout.onboardingFrame,
        { paddingTop: insets.top },
      ]}
    >
      {isCelebration ? (
        <>
          <ImageBackground
            source={require('@/assets/images/splash-bg.jpg')}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />
        </>
      ) : null}

      <View style={styles.glowBottom} pointerEvents="none">
        <TealBlurGlow />
      </View>
      {isCelebration ? (
        <View style={styles.glowTop} pointerEvents="none">
          <PinkBlurGlow />
        </View>
      ) : null}

      <View style={[styles.content, { paddingBottom: insets.bottom + 8 }]}>
        {showStepBar ? (
          <View style={styles.stepBarWrap}>
            <OnboardingStepBar currentStep={step} />
          </View>
        ) : null}

        {showBack && onBack ? (
          <OnboardingBackButton onPress={onBack} />
        ) : !showStepBar ? null : (
          <View style={styles.backSpacer} />
        )}

        <View style={styles.body}>{children}</View>

        <View style={styles.footer}>
          {footer ??
            (ctaLabel && onCtaPress ? (
              <PrimaryButton
                label={ctaLabel}
                onPress={onCtaPress}
                disabled={ctaDisabled}
                loading={ctaLoading}
              />
            ) : null)}
        </View>
      </View>

      <View style={[styles.homeIndicator, { bottom: insets.bottom > 0 ? insets.bottom - 4 : 8 }]}>
        <View
          style={[
            styles.homeIndicatorBar,
            isCelebration && styles.homeIndicatorBarLight,
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(12,12,12,0.75)',
  },
  glowBottom: {
    position: 'absolute',
    left: -221,
    top: 318,
    width: 1357,
    height: 700,
    zIndex: 0,
  },
  glowTop: {
    position: 'absolute',
    left: -188,
    top: -398,
    width: 587,
    height: 700,
    zIndex: 0,
  },
  content: {
    flex: 1,
    zIndex: 1,
    paddingHorizontal: layout.horizontalPadding,
  },
  stepBarWrap: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  backSpacer: {
    height: 53,
  },
  body: {
    flex: 1,
    width: '100%',
  },
  footer: {
    paddingBottom: 16,
    alignItems: 'center',
  },
  homeIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  homeIndicatorBar: {
    width: 134,
    height: 5,
    borderRadius: 100,
    backgroundColor: colors.homeIndicator,
  },
  homeIndicatorBarLight: {
    backgroundColor: colors.white,
  },
});
