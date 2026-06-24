import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/navigation/BottomNav';
import { BackChevronIcon } from '@/components/icons/OnboardingIcons';
import { PinkBlurGlow, TealBlurGlow } from '@/components/ui/BackgroundGlow';
import { colors, layout, fonts } from '@/constants/theme';
import { goBackOrHome } from '@/lib/navigation';

type LogScreenShellProps = {
  title: string;
  activeTab?: 'log' | 'home' | 'history' | 'share' | 'profile';
  leftMode?: 'back' | 'close' | 'none';
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
  scroll?: boolean;
};

export const LogScreenShell = ({
  title,
  activeTab = 'log',
  leftMode = 'back',
  rightSlot,
  children,
  scroll = true,
}: LogScreenShellProps) => {
  const insets = useSafeAreaInsets();

  const body = (
    <View style={[styles.content, { paddingBottom: insets.bottom + 120 }]}>
      <View style={styles.header}>
        <View style={styles.side}>
          {leftMode === 'none' ? null : (
            <Pressable
              style={styles.leftWrap}
              onPress={goBackOrHome}
              accessibilityRole="button"
              accessibilityLabel={leftMode === 'close' ? 'Close' : 'Go back'}
            >
              <View style={[styles.leftIconWrap, leftMode === 'close' && styles.closeWrap]}>
                {leftMode === 'close' ? <Text style={styles.closeText}>×</Text> : <BackChevronIcon color="#666" />}
              </View>
              {leftMode === 'back' ? <Text style={styles.backText}>Back</Text> : null}
            </Pressable>
          )}
        </View>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.side}>{rightSlot ?? null}</View>
      </View>
      {children}
    </View>
  );

  return (
    <View style={[styles.root, layout.onboardingFrame]}>
      <View style={styles.topGlow} pointerEvents="none">
        <PinkBlurGlow />
      </View>
      <View style={styles.bottomGlow} pointerEvents="none">
        <TealBlurGlow />
      </View>

      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: insets.top + 4 }}
        >
          {body}
        </ScrollView>
      ) : (
        <View style={{ paddingTop: insets.top + 4 }}>{body}</View>
      )}

      <View style={[styles.nav, { bottom: insets.bottom + 45 }]}>
        <BottomNav active={activeTab} />
      </View>
      <View style={[styles.homeIndicatorWrap, { bottom: insets.bottom > 0 ? insets.bottom : 8 }]}>
        <View style={styles.homeIndicator} />
      </View>
    </View>
  );
};

export const HeaderAction = ({ label }: { label: string }) => (
  <View style={styles.headerAction}>
    <Text style={styles.headerActionText}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  topGlow: {
    position: 'absolute',
    left: 110,
    top: -110,
    width: 400,
    height: 400,
    opacity: 0.5,
  },
  bottomGlow: {
    position: 'absolute',
    left: -220,
    top: 420,
    width: 1357,
    height: 700,
  },
  content: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 12,
  },
  side: {
    width: 80,
  },
  leftWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  leftIconWrap: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeWrap: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  closeText: {
    color: '#8a8a8a',
    fontSize: 20,
    lineHeight: 20,
    fontFamily: fonts.regular,
    marginTop: -1,
  },
  backText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 21,
    color: colors.muted,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 24,
    color: colors.white,
    textAlign: 'center',
  },
  headerAction: {
    alignSelf: 'flex-end',
  },
  headerActionText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.accent,
  },
  nav: {
    position: 'absolute',
    left: 8,
    right: 8,
  },
  homeIndicatorWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  homeIndicator: {
    width: 134,
    height: 5,
    borderRadius: 100,
    backgroundColor: colors.white,
  },
});
