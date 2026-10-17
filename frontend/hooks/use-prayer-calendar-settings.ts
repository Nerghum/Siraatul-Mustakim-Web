"use client";

import { useCallback, useSyncExternalStore } from "react";
import { DEFAULT_DISTRICT_ID } from "@/data/bdDistricts";
import type { AsrMethod } from "@/data/mockPrayerCalendar";

export type PrayerCalendarSettings = {
  /** the shipped table already carries the precaution margin */
  precaution: boolean;
  /** show the mosque iqamah line under each waqt time */
  iqamah: boolean;
  asrMethod: AsrMethod;
};

export const DEFAULT_SETTINGS: PrayerCalendarSettings = {
  precaution: true,
  iqamah: false,
  asrMethod: "hanafi",
};

const SETTINGS_KEY = "prayer-calendar-settings";
const DISTRICT_KEY = "prayer-calendar-district";

/* localStorage read through useSyncExternalStore: the server snapshot is the
   defaults, so the prerendered markup and the first client render agree and
   React swaps in the stored values right after. */

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // Keeps other tabs in step.
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function emit() {
  listeners.forEach((listener) => listener());
}

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    // Private mode — the defaults apply.
    return null;
  }
}

function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Persisting is best-effort; the session still gets the new value.
  }
  emit();
}

// Snapshots must be reference-stable between reads, so the parsed object is
// cached against the raw string it came from.
let settingsRaw: string | null = null;
let settingsCache: PrayerCalendarSettings = DEFAULT_SETTINGS;

function getSettingsSnapshot(): PrayerCalendarSettings {
  const raw = read(SETTINGS_KEY);
  if (raw !== settingsRaw) {
    settingsRaw = raw;
    settingsCache = DEFAULT_SETTINGS;
    if (raw) {
      try {
        settingsCache = {
          ...DEFAULT_SETTINGS,
          ...(JSON.parse(raw) as Partial<PrayerCalendarSettings>),
        };
      } catch {
        // Corrupt value — fall back to the defaults already assigned.
      }
    }
  }
  return settingsCache;
}

function getDefaultSettings(): PrayerCalendarSettings {
  return DEFAULT_SETTINGS;
}

function getDistrictSnapshot(): string {
  return read(DISTRICT_KEY) ?? DEFAULT_DISTRICT_ID;
}

function getDefaultDistrict(): string {
  return DEFAULT_DISTRICT_ID;
}

/**
 * Settings for the `/prayer-times/calendar` page only — the homepage widget
 * and `/prayer-times` still render their own placeholder data.
 */
export function usePrayerCalendarSettings() {
  const settings = useSyncExternalStore(subscribe, getSettingsSnapshot, getDefaultSettings);
  const districtId = useSyncExternalStore(subscribe, getDistrictSnapshot, getDefaultDistrict);

  const saveSettings = useCallback((next: PrayerCalendarSettings) => {
    write(SETTINGS_KEY, JSON.stringify(next));
  }, []);

  const saveDistrict = useCallback((next: string) => {
    write(DISTRICT_KEY, next);
  }, []);

  return { settings, saveSettings, districtId, saveDistrict };
}
