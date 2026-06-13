import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../context/SettingsContext';
import { palette } from '../theme/palette';
import { font, radius, spacing, shadow } from '../theme/metrics';
import { PrimaryButton } from './PrimaryButton';
import { Icon } from './Icon';

interface ExitConfirmModalProps {
  visible: boolean;
  onStay: () => void;
  onLeave: () => void;
}

// App-themed replacement for the OS "are you sure" dialog shown when the user
// presses back to exit. Explains that keeping Wakify open lets the alarm play
// its Spotify song.
export function ExitConfirmModal({
  visible,
  onStay,
  onLeave,
}: ExitConfirmModalProps) {
  const theme = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onStay}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onStay} />
        <View
          style={[
            styles.card,
            { backgroundColor: theme.background },
            shadow('raised'),
          ]}>
          <LinearGradient
            colors={[theme.bannerFrom, theme.bannerTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.badge, shadow('raised')]}>
            <Icon name="music" size={32} color={palette.white} />
          </LinearGradient>

          <Text style={[styles.title, { color: theme.text }]}>
            Are you sure you want to leave?
          </Text>
          <Text style={[styles.body, { color: theme.subtext }]}>
            Keep Wakify open in the background so your alarm can play its Spotify
            song. If you fully close the app, the alarm may not play your music.
          </Text>

          <PrimaryButton
            title="Stay"
            variant="filled"
            onPress={onStay}
            style={styles.stay}
          />
          <Pressable
            onPress={onLeave}
            android_ripple={{ color: palette.ripple, borderless: true }}
            style={({ pressed }) => [styles.leave, pressed && { opacity: 0.6 }]}>
            <Text style={[styles.leaveText, { color: theme.subtext }]}>
              Leave anyway
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: font.h2,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: font.label,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  stay: {
    alignSelf: 'stretch',
  },
  leave: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
  },
  leaveText: {
    fontSize: font.label,
    fontWeight: '600',
  },
});
