import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions } from 'react-native';

const SCREEN_H = Dimensions.get('window').height;

// Smooth open/close for bottom-sheet modals: a spring slide-up on enter and a
// quick slide-down + backdrop fade on exit, replacing RN Modal's stiff built-in
// `animationType="slide"`. Keep the Modal mounted (`mounted`) until the exit
// animation finishes so the close is animated too.
export function useSheetTransition(visible: boolean) {
  const [mounted, setMounted] = useState(visible);
  const translateY = useRef(new Animated.Value(visible ? 0 : SCREEN_H)).current;
  const backdrop = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 24,
          stiffness: 260,
          mass: 0.9,
        }),
        Animated.timing(backdrop, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_H,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdrop, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setMounted(false);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return {
    mounted,
    backdropStyle: { opacity: backdrop },
    sheetStyle: { transform: [{ translateY }] },
  };
}
