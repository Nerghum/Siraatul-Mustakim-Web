"use client";

import { Calendar, ChevronDown, ChevronLeft, ChevronRight, MapPin, Settings } from "lucide-react";
import type { District } from "@/data/bdDistricts";
import { useLocale } from "@/hooks/use-locale";
import { useTranslations } from "@/hooks/use-translations";
import { getMonthName } from "@/lib/banglaFormat";
import styles from "@/styles/prayer-calendar.module.css";

type CalendarToolbarProps = {
  month: number;
  district: District;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onOpenPicker: () => void;
  onOpenSettings: () => void;
  onOpenLocation: () => void;
  monthButtonRef: React.RefObject<HTMLButtonElement | null>;
  settingsButtonRef: React.RefObject<HTMLButtonElement | null>;
  locationButtonRef: React.RefObject<HTMLButtonElement | null>;
};

const CalendarToolbar = ({
  month,
  district,
  onPrevMonth,
  onNextMonth,
  onOpenPicker,
  onOpenSettings,
  onOpenLocation,
  monthButtonRef,
  settingsButtonRef,
  locationButtonRef,
}: CalendarToolbarProps) => {
  const t = useTranslations();
  const { locale } = useLocale();
  const isGlobal = district.id.startsWith("global-") || district.id === "detected";

  return (
    <div className={styles.toolbar}>
      <h1 className={styles.title}>{t("prayerTimes.calendar.title")}</h1>

      <div className={styles.controlRow}>
        <div className={styles.leftControls}>
          <button
            type="button"
            ref={locationButtonRef}
            className={styles.location}
            onClick={onOpenLocation}
            title={t("prayerTimes.calendar.location.title")}
          >
            <MapPin className={styles.locationIcon} aria-hidden="true" />
            {district.name[locale]}
            {!isGlobal && `, ${t("prayerTimes.calendar.location.country")}`}
            <ChevronDown className={styles.chevronIcon} aria-hidden="true" />
          </button>

          <div className={styles.monthNav}>
            <button
              type="button"
              className={`${styles.ghostButton} ${styles.navButton}`}
              onClick={onPrevMonth}
              title={t("prayerTimes.calendar.prevMonth")}
              aria-label={t("prayerTimes.calendar.prevMonth")}
            >
              <ChevronLeft className={styles.navIcon} aria-hidden="true" />
            </button>

            <button
              type="button"
              ref={monthButtonRef}
              className={`${styles.ghostButton} ${styles.monthButton}`}
              onClick={onOpenPicker}
              title={t("prayerTimes.calendar.selectMonth")}
            >
              <Calendar className={styles.monthIcon} aria-hidden="true" />
              {getMonthName(month, locale)}
            </button>

            <button
              type="button"
              className={`${styles.ghostButton} ${styles.navButton}`}
              onClick={onNextMonth}
              title={t("prayerTimes.calendar.nextMonth")}
              aria-label={t("prayerTimes.calendar.nextMonth")}
            >
              <ChevronRight className={styles.navIcon} aria-hidden="true" />
            </button>
          </div>
        </div>

        <button
          type="button"
          ref={settingsButtonRef}
          className={`${styles.ghostButton} ${styles.settingsButton}`}
          onClick={onOpenSettings}
          title={t("prayerTimes.actions.settings")}
        >
          <Settings className={styles.settingsIcon} aria-hidden="true" />
          <span className={styles.settingsLabel}>{t("prayerTimes.actions.settings")}</span>
        </button>
      </div>
    </div>
  );
};

export default CalendarToolbar;
