"use client";

import React from "react";
import type { BayanEvent } from "@/data/mockBayanSchedule";
import { useTranslations } from "@/hooks/use-translations";
import styles from "@/styles/bayan-schedule.module.css";
import Calendar from "./Calendar";

type Props = {
  open: boolean;
  onClose: () => void;
  currentMonth: Date;
  selectedDate: string;
  events: BayanEvent[];
  onSelectDate: (dateStr: string) => void;
  onChangeMonth: (nextMonth: Date) => void;
};

/** Centered calendar popup — mobile replacement for the inline calendar card. */
const BayanCalendarModal: React.FC<Props> = ({
  open,
  onClose,
  currentMonth,
  selectedDate,
  events,
  onSelectDate,
  onChangeMonth,
}) => {
  const t = useTranslations();

  React.useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  // Selecting a date scrolls the list, then closes the popup.
  const handleSelect = (dateStr: string) => {
    onSelectDate(dateStr);
    onClose();
  };

  return (
    <div
      className={styles.calendarModalOverlay}
      role="dialog"
      aria-modal="true"
      aria-label={t("home.bayanSchedule.openCalendar")}
    >
      <div className={styles.calendarModalBackdrop} onClick={onClose} />
      <div className={styles.calendarModalCard}>
        <Calendar
          currentMonth={currentMonth}
          selectedDate={selectedDate}
          events={events}
          onSelectDate={handleSelect}
          onChangeMonth={onChangeMonth}
        />
      </div>
    </div>
  );
};

export default BayanCalendarModal;
