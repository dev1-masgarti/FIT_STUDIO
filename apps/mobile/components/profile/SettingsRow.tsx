import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors, fonts } from '@/constants/theme';

type SettingsRowProps = {
  title: string;
  subtitle?: string;
  danger?: boolean;
  onPress?: () => void;
  topBorder?: boolean;
};

const Chevron = ({ muted = false }: { muted?: boolean }) => (
  <Svg width={9} height={14} viewBox="0 0 9 14" fill="none">
    <Path
      d="M1.3 1.3 6.9 7 1.3 12.7"
      stroke={muted ? '#2f2f2f' : '#3a3a3a'}
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const SettingsRow = ({
  title,
  subtitle,
  danger = false,
  onPress,
  topBorder = false,
}: SettingsRowProps) => (
  <Pressable
    style={[styles.row, topBorder && styles.topBorder]}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`Open ${title}`}
  >
    <View style={styles.textWrap}>
      <Text style={[styles.title, danger && styles.dangerTitle]}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
    <Chevron muted={danger} />
  </Pressable>
);

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16.8,
    paddingVertical: 14.8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  topBorder: {
    borderTopWidth: 0.8,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  textWrap: {
    flex: 1,
    gap: 1,
  },
  title: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 21,
    color: colors.white,
  },
  dangerTitle: {
    color: '#ff245a',
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16.5,
    color: '#444',
  },
});
