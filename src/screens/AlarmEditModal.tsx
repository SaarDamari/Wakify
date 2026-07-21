import React, { useEffect, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSheetTransition } from '../hooks/useSheetTransition';
import { Alarm, DayIndex, VibratePattern } from '../types';
import { AlarmDraft, useAlarms } from '../context/AlarmsContext';
import { useSettings, useTheme } from '../context/SettingsContext';
import { usePremium } from '../context/PremiumContext';
import { palette } from '../theme/palette';
import { font, radius, spacing } from '../theme/metrics';
import { TimeWheelPicker } from '../components/TimeWheelPicker';
import { DayCircles } from '../components/DayCircles';
import { Chip } from '../components/Chip';
import { Toggle } from '../components/Toggle';
import { PrimaryButton } from '../components/PrimaryButton';
import { CalendarModal } from '../components/CalendarModal';
import { GenrePicker } from '../components/GenrePicker';
import { PaywallModal } from '../components/PaywallModal';
import { SpotifyPickerModal } from '../components/SpotifyPickerModal';
import { Icon } from '../components/Icon';
import { genreNames, resolveGenres } from '../data/genres';
import { t } from '../i18n';
import { TranslationKey } from '../i18n/en';

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

// "2026-06-09" -> "Jun 9"
function formatOneOff(iso: string): string {
  const [, m, d] = iso.split('-').map(Number);
  return `${MONTHS_SHORT[m - 1]} ${d}`;
}

interface AlarmEditModalProps {
  visible: boolean;
  alarm?: Alarm; // undefined = add mode
  onClose: () => void;
  onPreview: (alarm: Alarm) => void;
}

const VIBRATE_PATTERNS: { labelKey: TranslationKey; value: VibratePattern }[] = [
  { labelKey: 'vibrate_default', value: 'default' },
  { labelKey: 'vibrate_gentle', value: 'gentle' },
  { labelKey: 'vibrate_medium', value: 'medium' },
  { labelKey: 'vibrate_strong', value: 'strong' },
];

const NUDGE_INTERVALS = [5, 10, 15, 30];

function emptyDraft(): AlarmDraft {
  return {
    hour: 7,
    minute: 0,
    label: '',
    days: [0, 1, 2, 3, 4],
    enabled: true,
    vibrateEnabled: true,
    vibratePattern: 'medium',
    nudgingEnabled: false,
    nudgeInterval: 5,
    snoozeInterval: 5,
    genres: undefined,
  };
}

export function AlarmEditModal({
  visible,
  alarm,
  onClose,
  onPreview,
}: AlarmEditModalProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { settings } = useSettings();
  const { isPremium } = usePremium();
  const { addAlarm, updateAlarm, removeAlarm } = useAlarms();

  const [draft, setDraft] = useState<AlarmDraft>(emptyDraft());
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [genreVisible, setGenreVisible] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [spotifyPickerVisible, setSpotifyPickerVisible] = useState(false);

  // Re-initialize the draft each time the modal opens.
  useEffect(() => {
    if (visible) {
      setDraft(alarm ? { ...alarm } : emptyDraft());
    }
  }, [visible, alarm]);

  // Picking weekdays and a one-off date are mutually exclusive modes.
  const toggleDay = (day: DayIndex) => {
    setDraft(prev => ({
      ...prev,
      oneOffDate: undefined,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day].sort((a, b) => a - b),
    }));
  };

  const selectOneOffDate = (iso: string) => {
    setDraft(prev => ({ ...prev, oneOffDate: iso, days: [] }));
  };

  const clearOneOffDate = () => {
    setDraft(prev => ({ ...prev, oneOffDate: undefined }));
  };

  const onSave = () => {
    if (alarm) {
      updateAlarm({ ...(draft as Alarm), id: alarm.id });
    } else {
      addAlarm(draft);
    }
    onClose();
  };

  const handlePreview = () => {
    onPreview({ ...(draft as Alarm), id: alarm?.id ?? 'preview' });
  };

  const handleDelete = () => {
    if (alarm) {
      removeAlarm(alarm.id);
    }
    onClose();
  };

  const connected = !!settings.musicProvider;
  const resolvedGenresText = draft.genres
    ? genreNames(draft.genres)
    : t('default_genres', {
        genres: genreNames(resolveGenres(draft, settings.defaultGenres)),
      });

  const { mounted, backdropStyle, sheetStyle } = useSheetTransition(visible);

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetWrapper}>
          <Animated.View
            style={[
              styles.sheet,
              sheetStyle,
              { backgroundColor: theme.background },
            ]}>
            <View
              style={[styles.grabber, { backgroundColor: theme.cardBorder }]}
            />
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: theme.text }]}>
                {alarm ? t('edit_alarm') : t('new_alarm')}
              </Text>
              {alarm && (
                <Pressable
                  onPress={handleDelete}
                  hitSlop={10}
                  android_ripple={{ color: palette.ripple, borderless: true }}
                  style={({ pressed }) => pressed && { opacity: 0.6 }}>
                  <Icon name="trash" size={22} color={theme.accent} />
                </Pressable>
              )}
            </View>
            <ScrollView
              style={styles.scroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}>
              <TimeWheelPicker
                hour={draft.hour}
                minute={draft.minute}
                timeFormat={settings.timeFormat}
                onChange={(hour, minute) =>
                  setDraft(prev => ({ ...prev, hour, minute }))
                }
              />

              <TextInput
                value={draft.label}
                onChangeText={label => setDraft(prev => ({ ...prev, label }))}
                placeholder={t('alarm_label_placeholder')}
                placeholderTextColor={theme.subtext}
                style={[
                  styles.input,
                  {
                    borderColor: theme.cardBorder,
                    color: theme.text,
                    backgroundColor: theme.card,
                  },
                ]}
              />

              <View style={styles.daysRow}>
                <View style={styles.daysCircles}>
                  <DayCircles
                    days={draft.days}
                    mode="select"
                    onToggle={toggleDay}
                    size={38}
                  />
                </View>
                <Pressable
                  onPress={() => setCalendarVisible(true)}
                  android_ripple={{ color: palette.ripple }}
                  style={[
                    styles.calendarButton,
                    {
                      borderColor: draft.oneOffDate
                        ? theme.accent
                        : theme.cardBorder,
                      backgroundColor: draft.oneOffDate
                        ? theme.accent
                        : theme.card,
                    },
                  ]}>
                  {draft.oneOffDate ? (
                    <Text style={styles.calendarDate}>
                      {formatOneOff(draft.oneOffDate)}
                    </Text>
                  ) : (
                    <Icon name="calendar" size={20} color={theme.subtext} />
                  )}
                </Pressable>
              </View>

              <View
                style={[styles.divider, { backgroundColor: theme.cardBorder }]}
              />

              <View style={styles.sectionRow}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  {t('wake_up_genres')}
                </Text>
                {connected && (
                  <Pressable
                    onPress={handlePreview}
                    android_ripple={{ color: palette.ripple, borderless: true }}
                    style={({ pressed }) => [
                      styles.previewBtn,
                      { borderColor: theme.cardBorder },
                      pressed && { opacity: 0.6 },
                    ]}>
                    <Icon name="play" size={13} color={theme.accent} />
                    <Text style={[styles.previewText, { color: theme.accent }]}>
                      {t('preview')}
                    </Text>
                  </Pressable>
                )}
              </View>
              {connected ? (
                <>
                  <Pressable
                    onPress={() => setGenreVisible(true)}
                    android_ripple={{ color: palette.ripple }}
                    style={[
                      styles.musicRow,
                      !!draft.spotifyUri && styles.inactiveRow,
                      {
                        borderColor: draft.spotifyUri
                          ? theme.cardBorder
                          : theme.accent,
                        backgroundColor: theme.card,
                      },
                    ]}>
                    <Icon name="music" size={18} color={theme.subtext} />
                    <Text
                      style={[
                        styles.musicName,
                        // When a Spotify playlist is the active source, show a
                        // muted placeholder so the user sees genres aren't in use.
                        { color: draft.spotifyUri ? theme.subtext : theme.text },
                      ]}
                      numberOfLines={1}>
                      {draft.spotifyUri
                        ? t('wake_up_genres')
                        : resolvedGenresText}
                    </Text>
                    <Icon name="chevronRight" size={18} color={theme.subtext} />
                  </Pressable>

                  {/* Premium feature: pick one of your own Spotify playlists.
                      Free users tap → paywall; premium → your playlists picker. */}
                  <Pressable
                    onPress={() =>
                      isPremium
                        ? setSpotifyPickerVisible(true)
                        : setPaywallVisible(true)
                    }
                    android_ripple={{ color: palette.ripple }}
                    style={[
                      styles.musicRow,
                      styles.spotifyRow,
                      !isPremium && styles.lockedRow,
                      {
                        borderColor:
                          isPremium && draft.spotifyUri
                            ? theme.accent
                            : theme.cardBorder,
                        backgroundColor: theme.card,
                      },
                    ]}>
                    <Icon name="crown" size={18} color={theme.subtext} />
                    <Text
                      style={[
                        styles.musicName,
                        { color: draft.spotifyUri ? theme.text : theme.subtext },
                      ]}
                      numberOfLines={1}>
                      {draft.spotifyUri
                        ? draft.spotifyUriName ?? t('spotify_playlist')
                        : t('wake_up_playlist')}
                    </Text>
                    {isPremium ? (
                      <Icon name="chevronRight" size={18} color={theme.subtext} />
                    ) : (
                      <View
                        style={[
                          styles.premiumPill,
                          { backgroundColor: theme.accent },
                        ]}>
                        <Text style={styles.premiumPillText}>{t('pro')}</Text>
                      </View>
                    )}
                  </Pressable>
                </>
              ) : (
                <Text style={[styles.musicHint, { color: theme.subtext }]}>
                  {t('connect_music_hint')}
                </Text>
              )}

              <View
                style={[styles.divider, { backgroundColor: theme.cardBorder }]}
              />

              <View style={styles.sectionRow}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  {t('vibrate')}
                </Text>
                <Toggle
                  value={draft.vibrateEnabled}
                  onValueChange={vibrateEnabled =>
                    setDraft(prev => ({ ...prev, vibrateEnabled }))
                  }
                />
              </View>
              {draft.vibrateEnabled && (
                <View style={styles.chips}>
                  {VIBRATE_PATTERNS.map(pattern => (
                    <Chip
                      key={pattern.value}
                      label={t(pattern.labelKey)}
                      selected={draft.vibratePattern === pattern.value}
                      onPress={() =>
                        setDraft(prev => ({
                          ...prev,
                          vibratePattern: pattern.value,
                        }))
                      }
                    />
                  ))}
                </View>
              )}

              <View
                style={[styles.divider, { backgroundColor: theme.cardBorder }]}
              />

              <View style={styles.sectionRow}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  {t('nudging')}
                </Text>
                <Toggle
                  value={draft.nudgingEnabled}
                  onValueChange={nudgingEnabled =>
                    setDraft(prev => ({ ...prev, nudgingEnabled }))
                  }
                />
              </View>
              {draft.nudgingEnabled && (
                <View style={styles.chips}>
                  {NUDGE_INTERVALS.map(minutes => (
                    <Chip
                      key={minutes}
                      label={t('minutes_short', { minutes })}
                      selected={(draft.nudgeInterval ?? 5) === minutes}
                      onPress={() =>
                        setDraft(prev => ({ ...prev, nudgeInterval: minutes }))
                      }
                    />
                  ))}
                </View>
              )}

              <View
                style={[styles.divider, { backgroundColor: theme.cardBorder }]}
              />

              <View style={styles.sectionRow}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  {t('snooze')}
                </Text>
              </View>
              <View style={styles.chips}>
                {NUDGE_INTERVALS.map(minutes => (
                  <Chip
                    key={minutes}
                    label={t('minutes_short', { minutes })}
                    selected={(draft.snoozeInterval ?? 5) === minutes}
                    onPress={() =>
                      setDraft(prev => ({ ...prev, snoozeInterval: minutes }))
                    }
                  />
                ))}
              </View>
            </ScrollView>

            <View
              style={[
                styles.footer,
                {
                  borderTopColor: theme.cardBorder,
                  paddingBottom: insets.bottom + 16,
                },
              ]}>
              <PrimaryButton
                title={t('cancel')}
                variant="outline"
                onPress={onClose}
                style={styles.footerButton}
              />
              <PrimaryButton
                title={t('save_alarm')}
                variant="filled"
                onPress={onSave}
                style={styles.footerButton}
              />
            </View>
          </Animated.View>
        </KeyboardAvoidingView>

        <CalendarModal
          visible={calendarVisible}
          selected={draft.oneOffDate}
          onClose={() => setCalendarVisible(false)}
          onSelect={selectOneOffDate}
          onClear={clearOneOffDate}
        />
        <GenrePicker
          visible={genreVisible}
          value={draft.genres ?? null}
          allowUseDefault
          onChange={genres =>
            // Choosing genres switches the source away from a Spotify playlist.
            setDraft(prev => ({
              ...prev,
              genres: genres ?? undefined,
              spotifyUri: undefined,
              spotifyUriName: undefined,
            }))
          }
          onClose={() => setGenreVisible(false)}
        />
        <PaywallModal
          visible={paywallVisible}
          onClose={() => setPaywallVisible(false)}
        />
        <SpotifyPickerModal
          visible={spotifyPickerVisible}
          value={draft.spotifyUri}
          onSelect={(uri, name) => {
            setDraft(prev => ({
              ...prev,
              spotifyUri: uri,
              spotifyUriName: name,
            }));
            setSpotifyPickerVisible(false);
          }}
          onClear={() => {
            setDraft(prev => ({
              ...prev,
              spotifyUri: undefined,
              spotifyUriName: undefined,
            }));
            setSpotifyPickerVisible(false);
          }}
          onClose={() => setSpotifyPickerVisible(false)}
        />
        </View>
      </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheetWrapper: {
    maxHeight: '92%',
  },
  sheet: {
    flexShrink: 1,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: 'hidden',
  },
  scroll: {
    flexShrink: 1,
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  sheetTitle: {
    fontSize: font.title,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: font.label,
  },
  daysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  daysCircles: {
    flex: 1,
  },
  calendarButton: {
    minWidth: 46,
    height: 46,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDate: {
    color: palette.white,
    fontSize: font.body,
    fontWeight: '700',
  },
  divider: {
    height: 1,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: font.title,
    fontWeight: '700',
  },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  previewText: {
    fontSize: font.body,
    fontWeight: '700',
  },
  musicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  lockedRow: {
    marginTop: spacing.sm,
    opacity: 0.7,
  },
  spotifyRow: {
    marginTop: spacing.sm,
  },
  inactiveRow: {
    opacity: 0.5,
  },
  premiumPill: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  premiumPillText: {
    color: palette.white,
    fontSize: font.caption,
    fontWeight: '800',
  },
  musicName: {
    flex: 1,
    fontSize: font.label,
    fontWeight: '600',
  },
  musicHint: {
    fontSize: font.body,
    fontWeight: '500',
    lineHeight: 20,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  footerButton: {
    minWidth: 130,
  },
});
