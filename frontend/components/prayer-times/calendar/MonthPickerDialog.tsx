"use client";

import { X } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { useTranslations } from "@/hooks/use-translations";
import { getMonthName } from "@/lib/banglaFormat";
import styles from "@/styles/prayer-calendar.module.css";
import DialogShell from "./DialogShell";

type MonthPickerDialogProps = {
  /** month the table is showing */
  selectedMonth: number;
  /** the real calendar month, outlined in the grid */
  currentMonth: number;
  onSelect: (month: number) => void;
  onClose: () => void;
};

const MONTH_INDEXES = Array.from({ length: 12 }, (_, index) => index);

const MonthPickerDialog = ({
  selectedMonth,
  currentMonth,
  onSelect,
  onClose,
}: MonthPickerDialogProps) => {
  const t = useTranslations();
  const { locale } = useLocale();

  return (
    <DialogShell
      label={t("prayerTimes.calendar.picker.heading")}
      onClose={onClose}
      className={styles.dialogWide}
    >
      <div className={styles.dialogHeader}>
        <h2 className={styles.dialogHeading}>{t("prayerTimes.calendar.picker.heading")}</h2>
        <button
          type="button"
          className={styles.dialogClose}
          onClick={onClose}
          aria-label={t("prayerTimes.calendar.picker.close")}
        >
          <X className={styles.dialogCloseIcon} aria-hidden="true" />
        </button>
      </div>

      <div className={styles.monthGrid}>
        {MONTH_INDEXES.map((month) => {
          const isSelected = month === selectedMonth;
          const isCurrent = month === currentMonth;

          const className = [
            styles.monthOption,
            isSelected && styles.monthOptionSelected,
            !isSelected && isCurrent && styles.monthOptionCurrent,
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={month}
              type="button"
              className={className}
              aria-pressed={isSelected}
              onClick={() => onSelect(month)}
            >
              {getMonthName(month, locale)}
            </button>
          );
        })}
      </div>

      <div className={styles.dialogFooter}>
        <button type="button" className={styles.dialogGhost} onClick={() => onSelect(currentMonth)}>
          {t("prayerTimes.calendar.picker.thisMonth")}
        </button>
        <button type="button" className={styles.dialogPrimary} onClick={onClose}>
          {t("prayerTimes.calendar.picker.done")}
        </button>
      </div>
    </DialogShell>
  );
};

export default MonthPickerDialog;
