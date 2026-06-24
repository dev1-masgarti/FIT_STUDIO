import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { colors, fonts, layout } from '@/constants/theme';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: 'white' | 'splash';
};

export const PrimaryButton = ({
  label,
  onPress,
  loading = false,
  disabled = false,
  style,
  variant = 'white',
}: PrimaryButtonProps) => {
  if (variant === 'splash') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[styles.splashButton, style, (disabled || loading) && styles.disabled]}
      >
        <View style={styles.splashIconWrap}>
          <LinearGradient
            colors={[colors.gradientTeal, colors.white]}
            start={{ x: 0.12, y: 0 }}
            end={{ x: 0.88, y: 1 }}
            style={styles.splashIconGradient}
          >
            <Text style={styles.splashArrow}>›</Text>
          </LinearGradient>
        </View>
        <Text style={styles.splashLabel}>{label}</Text>
        <Text style={styles.splashChevrons}>›››</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.button, style, (disabled || loading) && styles.disabled]}
    >
      {loading ? (
        <ActivityIndicator color={colors.black} />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: layout.primaryButtonHeight,
    width: layout.contentWidth,
    borderRadius: layout.borderRadiusButton,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    lineHeight: 25.5,
    color: colors.black,
  },
  disabled: {
    opacity: 0.6,
  },
  splashButton: {
    height: 60,
    width: 328,
    borderRadius: 30,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    position: 'relative',
  },
  splashIconWrap: {
    position: 'absolute',
    left: 6,
    width: 52.5,
    height: 52.5,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: colors.white,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashIconGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashArrow: {
    fontSize: 24,
    color: colors.black,
    fontFamily: fonts.semiBold,
    marginTop: -2,
  },
  splashLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.black,
  },
  splashChevrons: {
    position: 'absolute',
    right: 24,
    fontSize: 14,
    color: colors.black,
    fontFamily: fonts.semiBold,
    letterSpacing: -2,
  },
});
