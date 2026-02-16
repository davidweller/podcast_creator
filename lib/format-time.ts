/**
 * Format seconds as m:ss (e.g. 0:00, 1:23, 12:05).
 */
export function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
