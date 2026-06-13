import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GENRES } from '../data/genres';
import { useTheme } from '../context/SettingsContext';
import { palette } from '../theme/palette';
import { font, radius, spacing } from '../theme/metrics';
import { PrimaryButton } from './PrimaryButton';
import { Icon } from './Icon';

interface GenrePickerProps {
  visible: boolean;
  value: string[] | null;
  onChange: (genres: string[] | null) => void;
  onClose: () => void;
  allowUseDefault?: boolean;
}

export function GenrePicker({
  visible,
  value,
  onChange,
  onClose,
  allowUseDefault = false,
}: GenrePickerProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // useDefault mode is active when value is null and the option is allowed.
  const [useDefault, setUseDefault] = useState(allowUseDefault && value === null);
  const [selected, setSelected] = useState<string[]>(value ?? []);
  const [hint, setHint] = useState<string | null>(null);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      setUseDefault(allowUseDefault && value === null);
      setSelected(value ?? []);
      setHint(null);
    }
  }, [visible, value, allowUseDefault]);

  const showHint = (message: string) => {
    setHint(message);
    if (hintTimer.current) {
      clearTimeout(hintTimer.current);
    }
    hintTimer.current = setTimeout(() => setHint(null), 1600);
  };

  const toggle = (id: string) => {
    const isRemoving = !useDefault && selected.includes(id);
    // Enforce at least one genre when in custom mode.
    if (isRemoving && selected.length <= 1) {
      showHint('At least one genre is required');
      return;
    }
    setUseDefault(false);
    setSelected(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id],
    );
  };

  const apply = () => {
    onChange(useDefault ? null : selected);
    onClose();
  };

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
              Wake-up Genres
            </Text>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              android_ripple={{ color: palette.ripple, borderless: true }}>
              <Icon name="close" size={22} color={theme.subtext} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}>
            {allowUseDefault && (
              <Pressable
                onPress={() => {
                  setUseDefault(true);
                  setSelected([]);
                }}
                android_ripple={{ color: palette.ripple }}
                style={[
                  styles.row,
                  {
                    borderColor: useDefault ? theme.accent : theme.cardBorder,
                    backgroundColor: theme.card,
                  },
                ]}>
                <View style={[styles.swatch, { backgroundColor: theme.cardBorder }]}>
                  <Icon name="music" size={18} color={theme.subtext} />
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowName, { color: theme.text }]}>
                    Use default genres
                  </Text>
                  <Text style={[styles.rowSub, { color: theme.subtext }]}>
                    Follow the app-wide setting
                  </Text>
                </View>
                {useDefault && (
                  <Icon name="check" size={20} color={theme.accent} />
                )}
              </Pressable>
            )}

            {GENRES.map(genre => {
              const isSelected = !useDefault && selected.includes(genre.id);
              return (
                <Pressable
                  key={genre.id}
                  onPress={() => toggle(genre.id)}
                  android_ripple={{ color: palette.ripple }}
                  style={[
                    styles.row,
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
                  <View style={styles.rowText}>
                    <Text style={[styles.rowName, { color: theme.text }]}>
                      {genre.name}
                    </Text>
                    <Text style={[styles.rowSub, { color: theme.subtext }]}>
                      {genre.songs.length} songs
                    </Text>
                  </View>
                  {isSelected && (
                    <Icon name="check" size={20} color={theme.accent} />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          {hint && (
            <View style={[styles.hint, { backgroundColor: theme.text }]}>
              <Text style={styles.hintText}>{hint}</Text>
            </View>
          )}

          <PrimaryButton title="Done" variant="filled" onPress={apply} />
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
    marginBottom: spacing.md,
  },
  title: {
    fontSize: font.h2,
    fontWeight: '800',
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
    width: 44,
    height: 44,
    borderRadius: radius.md,
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
  hint: {
    alignSelf: 'center',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  hintText: {
    color: palette.white,
    fontSize: font.body,
    fontWeight: '600',
  },
});
