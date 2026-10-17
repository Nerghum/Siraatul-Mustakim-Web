"use client";

import { useCallback, useSyncExternalStore } from "react";

export type AuthUser = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role: "user" | "writer" | "mufti" | "admin" | "moderator" | string;
  avatar?: string;
  provider?: "email" | "phone" | "google" | "facebook";
};

export type AuthSession = {
  user: AuthUser;
  token: string;
};

const STORAGE_KEY = "auth-session";

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

let sessionCache: AuthSession | null = null;
let sessionRaw: string | null | undefined;

function read(): AuthSession | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === sessionRaw) return sessionCache;
    sessionRaw = raw;
    sessionCache = null;
    if (raw) {
      sessionCache = JSON.parse(raw) as AuthSession;
    }
    return sessionCache;
  } catch {
    sessionCache = null;
    return null;
  }
}

function write(session: AuthSession | null) {
  try {
    if (session) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // best-effort
  }
  emit();
}

function getSnapshot(): AuthSession | null {
  return read();
}

function getDefault(): AuthSession | null {
  return null;
}

/**
 * Mock auth session persisted in localStorage.
 * SSR-safe via `useSyncExternalStore` (server snapshot is always null).
 */
export function useAuth() {
  const session = useSyncExternalStore(subscribe, getSnapshot, getDefault);

  const login = useCallback((sessionData: AuthSession) => {
    write(sessionData);
  }, []);

  const logout = useCallback(() => {
    write(null);
  }, []);

  return {
    user: session?.user ?? null,
    session,
    isAuthenticated: session !== null,
    login,
    logout,
  };
}
