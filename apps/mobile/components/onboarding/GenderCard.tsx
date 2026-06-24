import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SelectedGradientSurface } from '@/components/ui/SelectedGradientSurface';
import { colors, fonts, layout } from '@/constants/theme';

type GenderCardProps = {
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onPress: () => void;
  fullWidth?: boolean;
};

export const GenderCard = ({
  label,
  icon,
  selected,
  onPress,
  fullWidth = false,
}: GenderCardProps) => {
  if (selected) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ selected: true }}
        style={[styles.cardPressable, fullWidth && styles.fullWidth]}
      >
        <SelectedGradientSurface borderRadius={20} style={[styles.cardSelected, fullWidth && styles.fullWidth]}>
          <View style={styles.iconWrap}>{icon}</View>
          <Text style={styles.labelSelected}>{label}</Text>
        </SelectedGradientSurface>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: false }}
      style={[styles.card, fullWidth && styles.fullWidth]}
    >
      <View style={styles.iconWrap}>{icon}</View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardPressable: {
    flex: 1,
  },
  card: {
    flex: 1,
    height: 110,
    borderRadius: 20,
    borderWidth: 0.8,
    borderColor: colors.inputBorder,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  cardSelected: {
    flex: 1,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  fullWidth: {
    width: layout.contentWidth,
    flex: 0,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 19.5,
    color: '#777777',
  },
  labelSelected: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 19.5,
    color: colors.black,
  },
});

type GenderRowProps = {
  children: React.ReactNode;
};

export const GenderRow = ({ children }: GenderRowProps) => (
  <View style={genderRowStyles.row}>{children}</View>
);

const genderRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    width: layout.contentWidth,
  },
});
