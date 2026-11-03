import { PrayerTimes, Coordinates, CalculationMethod, Madhab } from "adhan";
import { parseLocation, getTimezoneForLocation } from "@/data/bdDistricts";
import type { AsrMethod } from "@/data/mockPrayerCalendar";

export type PrayerTimeSlot = {
  key: string;
  time: Date;
  timeStr: string; // HH:mm format
  endTime?: Date;
  endTimeStr?: string;
};

/**
 * Formats a Date instance into "h:mm" 12-hour format strictly in the specified
 * target timezone (default "Asia/Dhaka"), preventing client browser timezone drift.
 */
export function formatInTimezone(d: Date, timeZone: string = "Asia/Dhaka"): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const hour = parts.find((p) => p.type === "hour")?.value ?? "0";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
  const h12 = (parseInt(hour, 10) % 12) || 12;
  return `${h12}:${minute}`;
}

/**
 * Derives year, month, and day in the target timezone so adhan calculates
 * astronomical values for the exact local day regardless of client device timezone.
 */
export function getTargetDateComponents(date: Date, timeZone: string = "Asia/Dhaka"): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);
  const year = parseInt(parts.find((p) => p.type === "year")?.value ?? String(date.getFullYear()), 10);
  const month = parseInt(parts.find((p) => p.type === "month")?.value ?? String(date.getMonth() + 1), 10) - 1;
  const day = parseInt(parts.find((p) => p.type === "day")?.value ?? String(date.getDate()), 10);
  return new Date(year, month, day, 12, 0, 0);
}

export function calculatePrayerTimes(
  date: Date,
  districtId: string,
  asrMethod: AsrMethod = "hanafi",
  precaution: boolean = true
) {
  const district = parseLocation(districtId);
  const timeZone = getTimezoneForLocation(district);
  const coordinates = new Coordinates(district.lat, district.lng);

  // University of Islamic Sciences, Karachi (18° Fajr, 18° Isha) is the standard
  // calculation method adopted by Islamic Foundation Bangladesh (IFB) and Muslim Bangla.
  const params = CalculationMethod.Karachi();
  params.madhab = asrMethod === "hanafi" ? Madhab.Hanafi : Madhab.Shafi;

  const targetDate = getTargetDateComponents(date, timeZone);
  const prayerTimes = new PrayerTimes(coordinates, targetDate, params);

  const fmt = (d: Date) => formatInTimezone(d, timeZone);

  // Islamic Foundation Bangladesh (IFB) / Muslim Bangla standard precaution offsets:
  // 1. Sahri ends 5 mins before Fajr
  // 2. Dhuhr has +2 mins precaution after true solar noon
  // 3. Maghrib / Iftar is sunset + 2 mins precaution (আজান ও ইফতার সূর্যাস্তের ২ মিনিট পর)
  const fajr = prayerTimes.fajr;
  const sahri = new Date(fajr.getTime() - (precaution ? 5 : 0) * 60000);
  const sunrise = prayerTimes.sunrise;
  const ishraq = new Date(sunrise.getTime() + 15 * 60000); // 15 mins after sunrise
  
  const rawDhuhr = prayerTimes.dhuhr;
  const dhuhr = precaution ? new Date(rawDhuhr.getTime() + 2 * 60000) : rawDhuhr;
  
  // Noon forbidden time is 6 mins before Dhuhr
  const noonForbiddenStart = new Date(dhuhr.getTime() - 6 * 60000);
  const noonForbiddenEnd = dhuhr;

  const rawSunset = prayerTimes.sunset;
  // Sunset forbidden time is 15 mins before sunset
  const sunsetForbiddenStart = new Date(rawSunset.getTime() - 15 * 60000);
  const sunsetForbiddenEnd = rawSunset;

  const asr = prayerTimes.asr;
  const maghrib = precaution ? new Date(rawSunset.getTime() + 2 * 60000) : rawSunset;
  const isha = prayerTimes.isha;
  const tahajjud = new Date(fajr.getTime() - 60 * 60000); // 1 hour before fajr

  const slots = {
    sahri: { time: sahri, str: fmt(sahri) },
    fajr: { time: fajr, str: fmt(fajr) },
    sunrise: { time: sunrise, str: fmt(sunrise) },
    ishraq: { time: ishraq, str: fmt(ishraq) },
    chasht: { time: ishraq, str: fmt(ishraq) },
    noonStart: { time: noonForbiddenStart, str: fmt(noonForbiddenStart) },
    dhuhr: { time: dhuhr, str: fmt(dhuhr) },
    asr: { time: asr, str: fmt(asr) },
    sunsetStart: { time: sunsetForbiddenStart, str: fmt(sunsetForbiddenStart) },
    sunset: { time: rawSunset, str: fmt(rawSunset) },
    maghrib: { time: maghrib, str: fmt(maghrib) },
    iftar: { time: maghrib, str: fmt(maghrib) },
    isha: { time: isha, str: fmt(isha) },
    tahajjud: { time: tahajjud, str: fmt(tahajjud) },
  };

  // Determine current prayer
  const now = new Date().getTime();
  let currentKey = "isha";
  if (now >= fajr.getTime() && now < sunrise.getTime()) currentKey = "fajr";
  else if (now >= sunrise.getTime() && now < dhuhr.getTime()) currentKey = "ishraq";
  else if (now >= dhuhr.getTime() && now < asr.getTime()) currentKey = "dhuhr";
  else if (now >= asr.getTime() && now < maghrib.getTime()) currentKey = "asr";
  else if (now >= maghrib.getTime() && now < isha.getTime()) currentKey = "maghrib";

  let currentWaqtKey = "isha";
  if (now >= fajr.getTime() && now < sunrise.getTime()) currentWaqtKey = "fajr";
  else if (now >= dhuhr.getTime() && now < asr.getTime()) currentWaqtKey = "dhuhr";
  else if (now >= asr.getTime() && now < maghrib.getTime()) currentWaqtKey = "asr";
  else if (now >= maghrib.getTime() && now < isha.getTime()) currentWaqtKey = "maghrib";

  return { slots, currentKey, currentWaqtKey, timeZone };
}
