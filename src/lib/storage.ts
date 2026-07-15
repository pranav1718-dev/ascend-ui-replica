/**
 * Small typed wrapper around localStorage — used as a fallback by the
 * service layer while Supabase is not yet configured. SSR-safe.
 */
const isBrowser = typeof window !== "undefined";

export const storage = {
  get<T>(key: string, fallback: T): T {
    if (!isBrowser) return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T): void {
    if (!isBrowser) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore quota errors */
    }
  },
  remove(key: string): void {
    if (!isBrowser) return;
    window.localStorage.removeItem(key);
  },
};
