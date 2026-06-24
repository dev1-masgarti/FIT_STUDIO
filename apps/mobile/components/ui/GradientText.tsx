import { useMemo, useState } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';

import { fonts } from '@/constants/theme';

type GradientTextProps = {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  colors?: readonly [string, string];
  style?: StyleProp<ViewStyle>;
};

export const GradientText = ({
  text,
  fontSize = 36,
  fontFamily = fonts.bold,
  colors: gradientColors = ['#1bf3cb', '#ff4d8d'],
  style,
}: GradientTextProps) => {
  const [textWidth, setTextWidth] = useState(0);
  const gradientId = useMemo(
    () => `gradient-${gradientColors[0].replace('#', '')}-${gradientColors[1].replace('#', '')}`,
    [gradientColors],
  );

  const svgHeight = Math.ceil(fontSize * 1.25);

  return (
    <View style={[styles.container, style]}>
      <Text
        style={[
          styles.measure,
          { fontSize, fontFamily },
        ]}
        onLayout={(event) => {
          setTextWidth(Math.ceil(event.nativeEvent.layout.width));
        }}
      >
        {text}
      </Text>

      {textWidth > 0 ? (
        <Svg width={textWidth} height={svgHeight}>
          <Defs>
            <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={gradientColors[0]} />
              <Stop offset="100%" stopColor={gradientColors[1]} />
            </LinearGradient>
          </Defs>
          <SvgText
            fill={`url(#${gradientId})`}
            fontSize={fontSize}
            fontFamily={fontFamily}
            x={0}
            y={fontSize}
            letterSpacing={-0.5}
          >
            {text}
          </SvgText>
        </Svg>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  measure: {
    position: 'absolute',
    opacity: 0,
    letterSpacing: -0.5,
  },
});
