import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alarm } from '../types';
import { generateId } from '../utils/id';
import { getAlarms, setAlarms as persistAlarms } from '../utils/storage';
import { seedAlarms } from './seed';

export type AlarmDraft = Omit<Alarm, 'id'> & { id?: string };

interface AlarmsContextValue {
  alarms: Alarm[];
  addAlarm: (draft: AlarmDraft) => void;
  updateAlarm: (alarm: Alarm) => void;
  removeAlarm: (id: string) => void;
  toggleAlarm: (id: string) => void;
}

const AlarmsContext = createContext<AlarmsContextValue | undefined>(undefined);

export function AlarmsProvider({ children }: { children: React.ReactNode }) {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const hydrated = useRef(false);

  useEffect(() => {
    getAlarms().then(stored => {
      setAlarms(stored ?? seedAlarms());
      hydrated.current = true;
    });
  }, []);

  // Persist only after hydration so the initial empty array never overwrites
  // stored data.
  useEffect(() => {
    if (hydrated.current) {
      persistAlarms(alarms);
    }
  }, [alarms]);

  const addAlarm = useCallback((draft: AlarmDraft) => {
    const alarm: Alarm = { ...draft, id: draft.id ?? generateId() };
    setAlarms(prev => [...prev, alarm]);
  }, []);

  const updateAlarm = useCallback((alarm: Alarm) => {
    setAlarms(prev => prev.map(a => (a.id === alarm.id ? alarm : a)));
  }, []);

  const removeAlarm = useCallback((id: string) => {
    setAlarms(prev => prev.filter(a => a.id !== id));
  }, []);

  const toggleAlarm = useCallback((id: string) => {
    setAlarms(prev =>
      prev.map(a => (a.id === id ? { ...a, enabled: !a.enabled } : a)),
    );
  }, []);

  const value = useMemo<AlarmsContextValue>(
    () => ({ alarms, addAlarm, updateAlarm, removeAlarm, toggleAlarm }),
    [alarms, addAlarm, updateAlarm, removeAlarm, toggleAlarm],
  );

  return (
    <AlarmsContext.Provider value={value}>{children}</AlarmsContext.Provider>
  );
}

export function useAlarms(): AlarmsContextValue {
  const ctx = useContext(AlarmsContext);
  if (!ctx) {
    throw new Error('useAlarms must be used within AlarmsProvider');
  }
  return ctx;
}
