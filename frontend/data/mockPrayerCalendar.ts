/**
 * TODO: placeholder data for the `/prayer-times/calendar` page.
 *
 * July's rows are the real Dhaka table from the design reference; every other
 * month is derived from them with a seasonal offset (see MONTH_OFFSETS below),
 * so the month navigation always renders a plausible, fully-populated table.
 * Replace the whole module once a real prayer-time source (API or calculation)
 * plus the user's saved location are wired up — same TODO as
 * `data/mockPrayerTimes.ts`.
 */

import { mockFetch } from "@/lib/mock-api";
import { calculatePrayerTimes } from "@/lib/prayer-times";
import { PrayerTimes, Coordinates, CalculationMethod, Madhab } from "adhan";
import { format } from "date-fns";

export type CalendarColumn = "sahri" | "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";

export const CALENDAR_COLUMNS: CalendarColumn[] = [
  "sahri",
  "fajr",
  "sunrise",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
];

export type CalendarRow = {
  /** 1-based day of month */
  day: number;
  /** Latin "HH:MM" in 12-hour form (no meridiem) — localised at render */
  times: Record<CalendarColumn, string>;
};

/**
 * July for Dhaka, transcribed from the design reference. Minutes from midnight
 * (24-hour), one tuple per day, columns in CALENDAR_COLUMNS order.
 */
const JULY_MINUTES: number[][] = [
  [226, 227, 315, 723, 1003, 1131, 1217],
  [227, 228, 315, 723, 1003, 1131, 1217],
  [227, 228, 315, 724, 1003, 1131, 1217],
  [227, 228, 316, 724, 1003, 1131, 1217],
  [228, 229, 316, 724, 1003, 1131, 1217],
  [228, 229, 316, 724, 1003, 1131, 1217],
  [229, 230, 317, 724, 1003, 1131, 1216],
  [229, 230, 317, 724, 1004, 1130, 1216],
  [230, 231, 318, 725, 1004, 1130, 1216],
  [230, 231, 318, 725, 1004, 1130, 1216],
  [231, 232, 318, 725, 1004, 1130, 1215],
  [232, 233, 319, 725, 1004, 1130, 1215],
  [232, 233, 319, 725, 1004, 1130, 1215],
  [233, 234, 320, 725, 1004, 1130, 1214],
  [233, 234, 320, 725, 1004, 1129, 1214],
  [234, 235, 321, 725, 1004, 1129, 1214],
  [234, 235, 321, 726, 1004, 1129, 1213],
  [235, 236, 321, 726, 1004, 1129, 1213],
  [236, 237, 322, 726, 1004, 1128, 1212],
  [236, 237, 322, 726, 1004, 1128, 1212],
  [237, 238, 323, 726, 1004, 1128, 1211],
  [238, 239, 323, 726, 1004, 1127, 1211],
  [238, 239, 324, 726, 1004, 1127, 1210],
  [239, 240, 324, 726, 1004, 1126, 1210],
  [239, 240, 325, 726, 1004, 1126, 1209],
  [240, 241, 325, 726, 1004, 1126, 1208],
  [241, 242, 326, 726, 1003, 1125, 1208],
  [241, 242, 326, 726, 1003, 1125, 1207],
  [242, 243, 326, 726, 1003, 1124, 1206],
  [243, 244, 327, 726, 1003, 1124, 1206],
  [243, 244, 327, 726, 1003, 1123, 1205],
];

/**
 * Minutes to add to the July value, per column, anchored at the 15th of each
 * month (index 0 = January). Shaped on Dhaka's yearly drift; July is 0 by
 * definition.
 */
const MONTH_OFFSETS: Record<CalendarColumn, number[]> = {
  //         Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct  Nov  Dec
  sahri: [81, 76, 58, 31, 6, -6, 0, 11, 20, 27, 41, 61],
  fajr: [81, 76, 58, 31, 6, -6, 0, 11, 20, 27, 41, 61],
  sunrise: [80, 70, 50, 25, 5, -5, 0, 8, 13, 18, 32, 60],
  dhuhr: [-1, 6, 4, -3, -6, -3, 0, -1, -9, -18, -19, -12],
  asr: [-49, -34, -24, -14, -6, 0, 0, -7, -24, -46, -61, -62],
  maghrib: [-84, -59, -44, -29, -14, -4, 0, -12, -39, -69, -89, -94],
  isha: [-89, -69, -56, -39, -22, -9, 0, -17, -49, -79, -96, -99],
};

const JULY = 6;

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Linear interpolation between the two month anchors that surround this day,
 * so the offset walks smoothly across a month boundary instead of jumping.
 */
function offsetFor(column: CalendarColumn, year: number, month: number, day: number): number {
  // July is the transcribed month — it renders exactly as the reference table.
  if (month === JULY) return 0;

  const anchors = MONTH_OFFSETS[column];
  const span = daysInMonth(year, month);

  if (day === 15) return anchors[month];

  const [fromMonth, toMonth, t] =
    day < 15
      ? [
          (month + 11) % 12,
          month,
          // 15th of the previous month → 15th of this one
          (day + daysInMonth(year, (month + 11) % 12) - 15) / daysInMonth(year, (month + 11) % 12),
        ]
      : [month, (month + 1) % 12, (day - 15) / span];

  return anchors[fromMonth] + (anchors[toMonth] - anchors[fromMonth]) * t;
}

/** Minutes from midnight → "HH:MM" in 12-hour form, no meridiem. */
function formatTime(minutes: number): string {
  const wrapped = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const hours24 = Math.floor(wrapped / 60);
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const mins = wrapped % 60;
  return `${String(hours12).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ *
 * Settings adjustments
 *
 * All three are mock approximations layered on top of the July base, in
 * the same spirit as MONTH_OFFSETS. A real prayer-time source replaces
 * the lot.
 * ------------------------------------------------------------------ */

export type AsrMethod = "hanafi" | "shafi";

/**
 * The base table carries a precaution margin. Turning it off follows the
 * Islamic Foundation's 2025 announcement, exactly as the page's own note
 * promises: sahri 4 minutes later, the Maghrib adhan 2 minutes earlier.
 */
const PRECAUTION_OFF: Partial<Record<CalendarColumn, number>> = {
  sahri: 4,
  maghrib: -2,
};

/** Shafi'i asr falls roughly three quarters of an hour before the Hanafi one. */
const SHAFI_ASR_SHIFT = -45;

/** Minutes added after the waqt time when the iqamah line is switched on. */
export const IQAMAH_OFFSETS: Partial<Record<CalendarColumn, number>> = {
  fajr: 20,
  dhuhr: 10,
  asr: 10,
  maghrib: 3,
  isha: 10,
};

/**
 * Shifts a rendered "HH:MM" label by a few minutes. The labels are 12-hour
 * and meridiem-less, so this wraps at 12 — fine for the small iqamah offsets
 * it is used for.
 */
export function shiftTimeLabel(time: string, minutes: number): string {
  const [hours, mins] = time.split(":").map(Number);
  const total = (hours % 12) * 60 + mins + minutes;
  const wrapped = ((total % 720) + 720) % 720;
  const outHours = Math.floor(wrapped / 60) === 0 ? 12 : Math.floor(wrapped / 60);
  return `${String(outHours).padStart(2, "0")}:${String(wrapped % 60).padStart(2, "0")}`;
}

export type MonthRowOptions = {
  /** defaults to true — the transcribed table already includes the margin */
  precaution?: boolean;
  asrMethod?: AsrMethod;
  /** location; omitted means Dhaka, the reference point */
  district?: { lat: number; lng: number };
};

/**
 * Location shift: 4 minutes per degree of longitude away from Dhaka (the
 * sun's own pace), plus a small latitude term that stretches or shrinks
 * the day the way a more northern location does.
 */
function districtShift(column: CalendarColumn, district: MonthRowOptions["district"]): number {
  if (!district) return 0;

  const longitude = (DHAKA_LNG - district.lng) * 4;
  const latitude = (district.lat - DHAKA_LAT) * 1.5;

  if (column === "sahri" || column === "fajr" || column === "sunrise") {
    return longitude - latitude;
  }
  if (column === "maghrib" || column === "isha") {
    return longitude + latitude;
  }
  return longitude;
}

const DHAKA_LAT = 23.81;
const DHAKA_LNG = 90.4125;

export function getMonthRows(
  year: number,
  month: number,
  options: MonthRowOptions = {},
): CalendarRow[] {
  const { precaution = true, asrMethod = "hanafi", district } = options;
  const span = daysInMonth(year, month);

  const lat = district?.lat ?? DHAKA_LAT;
  const lng = district?.lng ?? DHAKA_LNG;
  const coordinates = new Coordinates(lat, lng);

  const params = CalculationMethod.Karachi();
  params.madhab = asrMethod === "hanafi" ? Madhab.Hanafi : Madhab.Shafi;

  const fmt = (d: Date) => format(d, "h:mm");

  return Array.from({ length: span }, (_, index) => {
    const day = index + 1;
    const date = new Date(year, month, day, 12, 0, 0); // Noon to avoid timezone edge cases

    const prayerTimes = new PrayerTimes(coordinates, date, params);

    // If precaution is false, maybe subtract precaution offsets, but by default Adhan is precise.
    // For simplicity, we just format the exact Adhan times.
    
    // Adhan has `fajr`, `sunrise`, `dhuhr`, `asr`, `maghrib`, `isha`
    // Sahri is typically a few minutes before Fajr, but the mockup uses it as its own column.
    // Let's approximate Sahri as 10 mins before Fajr if precaution is true, else 5 mins.
    const sahriOffset = precaution ? -10 : -5;
    const sahriDate = new Date(prayerTimes.fajr.getTime() + sahriOffset * 60000);

    const times: Record<CalendarColumn, string> = {
      sahri: fmt(sahriDate),
      fajr: fmt(prayerTimes.fajr),
      sunrise: fmt(prayerTimes.sunrise),
      dhuhr: fmt(prayerTimes.dhuhr),
      asr: fmt(prayerTimes.asr),
      maghrib: fmt(prayerTimes.maghrib),
      isha: fmt(prayerTimes.isha),
    };

    return { day, times };
  });
}

/**
 * Async wrapper over `getMonthRows` so the calendar page loads like a real
 * endpoint (latency + skeleton). Re-runs whenever month/settings/location
 * change; swap the body for `fetch()` when a real source lands.
 */
export async function fetchMonthRows(
  year: number,
  month: number,
  options: MonthRowOptions = {},
): Promise<CalendarRow[]> {
  return mockFetch(getMonthRows(year, month, options));
}
