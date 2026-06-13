import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { TimeFormat } from '../types';
import { to12h, to24h } from '../utils/time';
import { useTheme } from '../context/SettingsContext';
import { WheelPicker } from './WheelPicker';

interface TimeWheelPickerProps {
  hour: number; // 0-23
  minute: number;
  timeFormat: TimeFormat;
  onChange: (hour24: number, minute: number) => void;
}

const ITEM_HEIGHT = 44;
const VISIBLE_ROWS = 5;
const COL_WIDTH = 96;

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

type EditTarget = 'hour' | 'minute' | null;

export function TimeWheelPicker({
  hour,
  minute,
  timeFormat,
  onChange,
}: TimeWheelPickerProps) {
  const theme = useTheme();
  const is12h = timeFormat === '12h';

  // Tap a column to type the value directly instead of scrolling the wheel.
  const [editing, setEditing] = useState<EditTarget>(null);
  const [editText, setEditText] = useState('');

  const minuteValues = useMemo(
    () => Array.from({ length: 60 }, (_, i) => pad2(i)),
    [],
  );

  const hourValues = useMemo(
    () =>
      is12h
        ? Array.from({ length: 12 }, (_, i) => `${i + 1}`)
        : Array.from({ length: 24 }, (_, i) => pad2(i)),
    [is12h],
  );

  const ampmValues = ['AM', 'PM'];

  const { hour12, isPm } = to12h(hour);
  const hourIndex = is12h ? hour12 - 1 : hour;
  const ampmIndex = isPm ? 1 : 0;

  const onHourChange = (index: number) => {
    if (is12h) {
      onChange(to24h(index + 1, isPm), minute);
    } else {
      onChange(index, minute);
    }
  };

  const onAmPmChange = (index: number) => {
    onChange(to24h(hour12, index === 1), minute);
  };

  const beginEdit = (target: 'hour' | 'minute') => {
    const initial =
      target === 'hour' ? (is12h ? `${hour12}` : `${hour}`) : `${minute}`;
    setEditText(initial);
    setEditing(target);
  };

  // Parse, clamp to the legal range, and commit a typed value to the draft.
  // Shared by the live keystroke path and the blur/submit safety net.
  const commitValue = (target: 'hour' | 'minute', text: string) => {
    const n = parseInt(text, 10);
    if (isNaN(n)) {
      return;
    }
    if (target === 'hour') {
      if (is12h) {
        onChange(to24h(Math.min(12, Math.max(1, n)), isPm), minute);
      } else {
        onChange(Math.min(23, Math.max(0, n)), minute);
      }
    } else {
      onChange(hour, Math.min(59, Math.max(0, n)));
    }
  };

  // Once the field is unambiguously full, move on: hour → minute, minute → done.
  // Either two digits typed, or a single digit that can't be the start of a
  // valid two-digit value (e.g. "7" minutes, or "3" in 24h hours).
  const shouldAdvance = (target: 'hour' | 'minute', text: string): boolean => {
    if (text.length >= 2) {
      return true;
    }
    if (text.length !== 1) {
      return false;
    }
    const d = parseInt(text, 10);
    if (target === 'hour') {
      return is12h ? d >= 2 : d >= 3;
    }
    return d >= 6; // minute
  };

  // Live: filter to digits, commit each keystroke (no Done needed), and flow on.
  const onEditChange = (target: 'hour' | 'minute', raw: string) => {
    const text = raw.replace(/[^0-9]/g, '').slice(0, 2);
    setEditText(text);
    if (text.length > 0) {
      commitValue(target, text);
    }
    if (shouldAdvance(target, text)) {
      if (target === 'hour') {
        setEditText('');
        setEditing('minute'); // minute TextInput mounts with autoFocus
      } else {
        setEditing(null); // back to the wheels
      }
    }
  };

  // Blur / keyboard Done: commit whatever's left, then return to the wheel.
  const commitEdit = () => {
    if (editing && editText.length > 0) {
      commitValue(editing, editText);
    }
    setEditing(null);
  };

  const containerHeight = ITEM_HEIGHT * VISIBLE_ROWS;
  const bandTop = ((VISIBLE_ROWS - 1) / 2) * ITEM_HEIGHT;

  const renderEditableColumn = (
    target: 'hour' | 'minute',
    wheel: React.ReactNode,
    align: 'left' | 'right',
  ) => {
    if (editing === target) {
      return (
        <TextInput
          style={[
            styles.input,
            {
              width: COL_WIDTH,
              height: containerHeight,
              color: theme.text,
              textAlign: align === 'right' ? 'right' : 'left',
            },
          ]}
          value={editText}
          onChangeText={t => onEditChange(target, t)}
          keyboardType="number-pad"
          maxLength={2}
          autoFocus
          selectTextOnFocus
          returnKeyType="done"
          onBlur={commitEdit}
          onSubmitEditing={commitEdit}
        />
      );
    }
    return (
      <View style={{ width: COL_WIDTH, height: containerHeight }}>
        {wheel}
        {/* Tap the centered value to switch to typing. */}
        <Pressable
          onPress={() => beginEdit(target)}
          style={[styles.tapZone, { top: bandTop, height: ITEM_HEIGHT }]}
        />
      </View>
    );
  };

  return (
    <View style={[styles.wrapper, { height: containerHeight }]}>
      {/* Shared coral selection band spanning all columns, behind the text. */}
      <View
        pointerEvents="none"
        style={[
          styles.band,
          {
            top: bandTop,
            height: ITEM_HEIGHT,
            backgroundColor: theme.accent + '14', // ~8% alpha tint
            borderColor: theme.accent + '40',
          },
        ]}
      />

      <View style={styles.columns}>
        {renderEditableColumn(
          'hour',
          <WheelPicker
            values={hourValues}
            selectedIndex={hourIndex}
            onChange={onHourChange}
            itemHeight={ITEM_HEIGHT}
            visibleRows={VISIBLE_ROWS}
            align="right"
            width={COL_WIDTH}
          />,
          'right',
        )}

        <Text style={[styles.colon, { color: theme.text }]}>:</Text>

        {renderEditableColumn(
          'minute',
          <WheelPicker
            values={minuteValues}
            selectedIndex={minute}
            onChange={index => onChange(hour, index)}
            itemHeight={ITEM_HEIGHT}
            visibleRows={VISIBLE_ROWS}
            align="left"
            width={COL_WIDTH}
          />,
          'left',
        )}

        {is12h && (
          <WheelPicker
            values={ampmValues}
            selectedIndex={ampmIndex}
            onChange={onAmPmChange}
            itemHeight={ITEM_HEIGHT}
            visibleRows={VISIBLE_ROWS}
            align="center"
            width={64}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'center',
  },
  band: {
    position: 'absolute',
    left: 12,
    right: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  columns: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colon: {
    fontSize: 28,
    fontWeight: '800',
    marginHorizontal: 2,
  },
  tapZone: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  input: {
    fontSize: 28,
    fontWeight: '800',
    paddingHorizontal: 4,
  },
});
