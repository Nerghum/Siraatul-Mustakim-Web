"use client";

import {
  CALENDAR_COLUMNS,
  type CalendarRow,
  IQAMAH_OFFSETS,
  shiftTimeLabel,
} from "@/data/mockPrayerCalendar";
import { useLocale } from "@/hooks/use-locale";
import { useTranslations } from "@/hooks/use-translations";
import { toLocalizedNumber } from "@/lib/banglaFormat";
import styles from "@/styles/prayer-calendar.module.css";
import PrayerCalendarTableSkeleton from "./PrayerCalendarTableSkeleton";

type PrayerCalendarTableProps = {
  rows: CalendarRow[];
  /** day of month to highlight, or null when the table is not on this month */
  todayDay: number | null;
  /** adds the mosque iqamah line under the five fard columns */
  iqamah: boolean;
  /** true while the month is being fetched — the body shimmers */
  loading?: boolean;
  /** placeholder row count for the skeleton (the month's length) */
  rowCount?: number;
};

const PrayerCalendarTable = ({
  rows,
  todayDay,
  iqamah,
  loading = false,
  rowCount = 30,
}: PrayerCalendarTableProps) => {
  const t = useTranslations();
  const { locale } = useLocale();

  return (
    <div className={styles.tableScroll}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.headCell} scope="col">
              {t("prayerTimes.calendar.columns.date")}
            </th>
            {CALENDAR_COLUMNS.map((column) => (
              <th key={column} className={styles.headCell} scope="col">
                {t(`prayerTimes.calendar.columns.${column}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <PrayerCalendarTableSkeleton rowCount={rowCount} iqamah={iqamah} />
          ) : (
            rows.map((row) => (
              <tr
                key={row.day}
                className={`${styles.bodyRow} ${row.day === todayDay ? styles.bodyRowToday : ""}`}
              >
                <td className={styles.cell}>{toLocalizedNumber(row.day, locale)}</td>
                {CALENDAR_COLUMNS.map((column) => {
                  const iqamahOffset = IQAMAH_OFFSETS[column];

                  return (
                    <td key={column} className={styles.cell}>
                      {toLocalizedNumber(row.times[column], locale)}
                      {iqamah && iqamahOffset !== undefined && (
                        <span className={styles.iqamahLine}>
                          {t("prayerTimes.calendar.iqamahLabel")}{" "}
                          {toLocalizedNumber(
                            shiftTimeLabel(row.times[column], iqamahOffset),
                            locale,
                          )}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PrayerCalendarTable;
