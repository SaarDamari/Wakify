import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/SettingsContext';
import { palette } from '../theme/palette';
import { font, radius, spacing } from '../theme/metrics';
import { Icon } from './Icon';
import { SpotifyItem, getMyPlaylists } from '../services/spotifyApi';
import { t } from '../i18n';

interface SpotifyPickerModalProps {
  visible: boolean;
  value?: string; // currently-selected playlist uri
  onSelect: (uri: string, name: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export function SpotifyPickerModal({
  visible,
  value,
  onSelect,
  onClear,
  onClose,
}: SpotifyPickerModalProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<SpotifyItem[]>([]);
  const [loading, setLoading] = useState(false);
  // Guards against out-of-order async results overwriting newer ones.
  const reqId = useRef(0);

  // Load the user's playlists each time the sheet opens.
  useEffect(() => {
    if (!visible) {
      return;
    }
    const id = ++reqId.current;
    setItems([]);
    setLoading(true);
    getMyPlaylists().then(result => {
      if (id !== reqId.current) {
        return;
      }
      setItems(result);
      setLoading(false);
    });
  }, [visible]);

  const empty = !loading && items.length === 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
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
              {t('your_playlists')}
            </Text>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              android_ripple={{ color: palette.ripple, borderless: true }}>
              <Icon name="close" size={22} color={theme.subtext} />
            </Pressable>
          </View>

          {!!value && (
            <Pressable
              onPress={onClear}
              android_ripple={{ color: palette.ripple }}
              style={[styles.clearRow, { borderColor: theme.cardBorder }]}>
              <Icon name="music" size={16} color={theme.accent} />
              <Text style={[styles.clearText, { color: theme.accent }]}>
                {t('use_genres_instead')}
              </Text>
            </Pressable>
          )}

          {loading ? (
            <View style={styles.state}>
              <ActivityIndicator color={theme.accent} />
            </View>
          ) : empty ? (
            <View style={styles.state}>
              <Text style={[styles.stateText, { color: theme.subtext }]}>
                {t('no_playlists')}
              </Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.list}>
              {items.map((item, i) => {
                const selected = item.uri === value;
                return (
                  <Pressable
                    key={`${item.uri}-${i}`}
                    onPress={() => onSelect(item.uri, item.name)}
                    android_ripple={{ color: palette.ripple }}
                    style={[
                      styles.row,
                      {
                        borderColor: selected ? theme.accent : theme.cardBorder,
                        backgroundColor: theme.card,
                      },
                    ]}>
                    {item.imageUrl ? (
                      <Image source={{ uri: item.imageUrl }} style={styles.art} />
                    ) : (
                      <View style={[styles.art, { backgroundColor: theme.cardBorder }]}>
                        <Icon name="music" size={18} color={theme.subtext} />
                      </View>
                    )}
                    <View style={styles.rowText}>
                      <Text
                        style={[styles.rowName, { color: theme.text }]}
                        numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text
                        style={[styles.rowSub, { color: theme.subtext }]}
                        numberOfLines={1}>
                        {item.subtitle}
                      </Text>
                    </View>
                    {selected && (
                      <Icon name="check" size={20} color={theme.accent} />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
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
    maxHeight: '86%',
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
    marginBottom: spacing.md,
  },
  title: {
    fontSize: font.h2,
    fontWeight: '800',
  },
  clearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  clearText: {
    fontSize: font.body,
    fontWeight: '700',
  },
  state: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  stateText: {
    fontSize: font.body,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
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
    padding: spacing.sm,
  },
  art: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  rowName: {
    fontSize: font.label,
    fontWeight: '700',
  },
  rowSub: {
    fontSize: font.caption,
    fontWeight: '500',
    marginTop: 1,
  },
});
