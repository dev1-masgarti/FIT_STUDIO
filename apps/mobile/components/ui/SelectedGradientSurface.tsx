import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { selectedGradient } from '@/constants/theme';

type SelectedGradientSurfaceProps = {
  borderRadius: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

export const SelectedGradientSurface = ({
  borderRadius,
  style,
  children,
}: SelectedGradientSurfaceProps) => {
  return (
    <LinearGradient
      colors={[...selectedGradient.colors]}
      locations={[...selectedGradient.locations]}
      start={selectedGradient.start}
      end={selectedGradient.end}
      style={[styles.surface, { borderRadius }, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  surface: {
    borderWidth: 1,
    borderColor: '#ffffff',
    overflow: 'hidden',
  },
});
