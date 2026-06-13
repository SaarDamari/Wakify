import React, { useRef, useState } from 'react';
import {
  GestureResponderEvent,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '../context/SettingsContext';
import { font, spacing } from '../theme/metrics';
import { Icon } from './Icon';

interface VolumeSliderProps {
  value: number; // 0–1
  onChange: (value: number) => void; // fired on release / tap (persist once)
}

const TRACK_HEIGHT = 6;
const THUMB = 24;

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

// Continuous, themed volume slider with no native dependency. Internal state
// drives the smooth drag; onChange is called on release/tap so we persist once
// per adjustment rather than on every move.
export function VolumeSlider({ value, onChange }: VolumeSliderProps) {
  const theme = useTheme();
  const widthRef = useRef(0);
  const [pos, setPos] = useState(clamp01(value));
  const draggingRef = useRef(false);
  // Adjust the visual when the prop changes externally and we're not dragging
  // (React's "adjust state on prop change during render" pattern — converges).
  const [lastValue, setLastValue] = useState(clamp01(value));
  if (!draggingRef.current && clamp01(value) !== lastValue) {
    setLastValue(clamp01(value));
    setPos(clamp01(value));
  }

  const ratioFromEvent = (e: GestureResponderEvent) => {
    const w = widthRef.current || 1;
    return clamp01(e.nativeEvent.locationX / w);
  };

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: e => {
        draggingRef.current = true;
        setPos(ratioFromEvent(e));
      },
      onPanResponderMove: e => setPos(ratioFromEvent(e)),
      onPanResponderRelease: e => {
        const next = ratioFromEvent(e);
        draggingRef.current = false;
        setPos(next);
        onChange(next);
      },
      onPanResponderTerminate: () => {
        draggingRef.current = false;
      },
    }),
  ).current;

  const pct = Math.round(pos * 100);

  return (
    <View>
      <View style={styles.row}>
        <Icon name="music" size={16} color={theme.subtext} />
        <View
          style={styles.trackArea}
          onLayout={e => {
            widthRef.current = e.nativeEvent.layout.width;
          }}
          {...responder.panHandlers}>
          <View
            style={[
              styles.track,
              { backgroundColor: theme.cardBorder },
            ]}>
            <View
              style={[
                styles.fill,
                { backgroundColor: theme.accent, width: `${pos * 100}%` },
              ]}
            />
          </View>
          <View
            style={[
              styles.thumb,
              {
                backgroundColor: theme.accent,
                borderColor: theme.background,
                left: `${pos * 100}%`,
                marginLeft: -THUMB / 2,
              },
            ]}
          />
        </View>
        <Text style={[styles.pct, { color: theme.text }]}>{pct}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  trackArea: {
    flex: 1,
    height: THUMB,
    justifyContent: 'center',
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    overflow: 'hidden',
  },
  fill: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
  },
  thumb: {
    position: 'absolute',
    top: (THUMB - THUMB) / 2,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    borderWidth: 3,
  },
  pct: {
    width: 44,
    textAlign: 'right',
    fontSize: font.body,
    fontWeight: '700',
  },
});
