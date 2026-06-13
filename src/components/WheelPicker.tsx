import React, { useEffect, useRef } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
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
}

export function WheelPicker({
  values,
  selectedIndex,
  onChange,
  itemHeight = 44,
  visibleRows = 5,
  width,
  align = 'center',
}: WheelPickerProps) {
  const theme = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  // Index we last emitted, to avoid scroll<->onChange feedback loops.
  const lastEmitted = useRef(selectedIndex);

  const containerHeight = itemHeight * visibleRows;
  const spacer = ((visibleRows - 1) / 2) * itemHeight;

  // Keep the scroll position in sync when selectedIndex is changed externally
  // (initial mount, 12h/24h remap, etc.).
  useEffect(() => {
    if (selectedIndex !== lastEmitted.current) {
      lastEmitted.current = selectedIndex;
      scrollRef.current?.scrollTo({
        y: selectedIndex * itemHeight,
        animated: false,
      });
    }
  }, [selectedIndex, itemHeight]);

  // Snap to the nearest row on initial layout.
  const onContentReady = () => {
    scrollRef.current?.scrollTo({
      y: selectedIndex * itemHeight,
      animated: false,
    });
  };

  const settle = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    let index = Math.round(y / itemHeight);
    index = Math.max(0, Math.min(values.length - 1, index));
    if (index !== lastEmitted.current) {
      lastEmitted.current = index;
      onChange(index);
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
        onMomentumScrollEnd={settle}
        onScrollEndDrag={settle}
        contentContainerStyle={{ paddingVertical: spacer }}>
        {values.map((value, index) => {
          const isSelected = index === selectedIndex;
          return (
            <View key={`${value}-${index}`} style={[styles.item, { height: itemHeight }]}>
              <Text
                style={[
                  styles.text,
                  {
                    textAlign,
                    color: isSelected ? theme.text : theme.disabled,
                    fontSize: isSelected ? 28 : 24,
                    fontWeight: isSelected ? '800' : '600',
                    opacity: isSelected ? 1 : 0.5,
                  },
                ]}>
                {value}
              </Text>
            </View>
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
    paddingHorizontal: 8,
  },
});
