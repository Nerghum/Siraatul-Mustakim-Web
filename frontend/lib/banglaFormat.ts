const BENGALI_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toBanglaNumber(num: number | string): string {
  return String(num).replace(/\d/g, (digit) => BENGALI_DIGITS[Number(digit)]);
}

export function toEnglishDigits(str: number | string): string {
  return String(str).replace(/[০-৯]/g, (digit) => String(BENGALI_DIGITS.indexOf(digit)));
}

export function toLocalizedNumber(num: number | string, locale: "bn" | "en" = "bn"): string {
  if (locale === "en") return toEnglishDigits(num);
  return toBanglaNumber(num);
}

export const BANGLA_WEEKDAYS = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];

export const ENGLISH_WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const BANGLA_WEEKDAYS_SHORT = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];
export const ENGLISH_WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const BANGLA_MONTHS = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];

export const ENGLISH_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function getWeekdaysShort(locale: "bn" | "en" = "bn"): string[] {
  return locale === "en" ? ENGLISH_WEEKDAYS_SHORT : BANGLA_WEEKDAYS_SHORT;
}

export function getMonthName(monthIndex: number, locale: "bn" | "en" = "bn"): string {
  if (locale === "en") return ENGLISH_MONTHS[monthIndex] || "";
  return BANGLA_MONTHS[monthIndex] || "";
}

export function formatBanglaDate(dateInput: Date | string): string {
  return formatLocalizedDate(dateInput, "bn");
}

export function formatLocalizedDate(dateInput: Date | string, locale: "bn" | "en" = "bn"): string {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return "";

  if (locale === "en") {
    const dayName = ENGLISH_WEEKDAYS[d.getDay()];
    const dayNum = d.getDate();
    const monthName = ENGLISH_MONTHS[d.getMonth()];
    const year = d.getFullYear();
    return `${dayName}, ${dayNum} ${monthName} ${year}`;
  }

  const dayName = BANGLA_WEEKDAYS[d.getDay()];
  const dayNum = toBanglaNumber(d.getDate());
  const monthName = BANGLA_MONTHS[d.getMonth()];
  const year = toBanglaNumber(d.getFullYear());

  return `${dayName}, ${dayNum} ${monthName} ${year}`;
}

export function formatBanglaShortDate(dateInput: Date | string): string {
  return formatLocalizedShortDate(dateInput, "bn");
}

export function formatLocalizedShortDate(
  dateInput: Date | string,
  locale: "bn" | "en" = "bn",
): string {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return "";

  if (locale === "en") {
    const dayNum = d.getDate();
    const monthName = ENGLISH_MONTHS[d.getMonth()];
    const year = d.getFullYear();
    return `${dayNum} ${monthName}, ${year}`;
  }

  const dayNum = toBanglaNumber(d.getDate());
  const monthName = BANGLA_MONTHS[d.getMonth()];
  const year = toBanglaNumber(d.getFullYear());

  return `${dayNum} ${monthName}, ${year}`;
}

export type RelativeUnit =
  | "justNow"
  | "minute"
  | "minutes"
  | "hour"
  | "hours"
  | "day"
  | "days"
  | "month"
  | "months"
  | "year"
  | "years";

/**
 * Splits an elapsed span into a `common.relative.*` key and its count, leaving
 * the wording and the digit script to the caller. Returns `justNow` under a
 * minute; `count` is 0 in that case.
 */
export function getRelativeTime(
  dateInput: Date | string,
  now: Date = new Date(),
): { unit: RelativeUnit; count: number } {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return { unit: "justNow", count: 0 };

  const seconds = Math.max(0, Math.floor((now.getTime() - d.getTime()) / 1000));

  const steps: [number, RelativeUnit, RelativeUnit][] = [
    [60, "minute", "minutes"],
    [3600, "hour", "hours"],
    [86400, "day", "days"],
    [2592000, "month", "months"],
    [31536000, "year", "years"],
  ];

  if (seconds < 60) return { unit: "justNow", count: 0 };

  // Walk from the largest bucket down to the first one that fits.
  for (let i = steps.length - 1; i >= 0; i--) {
    const [divisor, singular, plural] = steps[i];
    if (seconds >= divisor) {
      const count = Math.floor(seconds / divisor);
      return { unit: count === 1 ? singular : plural, count };
    }
  }

  return { unit: "justNow", count: 0 };
}

/** Formats seconds into MM:SS or HH:MM:SS (Bangla digits for "bn", English digits for "en") */
export function formatBanglaTime(totalSeconds: number): string {
  return formatLocalizedTime(totalSeconds, "bn");
}

export function formatLocalizedTime(totalSeconds: number, locale: "bn" | "en" = "bn"): string {
  if (isNaN(totalSeconds) || totalSeconds < 0) return toLocalizedNumber("00:00", locale);

  const secs = Math.floor(totalSeconds % 60);
  const totalMins = Math.floor(totalSeconds / 60);
  const mins = totalMins % 60;
  const hours = Math.floor(totalMins / 60);

  const pad = (n: number) => String(n).padStart(2, "0");

  const formatted =
    hours > 0 ? `${pad(hours)}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`;
  return toLocalizedNumber(formatted, locale);
}
