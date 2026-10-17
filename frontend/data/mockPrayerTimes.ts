import { mockFetch } from "@/lib/mock-api";

export type PrayerIconName = "moon" | "sunrise" | "sun" | "sunset";

export type PrayerSlot = {
  /** translation key under home.prayer.names */
  key: string;
  icon: PrayerIconName;
  /** Latin digits — localised at render by localizeDigits() */
  time: string;
  /** end of the window, shown in the grid cell for slots that span a range */
  endTime?: string;
  /** end of the window, shown only on the "currently running" card */
  windowEnd?: string;
};

/**
 * TODO: static placeholder times for Dhaka. Replace with a real prayer-time
 * source (API or calculation) plus the user's saved location.
 */
export const PRAYER_SLOTS: PrayerSlot[] = [
  { key: "fajr", icon: "moon", time: "3:56" },
  { key: "sunrise", icon: "sunrise", time: "5:21" },
  { key: "ishraq", icon: "sunrise", time: "5:36", endTime: "11:59" },
  { key: "dhuhr", icon: "sun", time: "12:04" },
  { key: "asr", icon: "sun", time: "4:44" },
  { key: "maghrib", icon: "sunset", time: "6:47" },
  { key: "iftar", icon: "moon", time: "6:50" },
  { key: "isha", icon: "moon", time: "8:12" },
];

/** TODO: derive from the clock once real times are wired up. */
export const CURRENT_PRAYER_KEY = "ishraq";

/* ------------------------------------------------------------------ *
 * /prayer-times page
 *
 * The mockup's page-level times do not match the summary grid above
 * (fajr reads 3:56 there and 03:57 here). Both are placeholder art, so
 * each block keeps its own numbers rather than being reconciled.
 * ------------------------------------------------------------------ */

export type TimeEntry = {
  /** translation key under prayerTimes.<group>.* */
  key: string;
  icon: PrayerIconName;
  /** Latin digits — localised at render by localizeDigits() */
  time: string;
  /** omit for single-time entries such as tahajjud */
  endTime?: string;
  /** draws the small circled "i" marker beside the name */
  info?: boolean;
};

/** The five fard waqts — `ওয়াক্তের সময়সূচী`. */
export const WAQT_ROWS: TimeEntry[] = [
  { key: "fajr", icon: "sunrise", time: "03:57", endTime: "05:21" },
  { key: "dhuhr", icon: "sun", time: "12:06", endTime: "04:43" },
  { key: "asr", icon: "sun", time: "04:44", endTime: "06:47" },
  { key: "maghrib", icon: "sunset", time: "06:48", endTime: "08:11" },
  { key: "isha", icon: "moon", time: "08:12", endTime: "03:57" },
];

/** TODO: derive from the clock alongside CURRENT_PRAYER_KEY. */
export const CURRENT_WAQT_KEY = "asr";

/** `নফল নামাজের সময়সূচী`. */
export const NAFL_ITEMS: TimeEntry[] = [
  { key: "tahajjud", icon: "moon", time: "03:56", info: true },
  { key: "ishraq", icon: "sun", time: "05:38", endTime: "11:59", info: true },
  { key: "chasht", icon: "sun", time: "05:38", endTime: "11:59", info: true },
];

/** `নামাজের নিষিদ্ধ সময়সূচী`. */
export const FORBIDDEN_ITEMS: TimeEntry[] = [
  { key: "sunrise", icon: "sunrise", time: "05:22", endTime: "05:37", info: true },
  { key: "noon", icon: "sun", time: "12:00", endTime: "12:05", info: true },
  { key: "sunset", icon: "sunset", time: "06:32", endTime: "06:47", info: true },
];

/* ------------------------------------------------------------------ *
 * Async getters — every surface reads its data through `mockFetch` so it
 * loads like a real endpoint (latency + skeletons). Swap the bodies for
 * `fetch()` when a real prayer-time source lands; the components stay put.
 * ------------------------------------------------------------------ */

import { calculatePrayerTimes } from "@/lib/prayer-times";
import type { AsrMethod } from "./mockPrayerCalendar";

export type PrayerHighlightData = {
  slots: PrayerSlot[];
  /** key of the slot that is currently running */
  currentKey: string;
};

/** Today's at-a-glance schedule: the eight slots plus the running one. */
export async function getPrayerHighlight(districtId: string = "dhaka", asrMethod: AsrMethod = "hanafi"): Promise<PrayerHighlightData> {
  const { slots, currentKey } = calculatePrayerTimes(new Date(), districtId, asrMethod);
  
  const formattedSlots: PrayerSlot[] = [
    { key: "fajr", icon: "moon", time: slots.fajr.str },
    { key: "sunrise", icon: "sunrise", time: slots.sunrise.str },
    { key: "ishraq", icon: "sunrise", time: slots.ishraq.str, endTime: "11:59" },
    { key: "dhuhr", icon: "sun", time: slots.dhuhr.str },
    { key: "asr", icon: "sun", time: slots.asr.str },
    { key: "maghrib", icon: "sunset", time: slots.maghrib.str },
    { key: "iftar", icon: "moon", time: slots.iftar.str },
    { key: "isha", icon: "moon", time: slots.isha.str },
  ];

  return { slots: formattedSlots, currentKey };
}

export type WaqtScheduleData = {
  rows: TimeEntry[];
  /** key of the waqt that is currently running */
  currentKey: string;
};

/** The five fard waqts plus the running one, for the /prayer-times page. */
export async function getWaqtSchedule(districtId: string = "dhaka", asrMethod: AsrMethod = "hanafi"): Promise<WaqtScheduleData> {
  const { slots, currentWaqtKey } = calculatePrayerTimes(new Date(), districtId, asrMethod);

  const formattedRows: TimeEntry[] = [
    { key: "fajr", icon: "sunrise", time: slots.fajr.str, endTime: slots.sunrise.str },
    { key: "dhuhr", icon: "sun", time: slots.dhuhr.str, endTime: slots.asr.str },
    { key: "asr", icon: "sun", time: slots.asr.str, endTime: slots.sunset.str },
    { key: "maghrib", icon: "sunset", time: slots.maghrib.str, endTime: slots.isha.str },
    { key: "isha", icon: "moon", time: slots.isha.str, endTime: slots.fajr.str },
  ];

  return { rows: formattedRows, currentKey: currentWaqtKey };
}

/** Nafl or forbidden time list, keyed by the card's namespace. */
export async function getTimeGroup(namespace: "nafl" | "forbidden", districtId: string = "dhaka", asrMethod: AsrMethod = "hanafi"): Promise<TimeEntry[]> {
  const { slots } = calculatePrayerTimes(new Date(), districtId, asrMethod);

  if (namespace === "nafl") {
    return [
      { key: "tahajjud", icon: "moon", time: slots.tahajjud.str, info: true },
      { key: "ishraq", icon: "sun", time: slots.ishraq.str, endTime: "11:59", info: true },
      { key: "chasht", icon: "sun", time: slots.chasht.str, endTime: "11:59", info: true },
    ];
  } else {
    return [
      { key: "sunrise", icon: "sunrise", time: slots.sunrise.str, endTime: slots.ishraq.str, info: true },
      { key: "noon", icon: "sun", time: slots.noonStart.str, endTime: slots.dhuhr.str, info: true },
      { key: "sunset", icon: "sunset", time: slots.sunsetStart.str, endTime: slots.sunset.str, info: true },
    ];
  }
}
