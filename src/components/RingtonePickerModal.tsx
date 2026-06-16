import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings, useTheme } from '../context/SettingsContext';
import { palette } from '../theme/palette';
import { font, radius, spacing } from '../theme/metrics';
import { PrimaryButton } from './PrimaryButton';
import { Icon } from './Icon';
import {
  Ringtone,
  listRingtones,
  playRingtone,
  stopRingtone,
} from '../services/ringtones';
import { t } from '../i18n';

interface RingtonePickerModalProps {
  visible: boolean;
  onClose: () => void;
}

export function RingtonePickerModal({
  visible,
  onClose,
}: RingtonePickerModalProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { settings, setFallbackRingtone } = useSettings();

  const [ringtones, setRingtones] = useState<Ringtone[]>([]);
  const [loading, setLoading] = useState(false);
  // The currently-selected uri (source of truth is the uri; '' => OS default).
  const [selectedUri, setSelectedUri] = useState<string>('');

  // Load the device ringtones + sync selection whenever the sheet opens.
  useEffect(() => {
    if (!visible) {
      return;
    }
    setSelectedUri(settings.fallbackRingtoneUri ?? '');
    setLoading(true);
    listRingtones()
      .then(setRingtones)
      .finally(() => setLoading(false));
  }, [visible, settings.fallbackRingtoneUri]);

  // Always stop any preview when the sheet is dismissed/unmounted.
  useEffect(() => {
    if (!visible) {
      stopRingtone();
    }
    return () => stopRingtone();
  }, [visible]);

  const select = (item: Ringtone) => {
    setSelectedUri(item.uri);
    // Preview at the user's chosen volume; replaces any prior preview.
    playRingtone(item.uri, settings.alarmVolume);
  };

  const apply = () => {
    stopRingtone();
    const chosen = ringtones.find(r => r.uri === selectedUri);
    if (selectedUri === '') {
      setFallbackRingtone(null, null); // OS default
    } else {
      setFallbackRingtone(selectedUri, chosen?.title ?? null);
    }
    onClose();
  };

  const cancel = () => {
    stopRingtone();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={cancel}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={cancel} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.background,
              paddingBottom: insets.bottom + spacing.lg,
            },
          ]}>
          <View style={[styles.grabber, { backgroundColor: theme.cardBorder }]} />
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: theme.text }]}>
              {t('fallback_ringtone')}
            </Text>
            <Pressable
              onPress={cancel}
              hitSlop={12}
              android_ripple={{ color: palette.ripple, borderless: true }}>
              <Icon name="close" size={22} color={theme.subtext} />
            </Pressable>
          </View>
          <Text style={[styles.subtitle, { color: theme.subtext }]}>
            {t('ringtone_picker_subtitle')}
          </Text>

          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={theme.accent} />
            </View>
          ) : ringtones.length === 0 ? (
            <View style={styles.loading}>
              <Text style={[styles.rowSub, { color: theme.subtext }]}>
                {t('no_ringtones')}
              </Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.list}>
              {ringtones.map((item, i) => {
                const isSelected = item.uri === selectedUri;
                return (
                  <Pressable
                    key={`${item.uri}-${i}`}
                    onPress={() => select(item)}
                    android_ripple={{ color: palette.ripple }}
                    style={[
                      styles.row,
                      {
                        borderColor: isSelected ? theme.accent : theme.cardBorder,
                        backgroundColor: theme.card,
                      },
                    ]}>
                    <View
                      style={[styles.swatch, { backgroundColor: theme.cardBorder }]}>
                      <Icon name="bell" size={18} color={theme.subtext} />
                    </View>
                    <Text
                      style={[styles.rowName, { color: theme.text }]}
                      numberOfLines={1}>
                      {item.title}
                    </Text>
                    {isSelected && (
                      <Icon name="check" size={20} color={theme.accent} />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          <PrimaryButton title={t('done')} variant="filled" onPress={apply} />
        </View>
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
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    maxHeight: '82%',
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: font.h2,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: font.body,
    fontWeight: '500',
    marginBottom: spacing.md,
  },
  loading: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowName: {
    flex: 1,
    fontSize: font.label,
    fontWeight: '700',
  },
  rowSub: {
    fontSize: font.caption,
    fontWeight: '500',
  },
});
