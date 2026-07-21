import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getPremium, setPremiumStored } from '../utils/storage';

interface PremiumContextValue {
  isPremium: boolean;
  hydrated: boolean;
  setPremium: (value: boolean) => void;
}

const PremiumContext = createContext<PremiumContextValue | undefined>(undefined);

// Temporary: treat everyone as Premium while billing isn't wired yet. Flip to
// false (or remove) to restore the real entitlement. The rest of the logic
// (storage, setPremium, paywall) stays intact.
const FORCE_PREMIUM = true;

// Tracks the "Wakify Premium" entitlement. Purchase is mocked for now
// (setPremium just flips + persists the flag); when wiring RevenueCat, replace
// the storage-backed value with the entitlement from Purchases.getCustomerInfo()
// and make setPremium trigger Purchases.purchasePackage(...).
// TODO(revenuecat)
export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    getPremium().then(value => {
      setIsPremium(value);
      setHydrated(true);
    });
  }, []);

  const setPremium = useCallback((value: boolean) => {
    setIsPremium(value);
    setPremiumStored(value);
  }, []);

  const value = useMemo<PremiumContextValue>(
    () => ({ isPremium: FORCE_PREMIUM || isPremium, hydrated, setPremium }),
    [isPremium, hydrated, setPremium],
  );

  return (
    <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>
  );
}

export function usePremium(): PremiumContextValue {
  const ctx = useContext(PremiumContext);
  if (!ctx) {
    throw new Error('usePremium must be used within PremiumProvider');
  }
  return ctx;
}
