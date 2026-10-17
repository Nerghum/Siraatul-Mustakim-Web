"use client";

import type { District } from "@/data/bdDistricts";
import { useLocale } from "@/hooks/use-locale";
import { useTranslations } from "@/hooks/use-translations";
import { toLocalizedNumber } from "@/lib/banglaFormat";
import styles from "@/styles/prayer-calendar.module.css";

type CalendarNotesProps = {
  district: District;
  /** when off, the table already follows the 2025 announcement */
  precaution: boolean;
};

/**
 * The two-paragraph footnote under the table. Split into keys rather than one
 * blob so the coloured terms stay real markup.
 */
const CalendarNotes = ({ district, precaution }: CalendarNotesProps) => {
  const t = useTranslations();
  const { locale } = useLocale();

  const chip = (value: number) => (
    <span className={styles.chip}>{toLocalizedNumber(value, locale)}</span>
  );

  const city = <span className={styles.city}>{district.name[locale]}</span>;

  return (
    <div className={styles.notes}>
      <p className={styles.notesParagraph}>
        {precaution ? (
          <>
            {t("prayerTimes.calendar.notes.builtForPrefix")} {city}{" "}
            {t("prayerTimes.calendar.notes.builtForSuffix")}{" "}
            <span className={styles.bullet} aria-hidden="true">
              ●
            </span>{" "}
            {t("prayerTimes.calendar.notes.sahriAdjust")}{" "}
            <span className={styles.bullet} aria-hidden="true">
              ●
            </span>{" "}
            {t("prayerTimes.calendar.notes.maghribAdjust")}
          </>
        ) : (
          <>
            {t("prayerTimes.calendar.notes.withoutPrecautionPrefix")} {city}{" "}
            {t("prayerTimes.calendar.notes.withoutPrecautionSuffix")}
          </>
        )}{" "}
        | <span className={styles.term}>{t("prayerTimes.calendar.notes.ishraq")}</span> -{" "}
        {t("prayerTimes.calendar.notes.ishraqValue")} |{" "}
        <span className={styles.term}>{t("prayerTimes.calendar.notes.zawal")}</span> -{" "}
        {t("prayerTimes.calendar.notes.zawalValue")} |{" "}
        <span className={styles.term}>{t("prayerTimes.calendar.notes.sunset")}</span> -{" "}
        {t("prayerTimes.calendar.notes.sunsetValue")}
      </p>

      <p className={styles.notesParagraph}>
        <span className={styles.term}>{t("prayerTimes.calendar.notes.forbiddenLabel")}</span>{" "}
        {chip(1)} {t("prayerTimes.calendar.notes.forbidden1")} {chip(2)}{" "}
        {t("prayerTimes.calendar.notes.forbidden2")} {chip(3)}{" "}
        {t("prayerTimes.calendar.notes.forbidden3")}
      </p>
    </div>
  );
};

export default CalendarNotes;
