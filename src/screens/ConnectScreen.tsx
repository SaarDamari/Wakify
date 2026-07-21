import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MusicProvider } from '../types';
import { useSettings, useTheme } from '../context/SettingsContext';
import { useSpotifyAuth } from '../hooks/useSpotifyAuth';
import { palette } from '../theme/palette';
import { font, radius, spacing, shadow } from '../theme/metrics';
import { Icon } from '../components/Icon';
import { MusicProviderButton } from '../components/MusicProviderButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { GENRES, genreLabel } from '../data/genres';
import { t } from '../i18n';

type Step = 'provider' | 'genres';

export function ConnectScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { connectMusic, completeOnboarding, finishOnboarding } = useSettings();
  const spotify = useSpotifyAuth();
  const [step, setStep] = useState<Step>('provider');
  const [connecting, setConnecting] = useState<MusicProvider | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  const handleConnect = async (provider: MusicProvider) => {
    if (connecting) {
      return;
    }
    setConnecting(provider);
    try {
      // Real OAuth — opens the Spotify login page. Advance only on success.
      const err = await spotify.connect();
      if (!err) {
        connectMusic('spotify');
        setStep('genres');
      } else {
        Alert.alert(
          t('spotify_connect_failed_title'),
          err.message || t('spotify_connect_failed_body'),
        );
      }
    } finally {
      setConnecting(null);
    }
  };

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id],
    );
  };

  const container = [
    styles.container,
    {
      backgroundColor: theme.background,
      paddingTop: insets.top + spacing.xxl,
      paddingBottom: insets.bottom + spacing.xl,
    },
  ];

  if (step === 'genres') {
    return (
      <View style={container}>
        <View style={styles.playlistHeader}>
          <Text style={[styles.title, { color: theme.text }]}>
            {t('pick_genres_title')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.subtext }]}>
            {t('pick_genres_subtitle')}
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.playlistList}>
          {GENRES.map(genre => {
            const isSelected = selected.includes(genre.id);
            return (
              <Pressable
                key={genre.id}
                onPress={() => toggle(genre.id)}
                android_ripple={{ color: palette.ripple }}
                style={[
                  styles.genreRow,
                  {
                    borderColor: isSelected ? theme.accent : theme.cardBorder,
                    backgroundColor: theme.card,
                  },
                ]}>
                <LinearGradient
                  colors={genre.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.swatch}>
                  <Icon name="music" size={18} color={palette.white} />
                </LinearGradient>
                <Text style={[styles.genreName, { color: theme.text }]}>
                  {genreLabel(genre)}
                </Text>
                {isSelected && (
                  <Icon name="check" size={20} color={theme.accent} />
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.actions}>
          <PrimaryButton
            title={t('continue')}
            variant="filled"
            disabled={selected.length === 0}
            onPress={() => finishOnboarding(selected)}
          />
          <Pressable
            onPress={completeOnboarding}
            android_ripple={{ color: palette.ripple, borderless: true }}
            style={({ pressed }) => [styles.skip, pressed && { opacity: 0.6 }]}>
            <Text style={[styles.skipText, { color: theme.subtext }]}>
              {t('skip_for_now')}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={container}>
      <View style={styles.hero}>
        <LinearGradient
          colors={[theme.bannerFrom, theme.bannerTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.logo, shadow('raised')]}>
          <Icon name="bell" size={40} color={palette.white} />
        </LinearGradient>
        <Text style={[styles.title, { color: theme.text }]}>
          {t('welcome_title')}
        </Text>
        <Text style={[styles.subtitle, { color: theme.subtext }]}>
          {t('welcome_subtitle')}
        </Text>
      </View>

      <View style={styles.actions}>
        <MusicProviderButton
          provider="spotify"
          connecting={connecting === 'spotify'}
          onPress={() => handleConnect('spotify')}
        />

        <Pressable
          onPress={completeOnboarding}
          disabled={!!connecting}
          android_ripple={{ color: palette.ripple, borderless: true }}
          style={({ pressed }) => [styles.skip, pressed && { opacity: 0.6 }]}>
          <Text style={[styles.skipText, { color: theme.subtext }]}>
            {t('maybe_later')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: font.h1,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: font.label,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },
  playlistHeader: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  playlistList: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  genreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genreName: {
    flex: 1,
    fontSize: font.label,
    fontWeight: '700',
  },
  actions: {
    gap: spacing.md,
  },
  skip: {
    alignSelf: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
  },
  skipText: {
    fontSize: font.label,
    fontWeight: '600',
  },
});
