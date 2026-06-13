import React from 'react';
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
import { Playlist, PLAYLISTS } from '../data/playlists';
import { useTheme } from '../context/SettingsContext';
import { palette } from '../theme/palette';
import { font, radius, spacing } from '../theme/metrics';
import { Icon } from './Icon';

interface PlaylistRowProps {
  playlist: Playlist;
  selected: boolean;
  onPress: () => void;
}

export function PlaylistRow({ playlist, selected, onPress }: PlaylistRowProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: palette.ripple }}
      style={({ pressed }) => [
        styles.row,
        {
          borderColor: selected ? theme.accent : theme.cardBorder,
          backgroundColor: theme.card,
        },
        pressed && { opacity: 0.85 },
      ]}>
      <LinearGradient
        colors={playlist.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cover}>
        <Icon name="music" size={20} color={palette.white} />
      </LinearGradient>
      <View style={styles.rowText}>
        <Text style={[styles.rowName, { color: theme.text }]}>
          {playlist.name}
        </Text>
        <Text style={[styles.rowSub, { color: theme.subtext }]}>
          {playlist.subtitle} · {playlist.songs.length} songs
        </Text>
      </View>
      {selected && <Icon name="check" size={20} color={theme.accent} />}
    </Pressable>
  );
}

interface PlaylistPickerProps {
  visible: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onClose: () => void;
  includeDefaultOption?: boolean;
}

export function PlaylistPicker({
  visible,
  selectedId,
  onSelect,
  onClose,
  includeDefaultOption = false,
}: PlaylistPickerProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

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
              Wake-up Playlist
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
            {includeDefaultOption && (
              <Pressable
                onPress={() => {
                  onSelect(null);
                  onClose();
                }}
                android_ripple={{ color: palette.ripple }}
                style={({ pressed }) => [
                  styles.row,
                  {
                    borderColor:
                      selectedId === null ? theme.accent : theme.cardBorder,
                    backgroundColor: theme.card,
                  },
                  pressed && { opacity: 0.85 },
                ]}>
                <View
                  style={[styles.cover, { backgroundColor: theme.cardBorder }]}>
                  <Icon name="music" size={20} color={theme.subtext} />
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowName, { color: theme.text }]}>
                    Use default playlist
                  </Text>
                  <Text style={[styles.rowSub, { color: theme.subtext }]}>
                    Follow the app-wide default
                  </Text>
                </View>
                {selectedId === null && (
                  <Icon name="check" size={20} color={theme.accent} />
                )}
              </Pressable>
            )}

            {PLAYLISTS.map(playlist => (
              <PlaylistRow
                key={playlist.id}
                playlist={playlist}
                selected={selectedId === playlist.id}
                onPress={() => {
                  onSelect(playlist.id);
                  onClose();
                }}
              />
            ))}
          </ScrollView>
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
    maxHeight: '80%',
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
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  cover: {
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
});
