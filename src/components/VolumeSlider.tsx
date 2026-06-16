import React, { useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
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
  const trackRef = useRef<View>(null);
  const widthRef = useRef(0);
  // Track's left edge in window coordinates — the basis for mapping the touch.
  const trackLeftRef = useRef(0);
  const [pos, setPos] = useState(clamp01(value));
  const draggingRef = useRef(false);
  // Adjust the visual when the prop changes externally and we're not dragging
  // (React's "adjust state on prop change during render" pattern — converges).
  const [lastValue, setLastValue] = useState(clamp01(value));
  if (!draggingRef.current && clamp01(value) !== lastValue) {
    setLastValue(clamp01(value));
    setPos(clamp01(value));
  }

  // Capture the track's absolute geometry; used to convert a touch's screen X
  // into a 0–1 ratio. (Re-measured on grant in case the sheet moved.)
  const measureTrack = () => {
    trackRef.current?.measureInWindow((x, _y, w) => {
      trackLeftRef.current = x;
      if (w) {
        widthRef.current = w;
      }
    });
  };

  // Map an absolute (page) X to a 0–1 ratio. Using the gesture's absolute X
  // (not nativeEvent.locationX, which is relative to whichever child — e.g. the
  // moving thumb — is under the finger) is what keeps the value from bouncing.
  // The track is forced LTR (see trackArea), so right is always 100%, including
  // in Hebrew/RTL.
  const ratioFromX = (absX: number) =>
    clamp01((absX - trackLeftRef.current) / (widthRef.current || 1));

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_e, g) => {
        draggingRef.current = true;
        measureTrack();
        setPos(ratioFromX(g.x0));
      },
      onPanResponderMove: (_e, g) => setPos(ratioFromX(g.moveX)),
      onPanResponderRelease: (_e, g) => {
        const next = ratioFromX(g.moveX || g.x0);
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
          ref={trackRef}
          style={styles.trackArea}
          onLayout={e => {
            widthRef.current = e.nativeEvent.layout.width;
            measureTrack();
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
    // Keep the slider left-to-right (fill from left, right = 100%) even in RTL,
    // so the fill anchors to the physical left and dragging right raises volume.
    direction: 'ltr',
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
