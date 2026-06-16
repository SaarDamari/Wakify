import React, { useEffect, useRef } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '../context/SettingsContext';

interface WheelPickerProps {
  values: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  itemHeight?: number;
  visibleRows?: number; // should be odd so there is a true center row
  width?: number;
  align?: 'center' | 'left' | 'right';
  fontSize?: number;
  selectedFontSize?: number;
  // Called when the already-centered value is tapped (e.g. to type instead).
  onActivate?: () => void;
  // Wrap-around scrolling (…23 -> 00 -> 01…).
  loop?: boolean;
}

export function WheelPicker({
  values,
  selectedIndex,
  onChange,
  itemHeight = 44,
  visibleRows = 5,
  width,
  align = 'center',
  fontSize = 24,
  selectedFontSize = 28,
  onActivate,
  loop = false,
}: WheelPickerProps) {
  const theme = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  // Index we last emitted, to avoid scroll<->onChange feedback loops.
  const lastEmitted = useRef(selectedIndex);

  const n = values.length;
  const containerHeight = itemHeight * visibleRows;
  const spacer = ((visibleRows - 1) / 2) * itemHeight;

  // For loop mode, repeat the values so the user can scroll past either end; we
  // silently recenter to the middle copy after motion settles. Copies are
  // identical, so recentering is invisible.
  const copies = loop ? (n <= 5 ? 21 : 5) : 1;
  const homeStart = loop ? ((copies - 1) / 2) * n : 0;
  const rows = loop
    ? Array.from({ length: copies * n }, (_, i) => values[i % n])
    : values;

  const homeY = (index: number) => (homeStart + index) * itemHeight;

  // Keep the scroll position in sync when selectedIndex is changed externally
  // (initial mount, 12h/24h remap, etc.).
  useEffect(() => {
    if (selectedIndex !== lastEmitted.current) {
      lastEmitted.current = selectedIndex;
      scrollRef.current?.scrollTo({ y: homeY(selectedIndex), animated: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex, itemHeight]);

  // Snap to the selected row (middle copy in loop mode) on initial layout.
  const onContentReady = () => {
    scrollRef.current?.scrollTo({ y: homeY(selectedIndex), animated: false });
  };

  // Emit the normalized index and, in loop mode, recenter to the middle copy.
  // `recenter`: always after momentum, but on drag-end only when we've drifted
  // out of a safe band, so we never interrupt an Android fling mid-motion.
  const settle = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
    recenter: 'always' | 'ifDrifted',
  ) => {
    const raw = Math.round(e.nativeEvent.contentOffset.y / itemHeight);
    if (!loop) {
      const index = Math.max(0, Math.min(n - 1, raw));
      if (index !== lastEmitted.current) {
        lastEmitted.current = index;
        onChange(index);
      }
      return;
    }
    const norm = ((raw % n) + n) % n;
    if (norm !== lastEmitted.current) {
      lastEmitted.current = norm;
      onChange(norm);
    }
    const drifted = raw < homeStart - n || raw >= homeStart + 2 * n;
    if (recenter === 'always' || drifted) {
      scrollRef.current?.scrollTo({ y: homeY(norm), animated: false });
    }
  };

  const textAlign =
    align === 'left' ? 'left' : align === 'right' ? 'right' : 'center';

  return (
    <View style={[{ height: containerHeight, width }, styles.container]}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        bounces={false}
        nestedScrollEnabled
        onContentSizeChange={onContentReady}
        onMomentumScrollEnd={e => settle(e, 'always')}
        onScrollEndDrag={e => settle(e, 'ifDrifted')}
        contentContainerStyle={{ paddingVertical: spacer }}>
        {rows.map((value, i) => {
          const valueIndex = loop ? i % n : i;
          const isSelected = valueIndex === selectedIndex;
          // Pressable lives inside the ScrollView, so a drag still scrolls (RN
          // hands the gesture to the ScrollView); only a real tap fires onPress.
          return (
            <Pressable
              key={`${value}-${i}`}
              onPress={() => {
                if (isSelected) {
                  onActivate?.();
                } else {
                  scrollRef.current?.scrollTo({
                    y: i * itemHeight,
                    animated: true,
                  });
                }
              }}
              style={[styles.item, { height: itemHeight }]}>
              <Text
                style={[
                  styles.text,
                  {
                    textAlign,
                    color: isSelected ? theme.text : theme.disabled,
                    fontSize: isSelected ? selectedFontSize : fontSize,
                    fontWeight: isSelected ? '800' : '600',
                    opacity: isSelected ? 1 : 0.5,
                  },
                ]}>
                {value}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  item: {
    justifyContent: 'center',
  },
  text: {
    paddingHorizontal: 2,
  },
});
