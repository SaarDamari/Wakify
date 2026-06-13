import React from 'react';
import { SettingsProvider } from './SettingsContext';
import { AlarmsProvider } from './AlarmsContext';

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <AlarmsProvider>{children}</AlarmsProvider>
    </SettingsProvider>
  );
}
