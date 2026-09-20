import { createSeedStore } from "@/data/seed";
import type { AppStore } from "@/domain/types";

const STORAGE_KEY = "edupass.store.v1";

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function loadStore(): AppStore {
  if (!canUseStorage()) return createSeedStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedStore();
    return JSON.parse(raw) as AppStore;
  } catch {
    return createSeedStore();
  }
}

let store: AppStore = createSeedStore();
let hydrated = false;
const listeners = new Set<() => void>();

export function hydrateStore() {
  if (hydrated || !canUseStorage()) return;
  store = loadStore();
  hydrated = true;
  listeners.forEach((l) => l());
}

export function getStore(): AppStore {
  return store;
}

export function setStore(next: AppStore | ((prev: AppStore) => AppStore)) {
  store = typeof next === "function" ? next(store) : next;
  if (canUseStorage()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }
  listeners.forEach((l) => l());
}

export function subscribeStore(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resetStore() {
  store = createSeedStore();
  if (canUseStorage()) localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  listeners.forEach((l) => l());
}

export function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;
}

export function delay<T>(value: T, ms = 180): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
