"use client";

import { useRouter } from "next/navigation";
import type React from "react";
import { createContext, useCallback, useMemo, useState } from "react";
import bnMessages from "../../messages/bn.json";
import enMessages from "../../messages/en.json";

type Locale = "bn" | "en";

type Messages = typeof bnMessages;

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  messages: Messages;
}

export const LocaleContext = createContext<LocaleContextValue>({
  locale: "bn",
  setLocale: () => {},
  messages: bnMessages,
});

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

function setCookie(name: string, value: string, days: number = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

const allMessages: Record<Locale, Messages> = {
  bn: bnMessages as Messages,
  en: enMessages as Messages,
};

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(
    () => (getCookie("NEXT_LOCALE") as Locale) || initialLocale || "bn",
  );

  const router = useRouter();

  const setLocale = useCallback(
    (newLocale: Locale) => {
      setLocaleState(newLocale);
      setCookie("NEXT_LOCALE", newLocale);
      router.refresh();
    },
    [router],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      messages: allMessages[locale],
    }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
