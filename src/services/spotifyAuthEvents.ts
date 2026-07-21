// Lightweight pub-sub so the non-React auth service can notify the React layer
// that the Spotify session expired (refresh token dead) and the app should
// disconnect + prompt re-login.
type Listener = () => void;

const listeners = new Set<Listener>();

export function onSpotifySessionExpired(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitSpotifySessionExpired(): void {
  listeners.forEach(listener => {
    try {
      listener();
    } catch {
      // best-effort
    }
  });
}
