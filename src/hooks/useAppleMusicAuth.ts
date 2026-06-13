import { useCallback, useEffect, useState } from 'react';
import {
  connectAppleMusic,
  disconnectAppleMusic,
} from '../services/appleMusicService';
import { isAuthenticated } from '../services/appleMusicAuth';

interface AppleMusicAuthState {
  isConnected: boolean;
  loading: boolean;
  error: Error | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refresh: () => Promise<void>;
}

// Exposes Apple Music connection status to the UI. Not yet wired into any screen.
export function useAppleMusicAuth(): AppleMusicAuthState {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setIsConnected(await isAuthenticated());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const connect = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await connectAppleMusic();
      setIsConnected(true);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    setLoading(true);
    try {
      await disconnectAppleMusic();
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  return { isConnected, loading, error, connect, disconnect, refresh };
}
