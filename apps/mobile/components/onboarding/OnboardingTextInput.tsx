import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { colors, fonts, layout } from '@/constants/theme';

type OnboardingTextInputProps = TextInputProps & {
  label?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
};

export const OnboardingTextInput = ({
  label,
  leftElement,
  rightElement,
  style,
  ...props
}: OnboardingTextInputProps) => {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputRow}>
        {leftElement ? <View style={styles.leftElement}>{leftElement}</View> : null}
        <TextInput
          placeholderTextColor="#444444"
          style={[
            styles.input,
            leftElement ? styles.inputWithLeft : undefined,
            rightElement ? styles.inputWithRight : undefined,
            style,
          ]}
          {...props}
        />
        {rightElement ? <View style={styles.rightElement}>{rightElement}</View> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
    width: layout.contentWidth,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 19.5,
    color: colors.label,
  },
  inputRow: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    height: 64,
    width: layout.contentWidth,
    borderRadius: 20,
    borderWidth: 0.8,
    borderColor: 'rgba(27,243,203,0.25)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 20.8,
    fontFamily: fonts.medium,
    fontSize: 20,
    color: 'rgba(255,255,255,0.8)',
  },
  inputWithLeft: {
    paddingLeft: 52,
  },
  inputWithRight: {
    paddingRight: 48,
  },
  leftElement: {
    position: 'absolute',
    left: 20,
    zIndex: 1,
  },
  rightElement: {
    position: 'absolute',
    right: 20,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
});
