import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { colors, fonts, layout } from '@/constants/theme';

type AuthInputProps = TextInputProps & {
  label: string;
  rightElement?: React.ReactNode;
};

export const AuthInput = ({
  label,
  rightElement,
  style,
  ...props
}: AuthInputProps) => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          placeholderTextColor={colors.placeholder}
          style={[styles.input, rightElement ? styles.inputWithIcon : undefined, style]}
          {...props}
        />
        {rightElement ? (
          <View style={styles.rightElement}>{rightElement}</View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
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
    height: layout.inputHeight,
    width: layout.contentWidth,
    borderRadius: layout.borderRadiusInput,
    borderWidth: 0.8,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBg,
    paddingHorizontal: 16.8,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.white,
  },
  inputWithIcon: {
    paddingRight: 44,
  },
  rightElement: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
});

type PasswordToggleProps = {
  visible: boolean;
  onToggle: () => void;
};

export const PasswordToggle = ({ visible, onToggle }: PasswordToggleProps) => (
  <Pressable
    onPress={onToggle}
    accessibilityRole="button"
    accessibilityLabel={visible ? 'Hide password' : 'Show password'}
    hitSlop={8}
  >
    <Text style={toggleStyles.icon}>{visible ? '◉' : '◎'}</Text>
  </Pressable>
);

const toggleStyles = StyleSheet.create({
  icon: {
    fontSize: 16,
    color: colors.label,
  },
});
