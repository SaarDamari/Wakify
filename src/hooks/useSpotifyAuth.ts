import { useCallback, useEffect, useState } from 'react';
import {
  connectSpotify,
  disconnectSpotify,
} from '../services/spotifyService';
import { isAuthenticated } from '../services/spotifyAuth';
import { log, warn } from '../utils/logger';

interface SpotifyAuthState {
  isConnected: boolean;
  loading: boolean;
  error: Error | null;
  connect: () => Promise<Error | null>;
  disconnect: () => Promise<void>;
  refresh: () => Promise<void>;
}

// Exposes Spotify connection status to the UI. Not yet wired into any screen.
export function useSpotifyAuth(): SpotifyAuthState {
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
    log('auth', 'useSpotifyAuth.connect start');
    setLoading(true);
    setError(null);
    try {
      await connectSpotify();
      setIsConnected(true);
      log('auth', 'useSpotifyAuth.connect ok');
      return null;
    } catch (e) {
      warn('auth', 'useSpotifyAuth.connect FAILED', (e as Error)?.message, e);
      const err = e instanceof Error ? e : new Error(String(e));
      setError(err);
      return err;
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    setLoading(true);
    try {
      await disconnectSpotify();
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  return { isConnected, loading, error, connect, disconnect, refresh };
}
