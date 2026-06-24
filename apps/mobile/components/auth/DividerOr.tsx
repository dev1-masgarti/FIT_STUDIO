import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';

export const DividerOr = () => (
  <View style={styles.row}>
    <View style={styles.line} />
    <Text style={styles.text}>or continue with</Text>
    <View style={styles.line} />
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    paddingTop: 24,
    paddingBottom: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  text: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.muted,
  },
});
