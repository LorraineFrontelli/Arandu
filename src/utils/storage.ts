export function readLocal<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(`arandu:${key}`); return raw ? JSON.parse(raw) as T : fallback; }
  catch { return fallback; }
}
export function writeLocal(key: string, value: unknown) {
  try { localStorage.setItem(`arandu:${key}`, JSON.stringify(value)); } catch { /* Reading works without persistent storage. */ }
}
