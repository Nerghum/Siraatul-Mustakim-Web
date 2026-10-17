"use client";

import { useCallback, useContext } from "react";
import { LocaleContext } from "@/components/providers/locale-provider";

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((current, segment) => {
    if (current == null || typeof current !== "object") return undefined;

    const match = segment.match(/^(\w+)\[(\d+)\]$/);
    if (match) {
      const arr = (current as Record<string, unknown>)[match[1]];
      if (Array.isArray(arr)) {
        return arr[Number(match[2])];
      }
      return undefined;
    }

    if (segment in (current as Record<string, unknown>)) {
      return (current as Record<string, unknown>)[segment];
    }
    return undefined;
  }, obj);
}

export function useTranslations() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useTranslations must be used within a LocaleProvider");
  }

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const messages = context.messages as Record<string, unknown>;
      const value = getNestedValue(messages, key);

      if (typeof value === "string") {
        if (!params) return value;
        return Object.entries(params).reduce(
          (str, [paramKey, paramValue]) =>
            str.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(paramValue)),
          value,
        );
      }

      return key;
    },
    [context.messages],
  );

  return t;
}

export function useRawTranslations() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useRawTranslations must be used within a LocaleProvider");
  }

  return useCallback(
    (key: string): unknown => {
      const messages = context.messages as Record<string, unknown>;
      return getNestedValue(messages, key);
    },
    [context.messages],
  );
}
