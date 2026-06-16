import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/SettingsContext';
import { usePremium } from '../context/PremiumContext';
import { palette } from '../theme/palette';
import { font, radius, spacing, shadow } from '../theme/metrics';
import { PrimaryButton } from './PrimaryButton';
import { Icon } from './Icon';
import { t } from '../i18n';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onPurchased?: () => void; // continue the original action after upgrade
}

const BENEFITS = [
  t('benefit_playlists'),
  t('benefit_pick_any'),
  t('benefit_unlimited'),
  t('benefit_no_ads'),
];

export function PaywallModal({
  visible,
  onClose,
  onPurchased,
}: PaywallModalProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { setPremium } = usePremium();

  const upgrade = () => {
    // Mock purchase. TODO(revenuecat): replace with
    // Purchases.purchasePackage(pkg) and only flip on a successful entitlement.
    setPremium(true);
    onClose();
    onPurchased?.();
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
              paddingBottom: insets.bottom + spacing.xl,
            },
          ]}>
          <View style={[styles.grabber, { backgroundColor: theme.cardBorder }]} />

          <LinearGradient
            colors={[theme.bannerFrom, theme.bannerTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.badge, shadow('raised')]}>
            <Icon name="crown" size={36} color={palette.white} />
          </LinearGradient>

          <Text style={[styles.title, { color: theme.text }]}>
            {t('premium_title')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.subtext }]}>
            {t('premium_subtitle')}
          </Text>

          <View style={styles.benefits}>
            {BENEFITS.map(benefit => (
              <View key={benefit} style={styles.benefitRow}>
                <View
                  style={[styles.benefitCheck, { backgroundColor: theme.accent }]}>
                  <Icon name="check" size={14} color={palette.white} />
                </View>
                <Text style={[styles.benefitText, { color: theme.text }]}>
                  {benefit}
                </Text>
              </View>
            ))}
          </View>

          <PrimaryButton
            title={t('upgrade_now')}
            variant="filled"
            onPress={upgrade}
            style={styles.cta}
          />
          <Pressable
            onPress={onClose}
            android_ripple={{ color: palette.ripple, borderless: true }}
            style={({ pressed }) => [styles.later, pressed && { opacity: 0.6 }]}>
            <Text style={[styles.laterText, { color: theme.subtext }]}>
              {t('maybe_later')}
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
    marginBottom: spacing.lg,
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: font.h2,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: font.label,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  benefits: {
    alignSelf: 'stretch',
    gap: spacing.md,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xs,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  benefitCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    flex: 1,
    fontSize: font.label,
    fontWeight: '600',
  },
  cta: {
    alignSelf: 'stretch',
  },
  later: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
  },
  laterText: {
    fontSize: font.label,
    fontWeight: '600',
  },
});
