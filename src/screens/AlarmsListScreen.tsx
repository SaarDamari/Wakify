import React, { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Alarm } from '../types';
import { useAlarms } from '../context/AlarmsContext';
import { useTheme } from '../context/SettingsContext';
import { computeNextAlarm } from '../utils/nextAlarm';
import { palette } from '../theme/palette';
import { font, spacing, shadow } from '../theme/metrics';
import { AlarmCard } from '../components/AlarmCard';
import { NextAlarmBanner } from '../components/NextAlarmBanner';
import { Icon } from '../components/Icon';

interface AlarmsListScreenProps {
  onOpenSettings: () => void;
  onAddAlarm: () => void;
  onEditAlarm: (alarm: Alarm) => void;
  snoozeBanner?: string | null; // time label when a snooze is pending
}

export function AlarmsListScreen({
  onOpenSettings,
  onAddAlarm,
  onEditAlarm,
  snoozeBanner,
}: AlarmsListScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { alarms, toggleAlarm } = useAlarms();

  const next = useMemo(
    () => computeNextAlarm(alarms, new Date()),
    [alarms],
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: theme.text }]}>Alarms</Text>
          <Pressable
            onPress={onOpenSettings}
            android_ripple={{ color: palette.ripple, borderless: true }}
            style={[
              styles.gearButton,
              { borderColor: theme.cardBorder, backgroundColor: theme.card },
            ]}>
            <Icon name="gear" size={20} color={theme.text} />
          </Pressable>
        </View>

        <NextAlarmBanner result={next} />

        {!!snoozeBanner && (
          <View
            style={[
              styles.snoozeBanner,
              { backgroundColor: theme.accent + '1A', borderColor: theme.accent },
            ]}>
            <Icon name="clock" size={16} color={theme.accent} />
            <Text style={[styles.snoozeBannerText, { color: theme.text }]}>
              Snooze pending · rings at {snoozeBanner}
            </Text>
          </View>
        )}

        <View style={styles.list}>
          {alarms.length === 0 ? (
            <View style={styles.empty}>
              <View
                style={[
                  styles.emptyIcon,
                  { backgroundColor: theme.accent + '1A' },
                ]}>
                <Icon name="bell" size={40} color={theme.accent} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No alarms set.
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.subtext }]}>
                Add one to wake up in style.
              </Text>
            </View>
          ) : (
            alarms.map(alarm => (
              <AlarmCard
                key={alarm.id}
                alarm={alarm}
                onPress={() => onEditAlarm(alarm)}
                onToggle={() => toggleAlarm(alarm.id)}
              />
            ))
          )}
        </View>
      </ScrollView>

      <Pressable
        onPress={onAddAlarm}
        android_ripple={{
          color: 'rgba(255,255,255,0.25)',
          borderless: true,
          radius: 27,
        }}
        style={[
          styles.fab,
          { backgroundColor: theme.accent, bottom: insets.bottom + spacing.lg },
        ]}>
        <Icon name="plus" size={26} color={palette.white} strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: font.h1,
    fontWeight: '800',
  },
  gearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  snoozeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  snoozeBannerText: {
    fontSize: font.body,
    fontWeight: '600',
  },
  list: {
    gap: spacing.md,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 72,
    gap: spacing.sm,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: font.h2,
    fontWeight: '800',
  },
  emptySubtitle: {
    fontSize: font.label,
    fontWeight: '500',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow('fab'),
  },
});
