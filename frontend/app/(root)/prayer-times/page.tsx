import PrayerTimesPage from "@/components/prayer-times/PrayerTimesPage";

export default function PrayerTimesRoute() {
  return (
    <div>
      {/* Static prayer data — renders directly, no skeleton. */}
      <PrayerTimesPage />
    </div>
  );
}
