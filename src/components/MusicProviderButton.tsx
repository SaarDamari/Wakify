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
import { t } from '../i18n';

interface MusicProviderButtonProps {
  provider: MusicProvider;
  connecting?: boolean;
  onPress: () => void;
  compact?: boolean;
  badge?: string; // e.g. "PRO" — marks a paid feature
}

const META: Record<MusicProvider, { bg: string; icon: 'spotify' }> = {
  spotify: { bg: palette.spotifyGreen, icon: 'spotify' },
};

export function MusicProviderButton({
  provider,
  connecting = false,
  onPress,
  compact = false,
  badge,
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
          {connecting ? t('connecting') : t('connect_spotify')}
        </Text>
      </View>
      {!!badge && !connecting && (
        <View style={styles.badge}>
          <Icon name="crown" size={11} color={palette.navy} />
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
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
  badge: {
    position: 'absolute',
    top: 6,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: palette.premiumGold,
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: {
    color: palette.navy,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
