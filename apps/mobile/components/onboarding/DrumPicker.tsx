import { useCallback, useEffect, useRef } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ChevronDownIcon, ChevronUpIcon } from '@/components/icons/OnboardingIcons';
import { colors, fonts } from '@/constants/theme';

const ITEM_HEIGHT = 52;
const VISIBLE_HEIGHT = 260;
const PADDING_ITEMS = 2;

type DrumPickerProps = {
  values: number[];
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  width?: number;
};

export const DrumPicker = ({
  values,
  value,
  onChange,
  suffix,
  width = 48,
}: DrumPickerProps) => {
  const listRef = useRef<FlatList<number>>(null);
  const selectedIndex = Math.max(0, values.indexOf(value));

  const scrollToIndex = useCallback(
    (index: number, animated = true) => {
      const clamped = Math.min(Math.max(index, 0), values.length - 1);
      listRef.current?.scrollToOffset({
        offset: clamped * ITEM_HEIGHT,
        animated,
      });
      onChange(values[clamped] ?? value);
    },
    [onChange, value, values],
  );

  useEffect(() => {
    scrollToIndex(selectedIndex, false);
  }, [scrollToIndex, selectedIndex]);

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    scrollToIndex(index);
  };

  const handleStepUp = () => {
    scrollToIndex(selectedIndex - 1);
  };

  const handleStepDown = () => {
    scrollToIndex(selectedIndex + 1);
  };

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={handleStepUp}
        accessibilityRole="button"
        accessibilityLabel="Increase value"
        style={styles.chevronButton}
      >
        <ChevronUpIcon />
      </Pressable>

      <View style={[styles.drumContainer, { width }]}>
        <View style={styles.selectionHighlight} pointerEvents="none" />
        <FlatList
          ref={listRef}
          data={values}
          keyExtractor={(item) => String(item)}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onMomentumScrollEnd={handleMomentumEnd}
          getItemLayout={(_, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
          contentContainerStyle={{
            paddingVertical: ITEM_HEIGHT * PADDING_ITEMS,
          }}
          renderItem={({ item, index }) => {
            const isSelected = index === selectedIndex;
            return (
              <View style={styles.item}>
                <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
                  {item}
                  {suffix && isSelected ? (
                    <Text style={styles.suffix}> {suffix}</Text>
                  ) : null}
                </Text>
              </View>
            );
          }}
          style={{ height: VISIBLE_HEIGHT }}
        />
      </View>

      <Pressable
        onPress={handleStepDown}
        accessibilityRole="button"
        accessibilityLabel="Decrease value"
        style={styles.chevronButton}
      >
        <ChevronDownIcon />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 4,
  },
  chevronButton: {
    paddingVertical: 4,
  },
  drumContainer: {
    height: VISIBLE_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  selectionHighlight: {
    position: 'absolute',
    top: ITEM_HEIGHT * PADDING_ITEMS,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderRadius: 12,
    borderWidth: 0.8,
    borderColor: 'rgba(27,243,203,0.2)',
    backgroundColor: 'rgba(27,243,203,0.08)',
    zIndex: 1,
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    fontFamily: fonts.regular,
    fontSize: 18,
    lineHeight: 27,
    color: '#444444',
  },
  itemTextSelected: {
    fontFamily: fonts.semiBold,
    fontSize: 22,
    color: colors.white,
  },
  suffix: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.accent,
  },
});

export const buildRange = (min: number, max: number): number[] => {
  const result: number[] = [];
  for (let i = min; i <= max; i += 1) {
    result.push(i);
  }
  return result;
};
