import { PrayerTimes, Coordinates, CalculationMethod, Madhab } from "adhan";
import { format } from "date-fns";
import { parseLocation } from "@/data/bdDistricts";
import type { AsrMethod } from "@/data/mockPrayerCalendar";

export type PrayerTimeSlot = {
  key: string;
  time: Date;
  timeStr: string; // HH:mm format
  endTime?: Date;
  endTimeStr?: string;
};

export function calculatePrayerTimes(
  date: Date,
  districtId: string,
  asrMethod: AsrMethod = "hanafi",
  precaution: boolean = true
) {
  const district = parseLocation(districtId);
  const coordinates = new Coordinates(district.lat, district.lng);

  // University of Islamic Sciences, Karachi is standard for South Asia
  const params = CalculationMethod.Karachi();
  params.madhab = asrMethod === "hanafi" ? Madhab.Hanafi : Madhab.Shafi;

  const prayerTimes = new PrayerTimes(coordinates, date, params);

  // If precaution is enabled, we might add some minutes. Typically for Dhaka, Karachi method is already quite close, 
  // but Islamic Foundation BD adds some offsets. For simplicity, we just use Adhan defaults which are very accurate.

  const fmt = (d: Date) => format(d, "h:mm");

  const sunrise = prayerTimes.sunrise;
  const ishraq = new Date(sunrise.getTime() + 15 * 60000); // 15 mins after sunrise
  
  const dhuhr = prayerTimes.dhuhr;
  
  // Noon forbidden time is typically 5 mins before Dhuhr
  const noonForbiddenStart = new Date(dhuhr.getTime() - 5 * 60000);
  const noonForbiddenEnd = dhuhr;

  const sunset = prayerTimes.sunset;
  
  // Sunset forbidden time is typically 15 mins before sunset
  const sunsetForbiddenStart = new Date(sunset.getTime() - 15 * 60000);
  const sunsetForbiddenEnd = sunset;

  const fajr = prayerTimes.fajr;
  const asr = prayerTimes.asr;
  const maghrib = prayerTimes.maghrib;
  const isha = prayerTimes.isha;
  const tahajjud = new Date(fajr.getTime() - 60 * 60000); // approx 1 hour before fajr

  const slots = {
    fajr: { time: fajr, str: fmt(fajr) },
    sunrise: { time: sunrise, str: fmt(sunrise) },
    ishraq: { time: ishraq, str: fmt(ishraq) },
    chasht: { time: ishraq, str: fmt(ishraq) }, // roughly same start
    noonStart: { time: noonForbiddenStart, str: fmt(noonForbiddenStart) },
    dhuhr: { time: dhuhr, str: fmt(dhuhr) },
    asr: { time: asr, str: fmt(asr) },
    sunsetStart: { time: sunsetForbiddenStart, str: fmt(sunsetForbiddenStart) },
    sunset: { time: sunset, str: fmt(sunset) },
    maghrib: { time: maghrib, str: fmt(maghrib) },
    iftar: { time: maghrib, str: fmt(maghrib) }, // Iftar is Maghrib time
    isha: { time: isha, str: fmt(isha) },
    tahajjud: { time: tahajjud, str: fmt(tahajjud) },
  };

  // Determine current prayer
  const now = new Date().getTime();
  let currentKey = "isha";
  if (now >= fajr.getTime() && now < sunrise.getTime()) currentKey = "fajr";
  else if (now >= sunrise.getTime() && now < dhuhr.getTime()) currentKey = "ishraq"; // or sunrise/chasht
  else if (now >= dhuhr.getTime() && now < asr.getTime()) currentKey = "dhuhr";
  else if (now >= asr.getTime() && now < maghrib.getTime()) currentKey = "asr";
  else if (now >= maghrib.getTime() && now < isha.getTime()) currentKey = "maghrib";

  let currentWaqtKey = "isha";
  if (now >= fajr.getTime() && now < sunrise.getTime()) currentWaqtKey = "fajr";
  else if (now >= dhuhr.getTime() && now < asr.getTime()) currentWaqtKey = "dhuhr";
  else if (now >= asr.getTime() && now < maghrib.getTime()) currentWaqtKey = "asr";
  else if (now >= maghrib.getTime() && now < isha.getTime()) currentWaqtKey = "maghrib";

  return { slots, currentKey, currentWaqtKey };
}
