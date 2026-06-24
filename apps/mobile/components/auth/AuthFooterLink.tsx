import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';

type AuthFooterLinkProps = {
  prefix: string;
  linkLabel: string;
  onPress: () => void;
};

export const AuthFooterLink = ({ prefix, linkLabel, onPress }: AuthFooterLinkProps) => (
  <View style={styles.row}>
    <Text style={styles.prefix}>{prefix}</Text>
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={linkLabel}
      hitSlop={8}
    >
      <Text style={styles.link}>{linkLabel}</Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 32,
  },
  prefix: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.muted,
  },
  link: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 21,
    color: colors.accent,
  },
});
