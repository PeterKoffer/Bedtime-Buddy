/**
 * Local storage helpers for JSON data.
 * - getJSON: safely read and parse JSON, return fallback on error/missing
 * - setJSON: stringify and save JSON
 * - clearKeys: remove keys by exact match or prefix
 */
export function getJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function setJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore write errors
  }
}

export function clearKeys(prefixesOrKeys: string[]): void {
  try {
    const all = Object.keys(localStorage);
    for (const pattern of prefixesOrKeys) {
      for (const k of all) {
        if (k === pattern || k.startsWith(pattern)) {
          localStorage.removeItem(k);
        }
      }
    }
  } catch {
    // ignore
  }
}

export const STORAGE_KEYS = {
  creatures: 'bedtimeBuddy.creatures.v2025',
  posts: 'bedtimeBuddy.board.posts',
  likes: 'bedtimeBuddy.board.likes',
  nickname: 'bedtimeBuddy.user.nickname',
} as const;