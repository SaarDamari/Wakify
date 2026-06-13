import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/SettingsContext';
import { palette } from '../theme/palette';
import { font, radius, spacing, shadow } from '../theme/metrics';
import { DAY_LABELS } from '../utils/time';

interface CalendarModalProps {
  visible: boolean;
  selected?: string; // ISO YYYY-MM-DD
  onClose: () => void;
  onSelect: (iso: string) => void;
  onClear: () => void;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function toIso(year: number, month: number, day: number): string {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`;
}

// Monday-first leading blank count for the 1st of a month.
function leadingBlanks(year: number, month: number): number {
  const jsDay = new Date(year, month, 1).getDay(); // 0=Sun..6=Sat
  return (jsDay + 6) % 7;
}

export function CalendarModal({
  visible,
  selected,
  onClose,
  onSelect,
  onClear,
}: CalendarModalProps) {
  const theme = useTheme();
  const now = new Date();
  const todayIso = toIso(now.getFullYear(), now.getMonth(), now.getDate());

  const initial = selected ? new Date(selected) : now;
  const [view, setView] = useState({
    year: initial.getFullYear(),
    month: initial.getMonth(),
  });

  const goMonth = (delta: number) => {
    setView(prev => {
      const m = prev.month + delta;
      if (m < 0) {
        return { year: prev.year - 1, month: 11 };
      }
      if (m > 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { year: prev.year, month: m };
    });
  };

  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const blanks = leadingBlanks(view.year, view.month);
  const cells: (number | null)[] = [
    ...Array(blanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.card, { backgroundColor: theme.background }, shadow('raised')]}
          onPress={() => {}}>
          <View style={styles.header}>
            <Pressable
              onPress={() => goMonth(-1)}
              hitSlop={10}
              android_ripple={{ color: palette.ripple, borderless: true }}
              style={styles.arrow}>
              <Text style={[styles.arrowText, { color: theme.text }]}>‹</Text>
            </Pressable>
            <Text style={[styles.monthLabel, { color: theme.text }]}>
              {MONTHS[view.month]} {view.year}
            </Text>
            <Pressable
              onPress={() => goMonth(1)}
              hitSlop={10}
              android_ripple={{ color: palette.ripple, borderless: true }}
              style={styles.arrow}>
              <Text style={[styles.arrowText, { color: theme.text }]}>›</Text>
            </Pressable>
          </View>

          <View style={styles.weekRow}>
            {DAY_LABELS.map((d, i) => (
              <View key={i} style={styles.cell}>
                <Text style={[styles.weekLabel, { color: theme.subtext }]}>
                  {d}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.grid}>
            {cells.map((day, i) => {
              if (day === null) {
                return <View key={`b${i}`} style={styles.cell} />;
              }
              const iso = toIso(view.year, view.month, day);
              const isSelected = iso === selected;
              const isToday = iso === todayIso;
              const isPast = iso < todayIso;

              return (
                <Pressable
                  key={iso}
                  disabled={isPast}
                  onPress={() => {
                    onSelect(iso);
                    onClose();
                  }}
                  style={styles.cell}>
                  <View
                    style={[
                      styles.dayCircle,
                      isSelected && { backgroundColor: theme.accent },
                      isToday &&
                        !isSelected && {
                          borderWidth: 1.5,
                          borderColor: theme.accent,
                        },
                    ]}>
                    <Text
                      style={[
                        styles.dayText,
                        {
                          color: isSelected
                            ? palette.white
                            : isPast
                            ? theme.disabled
                            : theme.text,
                        },
                      ]}>
                      {day}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.footer, { borderTopColor: theme.cardBorder }]}>
            <Pressable
              onPress={() => {
                onClear();
                onClose();
              }}
              android_ripple={{ color: palette.ripple }}
              style={({ pressed }) => [styles.footerBtn, pressed && { opacity: 0.6 }]}>
              <Text style={[styles.footerText, { color: theme.subtext }]}>
                Clear date
              </Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              android_ripple={{ color: palette.ripple }}
              style={({ pressed }) => [styles.footerBtn, pressed && { opacity: 0.6 }]}>
              <Text style={[styles.footerText, { color: theme.accent }]}>
                Done
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  arrow: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 26,
    fontWeight: '700',
  },
  monthLabel: {
    fontSize: font.title,
    fontWeight: '700',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekLabel: {
    fontSize: font.caption,
    fontWeight: '700',
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: font.body,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
  },
  footerBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  footerText: {
    fontSize: font.label,
    fontWeight: '700',
  },
});
