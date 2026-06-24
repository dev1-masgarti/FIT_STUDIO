import { LinearGradient } from 'expo-linear-gradient';
import { ImageBackground, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/theme';

type AuthScreenLayoutProps = {
  children: React.ReactNode;
  showTopGlow?: boolean;
  showBottomGlow?: boolean;
  style?: ViewStyle;
};

export const AuthScreenLayout = ({
  children,
  showTopGlow = false,
  showBottomGlow = true,
  style,
}: AuthScreenLayoutProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }, style]}>
      {showTopGlow && (
        <View style={styles.topGlowWrap} pointerEvents="none">
          <LinearGradient
            colors={['rgba(255,36,90,0.12)', 'transparent']}
            style={styles.topGlow}
          />
        </View>
      )}
      {showBottomGlow && (
        <View style={styles.bottomGlowWrap} pointerEvents="none">
          <LinearGradient
            colors={['rgba(27,243,203,0.1)', 'transparent']}
            style={styles.bottomGlow}
          />
        </View>
      )}
      <ImageBackground
        source={require('@/assets/images/splash-bg.jpg')}
        style={styles.bgImage}
        imageStyle={styles.bgImageStyle}
        resizeMode="cover"
      />
      <View style={styles.overlay} />
      <View style={[styles.content, { paddingBottom: insets.bottom + 8 }]}>
        {children}
      </View>
      <View style={[styles.homeIndicator, { bottom: insets.bottom > 0 ? insets.bottom - 4 : 8 }]}>
        <View style={styles.homeIndicatorBar} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bgImage: {
    ...StyleSheet.absoluteFill,
    opacity: 0.35,
  },
  bgImageStyle: {
    opacity: 0.4,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(12,12,12,0.75)',
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  topGlowWrap: {
    position: 'absolute',
    top: -128,
    right: '10%',
    width: 400,
    height: 400,
    zIndex: 0,
  },
  topGlow: {
    width: '100%',
    height: '100%',
    borderRadius: 200,
    opacity: 0.8,
  },
  bottomGlowWrap: {
    position: 'absolute',
    bottom: 120,
    left: -100,
    width: 360,
    height: 360,
    zIndex: 0,
  },
  bottomGlow: {
    width: '100%',
    height: '100%',
    borderRadius: 180,
    opacity: 0.9,
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
});
