import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Alarm } from '../types';
import { useSettings, useTheme } from '../context/SettingsContext';
import { usePremium } from '../context/PremiumContext';
import {
  pickRandomGenreId,
  pickRandomSongFromGenres,
  resolveGenres,
  genreLabel,
} from '../data/genres';
import { formatTime } from '../utils/time';
import { startVibration, stopVibration } from '../utils/vibration';
import {
  playAlarmSound,
  raiseAlarmVolume,
  restoreAlarmVolume,
  stopAlarmSound,
} from '../services/alarmSound';
import { NowPlaying } from '../services/nowPlaying';
import { playRandomTrackFromGenres, stopSpotify } from '../services/spotifyService';
import { log, warn } from '../utils/logger';
import { palette } from '../theme/palette';
import { font, radius, spacing, shadow } from '../theme/metrics';
import { Icon } from '../components/Icon';
import { t } from '../i18n';

interface AlarmRingScreenProps {
  alarm: Alarm;
  onStop: () => void;
  onSnooze: () => void;
}

const TRACK_SECONDS = 24; // simulated song length for the progress bar

export function AlarmRingScreen({ alarm, onStop, onSnooze }: AlarmRingScreenProps) {
  const insets = useSafeAreaInsets();
  const { settings } = useSettings();
  const theme = useTheme();
  const { isPremium } = usePremium();

  // Pick ONE random genre among the chosen set up front; it drives the label,
  // the gradient, and the playlist that actually plays, so they always match.
  const [pick] = useState(() => {
    const ids = resolveGenres(alarm, settings.defaultGenres);
    const gid = pickRandomGenreId(ids);
    return pickRandomSongFromGenres(gid ? [gid] : ids);
  });
  const genre = pick?.genre ?? null;

  // Real track playing via Spotify, when connected + playable.
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  // Drives the "Now Playing" card: connecting to Spotify, the real Spotify
  // track, or the bundled tone. We never show a random placeholder song, so the
  // title can't flash a wrong track before the real one loads.
  const [audioMode, setAudioMode] = useState<'loading' | 'spotify' | 'tone'>(
    settings.musicProvider === 'spotify' ? 'loading' : 'tone',
  );

  // What's driving playback, for the label: the user's own Spotify playlist
  // (premium) takes precedence and is labeled by its name — NOT by a random
  // genre, which isn't what's playing. Otherwise use the picked genre.
  const usingPlaylist = isPremium && !!alarm.spotifyUri;
  const sourceLabel = usingPlaylist
    ? alarm.spotifyUriName ?? null
    : genre
    ? genreLabel(genre)
    : null;

  // Vibrate for the duration of the ring; cancel on Stop/Snooze (unmount).
  useEffect(() => {
    if (alarm.vibrateEnabled) {
      startVibration(alarm.vibratePattern);
    }
    return () => stopVibration();
  }, [alarm.vibrateEnabled, alarm.vibratePattern]);

  // Force max volume and play audio while the ring screen is up: a Spotify
  // playlist when connected, otherwise the bundled tone (also the fallback if
  // Spotify can't play). Stop everything + restore volume on Stop/Snooze.
  useEffect(() => {
    let cancelled = false;
    raiseAlarmVolume(settings.alarmVolume);
    const genres = resolveGenres(alarm, settings.defaultGenres);
    log('ring', 'audio start', { provider: settings.musicProvider, genres });
    (async () => {
      if (settings.musicProvider === 'spotify') {
        log('ring', 'trying spotify…');
        // Premium-only: honor a specific song/playlist the user picked for this
        // alarm; free/lapsed users fall back to genres (then Liked Songs).
        const explicitUri = isPremium ? alarm.spotifyUri : undefined;
        // Play the same single genre shown in the label (not the first of the list).
        const np = await playRandomTrackFromGenres(
          genre ? [genre.id] : genres,
          explicitUri,
        );
        if (cancelled) {
          log('ring', 'cancelled before audio resolved');
          return;
        }
        log('ring', 'spotify result', np);
        if (np) {
          setNowPlaying(np); // show the real track that's now playing
          setAudioMode('spotify');
        } else {
          warn('ring', 'spotify returned null → ringtone fallback');
          // fallback ringtone (no device / Premium / token)
          setAudioMode('tone');
          playAlarmSound(settings.fallbackRingtoneUri, settings.alarmVolume);
        }
      } else {
        log('ring', 'ringtone path (no music provider)');
        playAlarmSound(settings.fallbackRingtoneUri, settings.alarmVolume);
      }
    })();
    return () => {
      cancelled = true;
      stopAlarmSound();
      stopSpotify();
      restoreAlarmVolume();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Looping progress bar to suggest a playing track.
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: TRACK_SECONDS * 1000,
        useNativeDriver: false,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [progress]);

  const colors = genre ? genre.colors : [palette.coralLight, palette.coralDeep];
  // Full-screen ring background follows the app's selected theme color.
  const bgColors = [theme.bannerFrom, theme.bannerTo];
  const time = formatTime(now.getHours(), now.getMinutes(), settings.timeFormat);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onStop}>
      <LinearGradient
        colors={bgColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}>
        <View
          style={[
            styles.inner,
            { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.xl },
          ]}>
        <View style={styles.top}>
          <Text style={styles.time}>{time}</Text>
          {!!alarm.label && <Text style={styles.label}>{alarm.label}</Text>}
        </View>

        <View style={styles.center}>
          <View style={[styles.art, shadow('raised')]}>
            {nowPlaying?.imageUrl ? (
              <Image
                source={{ uri: nowPlaying.imageUrl }}
                style={styles.artInner}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.artInner}>
                <Icon name="music" size={64} color="rgba(255,255,255,0.95)" />
              </LinearGradient>
            )}
          </View>

          {audioMode === 'spotify' ? (
            <>
              <Text style={styles.songTitle} numberOfLines={1}>
                {nowPlaying?.title || sourceLabel || t('now_playing')}
              </Text>
              <Text style={styles.songArtist} numberOfLines={1}>
                {nowPlaying?.artist ?? ''}
              </Text>
              <Text style={styles.songAlbum} numberOfLines={1}>
                {nowPlaying?.album ?? ''}
              </Text>
              <View style={styles.nowPlaying}>
                <Icon name="play" size={12} color={palette.white} />
                <Text style={styles.nowPlayingText}>
                  {sourceLabel ? `${sourceLabel} · ` : ''}{t('now_playing')}
                </Text>
              </View>
            </>
          ) : audioMode === 'loading' ? (
            <>
              <Text style={styles.songTitle} numberOfLines={1}>
                {sourceLabel ?? t('now_playing')}
              </Text>
              <Text style={styles.songArtist}>{t('starting_music')}</Text>
            </>
          ) : (
            <>
              <Text style={styles.songTitle}>{t('default_sound_title')}</Text>
              <Text style={styles.songArtist}>
                {t('default_sound_subtitle')}
              </Text>
            </>
          )}

          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width }]} />
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={onSnooze}
            android_ripple={{ color: 'rgba(255,255,255,0.25)' }}
            style={({ pressed }) => [
              styles.snooze,
              pressed && { opacity: 0.85 },
            ]}>
            <Text style={styles.snoozeText}>
              {t('snooze_minutes', { minutes: alarm.snoozeInterval ?? 5 })}
            </Text>
          </Pressable>
          <Pressable
            onPress={onStop}
            android_ripple={{ color: palette.ripple }}
            style={({ pressed }) => [styles.stop, pressed && { opacity: 0.9 }]}>
            <Text style={[styles.stopText, { color: bgColors[1] }]}>
              {t('stop')}
            </Text>
          </Pressable>
        </View>
        </View>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
  },
  top: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  time: {
    color: palette.white,
    fontSize: 56,
    fontWeight: '800',
    letterSpacing: -1,
  },
  label: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: font.title,
    fontWeight: '600',
  },
  center: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  art: {
    width: 200,
    height: 200,
    borderRadius: radius.xl,
    marginBottom: spacing.lg,
  },
  artInner: {
    flex: 1,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  songTitle: {
    color: palette.white,
    fontSize: font.h2,
    fontWeight: '800',
    textAlign: 'center',
  },
  songArtist: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: font.label,
    fontWeight: '500',
    textAlign: 'center',
  },
  songAlbum: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: font.caption,
    fontWeight: '500',
    textAlign: 'center',
  },
  nowPlaying: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  nowPlayingText: {
    color: palette.white,
    fontSize: font.caption,
    fontWeight: '600',
  },
  progressTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.white,
  },
  actions: {
    gap: spacing.md,
  },
  snooze: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.7)',
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  snoozeText: {
    color: palette.white,
    fontSize: font.label,
    fontWeight: '700',
  },
  stop: {
    backgroundColor: palette.white,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    ...shadow('raised'),
  },
  stopText: {
    fontSize: font.title,
    fontWeight: '800',
  },
});
