import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MusicProvider } from '../types';
import { palette } from '../theme/palette';
import { radius, spacing, shadow } from '../theme/metrics';
import { Icon } from './Icon';

interface MusicProviderButtonProps {
  provider: MusicProvider;
  connecting?: boolean;
  onPress: () => void;
  compact?: boolean;
}

const META: Record<
  MusicProvider,
  { label: string; bg: string; icon: 'apple' | 'spotify' }
> = {
  apple: { label: 'Connect Apple Music', bg: palette.appleBlack, icon: 'apple' },
  spotify: { label: 'Connect Spotify', bg: palette.spotifyGreen, icon: 'spotify' },
};

export function MusicProviderButton({
  provider,
  connecting = false,
  onPress,
  compact = false,
}: MusicProviderButtonProps) {
  const meta = META[provider];

  return (
    <Pressable
      onPress={onPress}
      disabled={connecting}
      android_ripple={{ color: 'rgba(255,255,255,0.18)' }}
      style={({ pressed }) => [
        styles.button,
        compact && styles.compact,
        { backgroundColor: meta.bg },
        shadow('card'),
        pressed && { opacity: 0.9 },
      ]}>
      <View style={styles.content}>
        {connecting ? (
          <ActivityIndicator color={palette.brandText} size="small" />
        ) : (
          <Icon name={meta.icon} size={compact ? 20 : 22} color={palette.brandText} />
        )}
        <Text style={[styles.label, compact && styles.labelCompact]}>
          {connecting ? 'Connecting…' : meta.label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compact: {
    paddingVertical: spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  label: {
    color: palette.brandText,
    fontSize: 16,
    fontWeight: '700',
  },
  labelCompact: {
    fontSize: 14,
  },
});
