import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/SettingsContext';
import { palette } from '../theme/palette';
import { font, radius, spacing, shadow } from '../theme/metrics';
import { PrimaryButton } from './PrimaryButton';
import { Icon } from './Icon';

interface PermissionPrimerModalProps {
  visible: boolean;
  onAllow: () => void;
  onDismiss: () => void;
}

export function PermissionPrimerModal({
  visible,
  onAllow,
  onDismiss,
}: PermissionPrimerModalProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onDismiss} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.background,
              paddingBottom: insets.bottom + spacing.xl,
            },
          ]}>
          <View style={[styles.grabber, { backgroundColor: theme.cardBorder }]} />

          <LinearGradient
            colors={[theme.bannerFrom, theme.bannerTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.badge, shadow('raised')]}>
            <Icon name="shield" size={36} color={palette.white} />
          </LinearGradient>

          <Text style={[styles.title, { color: theme.text }]}>
            Wake up on time
          </Text>
          <Text style={[styles.body, { color: theme.subtext }]}>
            To wake you up with great music, we need your permission to send
            notifications and sound alarms.
          </Text>

          <PrimaryButton
            title="Allow"
            variant="filled"
            onPress={onAllow}
            style={styles.allow}
          />
          <Pressable
            onPress={onDismiss}
            android_ripple={{ color: palette.ripple, borderless: true }}
            style={({ pressed }) => [styles.notNow, pressed && { opacity: 0.6 }]}>
            <Text style={[styles.notNowText, { color: theme.subtext }]}>
              Not now
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
    alignItems: 'center',
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.xl,
  },
  badge: {
    width: 72,
    height: 72,
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
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  allow: {
    alignSelf: 'stretch',
  },
  notNow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
  },
  notNowText: {
    fontSize: font.label,
    fontWeight: '600',
  },
});
