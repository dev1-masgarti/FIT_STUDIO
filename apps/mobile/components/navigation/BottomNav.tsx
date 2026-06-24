import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { colors, fonts } from '@/constants/theme';

type TabKey = 'home' | 'log' | 'history' | 'share' | 'profile';

type BottomNavProps = {
  active: TabKey;
};

const NAV_ITEMS: { key: TabKey; label: string; route?: string }[] = [
  { key: 'home', label: 'Home', route: '/(tabs)' },
  { key: 'log', label: 'Log', route: '/(tabs)/log' },
  { key: 'history', label: 'History', route: '/(tabs)/history' },
  { key: 'share', label: 'Share', route: '/(tabs)/share' },
  { key: 'profile', label: 'Profile', route: '/(tabs)/profile' },
];

const HomeGlyph = ({ active }: { active: boolean }) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <Path
      d="M3.5 9.2 10 4l6.5 5.2v7.3a1 1 0 0 1-1 1h-3.8v-4.5H8.3v4.5H4.5a1 1 0 0 1-1-1V9.2z"
      stroke={active ? colors.white : '#444'}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const LogGlyph = ({ active }: { active: boolean }) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <Rect
      x={4.5}
      y={3.5}
      width={11}
      height={13}
      rx={2}
      stroke={active ? colors.white : '#444'}
      strokeWidth={1.5}
    />
    <Path
      d="M8 2.8h4M7 7.8h6M7 10.8h6M7 13.8h4"
      stroke={active ? colors.white : '#444'}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

const PlaceholderGlyph = ({ active }: { active: boolean }) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <Path
      d="M4 10h12M10 4v12"
      stroke={active ? colors.white : '#444'}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

const HistoryGlyph = ({ active }: { active: boolean }) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <Path
      d="M3.8 9.8a6.2 6.2 0 1 0 2.1-4.6M3.8 5.2v4.1h4.1"
      stroke={active ? colors.white : '#444'}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10 7.3v3.1l2.3 1.3"
      stroke={active ? colors.white : '#444'}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ShareGlyph = ({ active }: { active: boolean }) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <Path
      d="M14.8 6.2a2.1 2.1 0 1 0-1.8-3.2L7.7 6a2.1 2.1 0 1 0 0 8L13 17a2.1 2.1 0 1 0 .8-1.4l-5.2-3a2.1 2.1 0 0 0 0-3.2l5.2-3c.3.5.8.8 1.4.8z"
      stroke={active ? colors.white : '#444'}
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ProfileGlyph = ({ active }: { active: boolean }) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <Path
      d="M10 10.2a3.3 3.3 0 1 0 0-6.6 3.3 3.3 0 0 0 0 6.6zM4.6 16c.8-2.4 2.9-3.8 5.4-3.8s4.6 1.4 5.4 3.8"
      stroke={active ? colors.white : '#444'}
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const iconFor = (key: TabKey, active: boolean) => {
  if (key === 'home') return <HomeGlyph active={active} />;
  if (key === 'log') return <LogGlyph active={active} />;
  if (key === 'history') return <HistoryGlyph active={active} />;
  if (key === 'share') return <ShareGlyph active={active} />;
  if (key === 'profile') return <ProfileGlyph active={active} />;
  return <PlaceholderGlyph active={active} />;
};

export const BottomNav = ({ active }: BottomNavProps) => {
  return (
    <View style={styles.wrap}>
      {NAV_ITEMS.map((item) => {
        const isActive = item.key === active;
        return (
          <Pressable
            key={item.key}
            style={styles.item}
            onPress={() => {
              if (!item.route || isActive) return;
              router.navigate(item.route as never);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Open ${item.label}`}
          >
            {iconFor(item.key, isActive)}
            <Text style={[styles.label, isActive && styles.labelActive]}>{item.label}</Text>
            {isActive ? <View style={styles.activeDot} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(16,16,16,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  item: {
    width: 66,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: '#444',
  },
  labelActive: {
    color: colors.white,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.white,
    marginTop: -1,
  },
});
