import { useEffect, useRef, useState } from 'react';

export function readStorage<T>(key: string, fallback: () => T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback();
  } catch {
    return fallback();
  }
}

export function writeStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable or full: the demo keeps working in memory for this visit
  }
}

/** useState mirrored to localStorage. Writes are skipped on first render. */
export function usePersistentState<T>(key: string, initial: () => T) {
  const [value, setValue] = useState<T>(() => readStorage(key, initial));
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    writeStorage(key, value);
  }, [key, value]);
  return [value, setValue] as const;
}
