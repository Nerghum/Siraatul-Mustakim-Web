"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "ask-form-status";

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function emit() {
  listeners.forEach((listener) => listener());
}

function read(): boolean | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    return JSON.parse(raw) as boolean;
  } catch {
    return null;
  }
}

function write(value: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // best-effort
  }
  emit();
}

let snapshotCache: boolean | null = null;

function getSnapshot(): boolean {
  const raw = read();
  if (raw !== snapshotCache) {
    snapshotCache = raw;
  }
  return snapshotCache ?? true;
}

function getDefault(): boolean {
  return true;
}

/**
 * Shared form active/disabled state persisted in localStorage.
 * Returns `[forceDisabled, setForceDisabled]`.
 * `true` = form is disabled (default); `false` = form is active.
 */
export function useFormStatus(): [boolean, (v: boolean) => void] {
  const forceDisabled = useSyncExternalStore(subscribe, getSnapshot, getDefault);

  const setForceDisabled = useCallback((next: boolean) => {
    write(next);
  }, []);

  return [forceDisabled, setForceDisabled];
}
