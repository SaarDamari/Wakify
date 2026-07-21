import React from 'react';
import { SettingsProvider } from './SettingsContext';
import { AlarmsProvider } from './AlarmsContext';
import { PremiumProvider } from './PremiumContext';

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <PremiumProvider>
        <AlarmsProvider>{children}</AlarmsProvider>
      </PremiumProvider>
    </SettingsProvider>
  );
}
