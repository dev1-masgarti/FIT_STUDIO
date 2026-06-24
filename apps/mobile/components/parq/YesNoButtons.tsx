import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';

export type YesNoValue = 'yes' | 'no' | null;

type YesNoButtonsProps = {
  value: YesNoValue;
  onChange: (value: Exclude<YesNoValue, null>) => void;
};

export const YesNoButtons = ({ value, onChange }: YesNoButtonsProps) => (
  <View style={styles.row}>
    <Pressable
      style={[styles.button, value === 'no' && styles.activeButton]}
      onPress={() => onChange('no')}
      accessibilityRole="button"
      accessibilityLabel="Answer no"
    >
      <Text style={[styles.buttonText, value === 'no' && styles.activeButtonText]}>No</Text>
    </Pressable>
    <Pressable
      style={[styles.button, value === 'yes' && styles.activeButton]}
      onPress={() => onChange('yes')}
      accessibilityRole="button"
      accessibilityLabel="Answer yes"
    >
      <Text style={[styles.buttonText, value === 'yes' && styles.activeButtonText]}>Yes</Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  button: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 0.8,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    borderColor: 'rgba(27,243,203,0.4)',
    backgroundColor: 'rgba(27,243,203,0.12)',
  },
  buttonText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 21,
    color: '#666',
  },
  activeButtonText: {
    color: colors.accent,
  },
});
