import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';

type PermissionToggleProps = {
  title: string;
  subtitle: string;
  enabled: boolean;
  icon: string;
  iconColor: string;
  onToggle: () => void;
  withTopBorder?: boolean;
};

export const PermissionToggle = ({
  title,
  subtitle,
  enabled,
  icon,
  iconColor,
  onToggle,
  withTopBorder = false,
}: PermissionToggleProps) => (
  <View style={[styles.row, withTopBorder && styles.withTopBorder]}>
    <View style={styles.left}>
      <Text style={[styles.icon, { color: iconColor }]}>{icon}</Text>
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
    <Pressable
      onPress={onToggle}
      style={[styles.switchTrack, enabled && styles.switchTrackOn]}
      accessibilityRole="switch"
      accessibilityState={{ checked: enabled }}
      accessibilityLabel={`Toggle ${title}`}
    >
      <View style={[styles.switchThumb, enabled && styles.switchThumbOn]} />
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  withTopBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  icon: {
    width: 24,
    textAlign: 'center',
    fontSize: 20,
    lineHeight: 24,
  },
  title: {
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 24,
    color: colors.white,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16.5,
    color: '#444',
    textTransform: 'uppercase',
  },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 999,
    borderWidth: 0.8,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 2,
    justifyContent: 'center',
  },
  switchTrackOn: {
    borderColor: 'rgba(27,243,203,0.4)',
    backgroundColor: colors.accent,
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 999,
    backgroundColor: colors.white,
    alignSelf: 'flex-start',
  },
  switchThumbOn: {
    alignSelf: 'flex-end',
  },
});
