import PrayerCalendarPage from "@/components/prayer-times/calendar/PrayerCalendarPage";

export default function PrayerCalendarRoute() {
  return (
    <div>
      {/* Static calendar data — renders directly, no skeleton. */}
      <PrayerCalendarPage />
    </div>
  );
}
