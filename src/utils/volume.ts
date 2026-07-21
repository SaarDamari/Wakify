// The volume slider (0–1) never maps to true silence: even at 0 the alarm must
// be heard. Map it into [FLOOR, 1] so the bar always "adds the partial".
export const VOLUME_FLOOR = 0.3;

export function effectiveVolume(level: number): number {
  const v = Math.max(0, Math.min(1, level));
  return VOLUME_FLOOR + (1 - VOLUME_FLOOR) * v;
}
