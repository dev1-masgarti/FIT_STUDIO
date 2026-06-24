import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { generateHomeImage, inferRegionFromLocale } from '@/lib/api/homeImage';
import { BottomNav } from '@/components/navigation/BottomNav';
import { PinkBlurGlow, TealBlurGlow } from '@/components/ui/BackgroundGlow';
import { colors, fonts } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';

const WEEK_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

const firstNameFromName = (name: string | null | undefined) => {
  if (!name?.trim()) return 'Athlete';
  return name.trim().split(/\s+/)[0] ?? 'Athlete';
};

const timeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const BellIcon = () => (
  <Svg width={17} height={17} viewBox="0 0 20 20" fill="none">
    <Path
      d="M10 2.5a4.5 4.5 0 0 0-4.5 4.5c0 4-1.5 5.2-1.5 5.2h12s-1.5-1.2-1.5-5.2A4.5 4.5 0 0 0 10 2.5zM8.6 16a1.6 1.6 0 0 0 2.8 0"
      stroke={colors.white}
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ArrowIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
    <Path
      d="M3 7h8M7.5 3.5 11 7l-3.5 3.5"
      stroke={colors.black}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const HomeScreen = () => {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const firstName = firstNameFromName(profile?.full_name);
  const greeting = timeGreeting();
  const [homeImageUrl, setHomeImageUrl] = useState<string | null>(profile?.home_image_url ?? null);

  useEffect(() => {
    setHomeImageUrl(profile?.home_image_url ?? null);
  }, [profile?.home_image_url]);

  useEffect(() => {
    if (!profile?.id) return;

    const region = profile.country_region ?? inferRegionFromLocale();
    let active = true;

    generateHomeImage(region)
      .then((result) => {
        if (!active) return;
        setHomeImageUrl(result.image_url);
      })
      .catch((error) => {
        console.warn('[home-image] generation failed', error);
      });

    return () => {
      active = false;
    };
  }, [
    profile?.id,
    profile?.age,
    profile?.date_of_birth,
    profile?.gender,
    profile?.country_region,
    profile?.home_image_signature,
  ]);

  return (
    <View style={styles.root}>
      <View style={styles.topGlow} pointerEvents="none">
        <PinkBlurGlow />
      </View>
      <View style={styles.bottomGlow} pointerEvents="none">
        <TealBlurGlow />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 130 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.avatar}>
            {homeImageUrl ? (
              <Image source={{ uri: homeImageUrl }} style={styles.avatarImage} resizeMode="cover" />
            ) : (
              <LinearGradient
                colors={['rgba(27,243,203,0.45)', 'rgba(255,255,255,0.12)']}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0 }}
                style={styles.avatarFallback}
              >
                <Text style={styles.avatarText}>{firstName[0]?.toUpperCase() ?? 'A'}</Text>
              </LinearGradient>
            )}
          </View>

          <View style={styles.headerText}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.name} numberOfLines={1}>
              {firstName}
            </Text>
          </View>

          <Pressable
            style={styles.bellButton}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            onPress={() => {}}
          >
            <BellIcon />
          </Pressable>
        </View>

        <Pressable
          style={styles.nextWorkoutCard}
          accessibilityRole="button"
          accessibilityLabel="Plan or log a workout"
          onPress={() => router.navigate('/(tabs)/log' as never)}
        >
          {homeImageUrl ? (
            <Image source={{ uri: homeImageUrl }} style={styles.heroImage} resizeMode="cover" />
          ) : null}
          <View style={styles.heroImageTint} />
          <Text style={styles.nextWorkoutPill}>NEXT WORKOUT</Text>
          <Text style={styles.nextWorkoutTitle}>Nothing scheduled</Text>
          <Text style={styles.nextWorkoutSub}>Plan or log a session to begin</Text>
          <View style={styles.nextAction}>
            <LinearGradient
              colors={['#00533c', '#ffffff']}
              start={{ x: 0.1, y: 0.9 }}
              end={{ x: 0.9, y: 0.1 }}
              style={styles.nextActionInner}
            >
              <ArrowIcon />
            </LinearGradient>
          </View>
        </Pressable>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionLabel}>YOUR TRAINING SUMMARY</Text>
          </View>
          <View style={styles.weekRow}>
            {WEEK_DAYS.map((day, index) => (
              <View key={`week-${index}`} style={styles.dayWrap}>
                <View style={[styles.dayDot, styles.dayFuture]} />
                <Text style={styles.dayLabel}>{day}</Text>
              </View>
            ))}
          </View>
          <View style={styles.summarySplit}>
            <View>
              <Text style={styles.summaryValue}>
                0<Text style={styles.summaryValueMuted}>/0</Text>
              </Text>
              <Text style={styles.summaryNote}>Completed this week</Text>
            </View>
            <View style={styles.summaryRight}>
              <Text style={styles.summaryValueDim}>—</Text>
              <Text style={styles.summaryNote}>No data yet</Text>
            </View>
          </View>
        </View>

        <View style={styles.metricRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>0</Text>
            <Text style={styles.metricLabel}>This Month</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>0</Text>
            <Text style={styles.metricLabel}>Avg Session</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>0</Text>
            <Text style={styles.metricLabel}>Streak</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionLabel}>VOLUME</Text>
          </View>
          <View style={styles.rowCenter}>
            <Text style={styles.volumeValue}>
              0<Text style={styles.volumeUnit}>kg</Text>
            </Text>
          </View>
          <Text style={styles.emptyInline}>No volume logged yet</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionLabel}>RECENT EXERCISES</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="See all history"
              onPress={() => router.navigate('/(tabs)/history' as never)}
            >
              <Text style={styles.link}>See All</Text>
            </Pressable>
          </View>
          <View style={styles.emptyBlock}>
            <Text style={styles.emptyTitle}>No exercises logged yet</Text>
            <Text style={styles.emptySubtitle}>Your logged exercises will appear here.</Text>
          </View>
        </View>

        <View style={styles.recordsHeader}>
          <Text style={styles.sectionLabel}>RECENT PERSONAL RECORDS</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="See all records"
            onPress={() => router.navigate('/(tabs)/history' as never)}
          >
            <Text style={styles.link}>See All</Text>
          </Pressable>
        </View>
        <View style={[styles.card, styles.recordsEmptyCard]}>
          <Text style={styles.emptyTitle}>No personal records yet</Text>
          <Text style={styles.emptySubtitle}>Hit a new best to see it celebrated here.</Text>
        </View>
      </ScrollView>

      <View style={[styles.nav, { bottom: insets.bottom + 45 }]}>
        <BottomNav active="home" />
      </View>
      <View style={[styles.homeIndicatorWrap, { bottom: insets.bottom > 0 ? insets.bottom : 8 }]}>
        <View style={styles.homeIndicator} />
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  topGlow: {
    position: 'absolute',
    left: 100,
    top: -130,
    width: 420,
    height: 420,
    opacity: 0.5,
  },
  bottomGlow: {
    position: 'absolute',
    left: -220,
    top: 420,
    width: 1360,
    height: 700,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.black,
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  greeting: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: 40,
    lineHeight: 45,
    color: colors.white,
    marginTop: -2,
  },
  bellButton: {
    width: 36,
    height: 36,
    borderRadius: 999,
    borderWidth: 1.1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  nextWorkoutCard: {
    backgroundColor: '#090909',
    borderRadius: 20,
    borderWidth: 1.1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 16,
    minHeight: 170,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  heroImage: {
    position: 'absolute',
    left: 108,
    bottom: -18,
    width: 240,
    height: 220,
    opacity: 0.9,
  },
  heroImageTint: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '72%',
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  nextWorkoutPill: {
    position: 'absolute',
    top: 16,
    left: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(100,80,220,0.35)',
    borderColor: 'rgba(150,120,255,0.3)',
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 5,
    fontFamily: fonts.semiBold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.8)',
    overflow: 'hidden',
  },
  nextWorkoutTitle: {
    fontFamily: fonts.bold,
    fontSize: 26,
    lineHeight: 32,
    color: colors.white,
  },
  nextWorkoutSub: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.5)',
  },
  nextAction: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  nextActionInner: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.white,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    borderWidth: 1.1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 16,
    gap: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayWrap: {
    alignItems: 'center',
    gap: 6,
  },
  dayDot: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  dayFuture: {
    borderStyle: 'dashed',
  },
  dayLabel: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: '#333333',
  },
  summarySplit: {
    borderTopWidth: 1.1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryValue: {
    fontFamily: fonts.bold,
    fontSize: 22,
    lineHeight: 33,
    color: colors.white,
  },
  summaryValueMuted: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#444444',
  },
  summaryValueDim: {
    fontFamily: fonts.bold,
    fontSize: 22,
    lineHeight: 33,
    color: '#444444',
  },
  summaryNote: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
    color: '#555555',
    marginTop: 2,
  },
  summaryRight: {
    alignItems: 'flex-end',
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1.1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16,
    minHeight: 90,
    justifyContent: 'center',
    paddingHorizontal: 13,
    gap: 4,
  },
  metricValue: {
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 30,
    color: colors.white,
  },
  metricLabel: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: '#555555',
  },
  volumeValue: {
    fontFamily: fonts.bold,
    fontSize: 28,
    lineHeight: 30,
    color: colors.white,
  },
  volumeUnit: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: '#555555',
  },
  emptyInline: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: '#444444',
  },
  link: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.white,
  },
  emptyBlock: {
    paddingVertical: 14,
    alignItems: 'flex-start',
    gap: 4,
  },
  emptyTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
  },
  emptySubtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: '#444444',
  },
  recordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  recordsEmptyCard: {
    gap: 4,
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
