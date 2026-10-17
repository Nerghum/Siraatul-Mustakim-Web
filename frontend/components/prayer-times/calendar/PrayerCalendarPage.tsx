"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import Wrapper from "@/components/wrapper";
import { parseLocation } from "@/data/bdDistricts";
import { fetchMonthRows } from "@/data/mockPrayerCalendar";
import { useAsyncData } from "@/hooks/use-async-data";
import { usePrayerCalendarSettings } from "@/hooks/use-prayer-calendar-settings";
import { useTranslations } from "@/hooks/use-translations";
import styles from "@/styles/prayer-calendar.module.css";
import CalendarNotes from "./CalendarNotes";
import CalendarToolbar from "./CalendarToolbar";
import LocationDialog from "./LocationDialog";
import MonthPickerDialog from "./MonthPickerDialog";
import PrayerCalendarTable from "./PrayerCalendarTable";
import PrayerSettingsDialog from "./PrayerSettingsDialog";

type OpenDialog = "month" | "settings" | "location" | null;

const PrayerCalendarPage = () => {
  const t = useTranslations();
  const router = useRouter();
  // One Date for the whole session, so the server and the client agree on which
  // row counts as "today".
  const [today] = useState(() => new Date());
  const [month, setMonth] = useState(() => today.getMonth());
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);

  const { settings, saveSettings, districtId, saveDistrict } = usePrayerCalendarSettings();

  const monthButtonRef = useRef<HTMLButtonElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const locationButtonRef = useRef<HTMLButtonElement>(null);

  const year = today.getFullYear();
  const district = useMemo(() => parseLocation(districtId), [districtId]);

  const { data: rows, loading } = useAsyncData(
    () =>
      fetchMonthRows(year, month, {
        precaution: settings.precaution,
        asrMethod: settings.asrMethod,
        district,
      }),
    [year, month, settings.precaution, settings.asrMethod, district],
  );

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDay = month === today.getMonth() ? today.getDate() : null;

  // Focus goes back to whichever control opened the dialog.
  const closeDialog = useCallback(() => {
    setOpenDialog((current) => {
      if (current === "settings") settingsButtonRef.current?.focus();
      else if (current === "location") locationButtonRef.current?.focus();
      else monthButtonRef.current?.focus();
      return null;
    });
  }, []);

  return (
    <div className={styles.page}>
      <Wrapper>
        <div className={styles.calendarInner}>
          <button type="button" className={styles.backLink} onClick={() => router.back()}>
            <ChevronLeft className={styles.backIcon} />
            {t("detail.back")}
          </button>

          <CalendarToolbar
            month={month}
            district={district}
            onPrevMonth={() => setMonth((current) => (current + 11) % 12)}
            onNextMonth={() => setMonth((current) => (current + 1) % 12)}
            onOpenPicker={() => setOpenDialog("month")}
            onOpenSettings={() => setOpenDialog("settings")}
            onOpenLocation={() => setOpenDialog("location")}
            monthButtonRef={monthButtonRef}
            settingsButtonRef={settingsButtonRef}
            locationButtonRef={locationButtonRef}
          />

          <PrayerCalendarTable
            rows={rows ?? []}
            todayDay={todayDay}
            iqamah={settings.iqamah}
            loading={loading}
            rowCount={daysInMonth}
          />

          <CalendarNotes district={district} precaution={settings.precaution} />
        </div>
      </Wrapper>

      {openDialog === "month" && (
        <MonthPickerDialog
          selectedMonth={month}
          currentMonth={today.getMonth()}
          onSelect={setMonth}
          onClose={closeDialog}
        />
      )}

      {openDialog === "settings" && (
        <PrayerSettingsDialog settings={settings} onSave={saveSettings} onClose={closeDialog} />
      )}

      {openDialog === "location" && (
        <LocationDialog districtId={districtId} onSave={saveDistrict} onClose={closeDialog} />
      )}
    </div>
  );
};

export default PrayerCalendarPage;
