import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackChevronIcon } from '@/components/icons/OnboardingIcons';
import { BottomNav } from '@/components/navigation/BottomNav';
import { PinkBlurGlow, TealBlurGlow } from '@/components/ui/BackgroundGlow';
import { colors, fonts, layout } from '@/constants/theme';
import { goBackOrHome } from '@/lib/navigation';

type ExportType = 'csv' | 'json' | 'pdf';

export default function ExportScreen() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<ExportType>('csv');

  return (
    <View style={[styles.root, layout.onboardingFrame]}>
      <View style={styles.topGlow} pointerEvents="none">
        <PinkBlurGlow />
      </View>
      <View style={styles.bottomGlow} pointerEvents="none">
        <TealBlurGlow />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 120 },
        ]}
      >
        <View style={styles.header}>
          <Pressable
            onPress={goBackOrHome}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <BackChevronIcon color="#666" />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Export My Data</Text>
          <View style={{ width: 64 }} />
        </View>

        <Text style={styles.subtitle}>
          Download a complete copy of your data. Your files are generated instantly and never stored
          on our servers.
        </Text>

        <View style={styles.optionsWrap}>
          <Pressable
            onPress={() => setSelected('csv')}
            style={[styles.optionCard, selected === 'csv' && styles.optionCardActive]}
            accessibilityRole="button"
            accessibilityLabel="Export as CSV spreadsheet"
          >
            <View>
              <Text style={styles.optionTitle}>CSV Spreadsheet</Text>
              <Text style={styles.optionSubtitle}>All workouts, sets, PRs in rows</Text>
            </View>
            <Text style={styles.optionArrow}>{selected === 'csv' ? '✓' : '›'}</Text>
          </Pressable>

          <Pressable
            onPress={() => setSelected('json')}
            style={styles.optionCard}
            accessibilityRole="button"
            accessibilityLabel="Export as JSON archive"
          >
            <View>
              <Text style={styles.optionTitle}>JSON Archive</Text>
              <Text style={styles.optionSubtitle}>Complete structured data export</Text>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </Pressable>

          <Pressable
            onPress={() => setSelected('pdf')}
            style={styles.optionCard}
            accessibilityRole="button"
            accessibilityLabel="Export as PDF summary"
          >
            <View>
              <Text style={styles.optionTitle}>PDF Summary</Text>
              <Text style={styles.optionSubtitle}>Printable training history report</Text>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </Pressable>
        </View>

        <View style={styles.readyCard}>
          <View>
            <Text style={styles.readyTitle}>Export ready</Text>
            <Text style={styles.readyFile}>fitown_export_2026-06-23.csv</Text>
          </View>
        </View>

        <Pressable style={styles.downloadButton} accessibilityRole="button" accessibilityLabel="Download exported file">
          <Text style={styles.downloadButtonText}>Download File</Text>
        </Pressable>
      </ScrollView>

      <View style={[styles.nav, { bottom: insets.bottom + 45 }]}>
        <BottomNav active="profile" />
      </View>
      <View style={[styles.homeIndicatorWrap, { bottom: insets.bottom > 0 ? insets.bottom : 8 }]}>
        <View style={styles.homeIndicator} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, overflow: 'hidden' },
  topGlow: { position: 'absolute', left: 110, top: -100, width: 400, height: 400, opacity: 0.5 },
  bottomGlow: { position: 'absolute', left: -100, top: 424, width: 360, height: 360, opacity: 0.45 },
  scrollContent: { paddingHorizontal: 20, gap: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 6,
  },
  backButton: { width: 64, flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 21, color: colors.muted },
  headerTitle: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 24, color: colors.white },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 21.125,
    color: '#555',
    marginBottom: 4,
  },
  optionsWrap: {
    gap: 12,
  },
  optionCard: {
    borderRadius: 18,
    borderWidth: 0.8,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 16.8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  optionCardActive: {
    backgroundColor: 'rgba(27,243,203,0.07)',
    borderColor: 'rgba(27,243,203,0.3)',
  },
  optionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 21,
    color: colors.white,
  },
  optionSubtitle: {
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 16.5,
    color: '#555',
  },
  optionArrow: {
    color: colors.accent,
    fontSize: 16,
    lineHeight: 16,
    marginRight: 2,
  },
  readyCard: {
    marginTop: 16,
    borderRadius: 18,
    borderWidth: 0.8,
    borderColor: 'rgba(27,243,203,0.18)',
    backgroundColor: 'rgba(27,243,203,0.07)',
    padding: 16.8,
  },
  readyTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.accent,
  },
  readyFile: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16.5,
    color: '#555',
  },
  downloadButton: {
    marginTop: 8,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 24,
    color: colors.black,
  },
  nav: { position: 'absolute', left: 8, right: 8 },
  homeIndicatorWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  homeIndicator: {
    width: 134,
    height: 5,
    borderRadius: 100,
    backgroundColor: colors.white,
  },
});
