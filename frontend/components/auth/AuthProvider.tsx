"use client";

import type React from "react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { type AuthUser, useAuth } from "@/hooks/use-auth";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (session: { user: AuthUser; token: string }) => void;
  logout: () => void;
  isModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  /** Called after a successful auth in the modal — lets the triggering page
   *  (e.g. the ask form) continue its flow once the user is logged in. */
  onAuthenticated?: (() => void) | null;
  setOnAuthenticated: (cb: (() => void) | null) => void;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  isModalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  onAuthenticated: null,
  setOnAuthenticated: () => {},
});

export function useAuthContext() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [onAuthenticated, setOnAuthenticatedState] = useState<(() => void) | null>(null);

  const openAuthModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const setOnAuthenticated = useCallback((cb: (() => void) | null) => {
    setOnAuthenticatedState(cb);
  }, []);

  const login = useCallback(
    (session: { user: AuthUser; token: string }) => {
      auth.login(session);
      const cb = onAuthenticated;
      if (cb) {
        cb();
        setOnAuthenticatedState(null);
      }
    },
    [auth, onAuthenticated],
  );

  const value = useMemo(
    () => ({
      user: auth.user,
      isAuthenticated: auth.isAuthenticated,
      login,
      logout: auth.logout,
      isModalOpen,
      openAuthModal,
      closeAuthModal,
      onAuthenticated,
      setOnAuthenticated,
    }),
    [
      auth.user,
      auth.isAuthenticated,
      auth.logout,
      login,
      isModalOpen,
      openAuthModal,
      closeAuthModal,
      onAuthenticated,
      setOnAuthenticated,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
