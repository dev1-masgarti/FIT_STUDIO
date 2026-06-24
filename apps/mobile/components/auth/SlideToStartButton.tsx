import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { colors, fonts } from '@/constants/theme';
import { ArrowNextIcon, ChevronsForwardIcon } from '@/components/icons/SlideIcons';

const TRACK_WIDTH = 328;
const TRACK_HEIGHT = 60;
const THUMB_SIZE = 52.5;
const THUMB_INSET = 5;
const THUMB_TOP = 3.75;
const COMPLETE_THRESHOLD = 0.82;

type SlideToStartButtonProps = {
  label?: string;
  onComplete: () => void;
  disabled?: boolean;
};

export const SlideToStartButton = ({
  label = "Let's Start",
  onComplete,
  disabled = false,
}: SlideToStartButtonProps) => {
  const maxDrag = TRACK_WIDTH - THUMB_SIZE - THUMB_INSET * 2;
  const translateX = useSharedValue(0);
  const completed = useSharedValue(false);
  const startX = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      translateX.value = 0;
      completed.value = false;
    }, [completed, translateX]),
  );

  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .onBegin(() => {
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      if (completed.value) return;
      const next = Math.min(Math.max(startX.value + event.translationX, 0), maxDrag);
      translateX.value = next;
    })
    .onEnd(() => {
      if (completed.value) return;
      if (translateX.value >= maxDrag * COMPLETE_THRESHOLD) {
        completed.value = true;
        translateX.value = withTiming(maxDrag, { duration: 180 }, () => {
          runOnJS(handleComplete)();
        });
        return;
      }
      translateX.value = withSpring(0, { damping: 18, stiffness: 220 });
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: 1 - translateX.value / maxDrag,
  }));

  const chevronsStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0.25, 1 - translateX.value / (maxDrag * 0.65)),
  }));

  const trackFillStyle = useAnimatedStyle(() => ({
    width: THUMB_INSET + THUMB_SIZE / 2 + translateX.value,
  }));

  return (
    <View style={styles.track} accessibilityRole="adjustable" accessibilityLabel={label}>
      <Animated.View style={[styles.trackFill, trackFillStyle]} pointerEvents="none" />

      <Animated.Text style={[styles.label, labelStyle]} pointerEvents="none">
        {label}
      </Animated.Text>

      <Animated.View style={[styles.chevronsWrap, chevronsStyle]} pointerEvents="none">
        <ChevronsForwardIcon width={32} height={14.4} color={colors.black} />
      </Animated.View>

      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.thumb, thumbStyle]}>
          <LinearGradient
            colors={[colors.gradientTeal, colors.white]}
            start={{ x: 0.12, y: 0 }}
            end={{ x: 0.88, y: 1 }}
            style={styles.thumbGradient}
          >
            <ArrowNextIcon size={28.97} color={colors.black} />
          </LinearGradient>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: 30,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  trackFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(27, 243, 203, 0.12)',
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.black,
    zIndex: 1,
  },
  chevronsWrap: {
    position: 'absolute',
    right: 21,
    top: 22.8,
    width: 32,
    height: 14.4,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  thumb: {
    position: 'absolute',
    left: THUMB_INSET,
    top: THUMB_TOP,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    borderWidth: 1,
    borderColor: colors.white,
    overflow: 'hidden',
    zIndex: 2,
  },
  thumbGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
