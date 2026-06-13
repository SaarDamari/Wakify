import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/SettingsContext';
import { palette } from '../theme/palette';
import { font, radius, spacing, shadow } from '../theme/metrics';
import { PrimaryButton } from './PrimaryButton';
import { Icon } from './Icon';

interface PremiumModalProps {
  visible: boolean;
  onClose: () => void;
}

const CROWN_GOLD = '#F7CE68';

// Presented as a native Modal so it stacks reliably on iOS New Architecture;
// in-tree absolute overlays inside the parent Modal break hit-testing (frozen UI).
export function PremiumModal({ visible, onClose }: PremiumModalProps) {
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
      {/* Plain View owns the sheet's layout; the gradient is a background only
          so it can't break text wrapping on the New Architecture. */}
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}>
        <LinearGradient
          colors={[palette.navy, palette.navyAlt]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sheetBackground}
        />
        <View style={styles.grabber} />

        <View style={styles.badge}>
          <Icon name="crown" size={40} color={CROWN_GOLD} />
        </View>

        <Text style={styles.title}>Unlock Premium</Text>
        <Text style={styles.body}>
          Choosing a specific song or curated playlist for your alarm is a
          Premium feature. Free alarms wake you with a random track from your
          chosen genres.
        </Text>

        <PrimaryButton
          title="Close"
          variant="filled"
          onPress={onClose}
          style={[styles.close, { backgroundColor: theme.accent }]}
        />
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    width: '100%',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    alignItems: 'center',
    overflow: 'hidden',
  },
  sheetBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: spacing.xl,
  },
  badge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(247,206,104,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadow('raised'),
  },
  title: {
    color: palette.white,
    fontSize: font.h1,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  body: {
    alignSelf: 'stretch',
    color: 'rgba(255,255,255,0.8)',
    fontSize: font.label,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xl,
  },
  close: {
    alignSelf: 'stretch',
  },
});
