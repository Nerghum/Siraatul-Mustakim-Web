"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type React from "react";
import { useMemo, useRef } from "react";
import type { BayanEvent } from "@/data/mockBayanSchedule";
import { useLocale } from "@/hooks/use-locale";
import { getMonthName, getWeekdaysShort, toLocalizedNumber } from "@/lib/banglaFormat";
import styles from "@/styles/bayan-schedule.module.css";

type CalendarProps = {
  currentMonth: Date;
  selectedDate: string; // "YYYY-MM-DD"
  events: BayanEvent[];
  onSelectDate: (dateStr: string) => void;
  onChangeMonth: (nextMonth: Date) => void;
};

function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const Calendar: React.FC<CalendarProps> = ({
  currentMonth,
  selectedDate,
  events,
  onSelectDate,
  onChangeMonth,
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const { locale } = useLocale();

  const todayStr = useMemo(() => formatDateKey(new Date()), []);

  const eventDatesSet = useMemo(() => {
    return new Set(events.map((e) => e.date));
  }, [events]);

  const monthYearLabel = useMemo(() => {
    const monthName = getMonthName(currentMonth.getMonth(), locale);
    const yearNum = toLocalizedNumber(currentMonth.getFullYear(), locale);
    return `${monthName} ${yearNum}`;
  }, [currentMonth, locale]);

  const weekdaysShort = useMemo(() => {
    return getWeekdaysShort(locale);
  }, [locale]);

  const daysGrid = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay();

    const gridStartDate = new Date(year, month, 1 - startDayOfWeek);
    const days: { date: Date; dateStr: string; isCurrentMonth: boolean }[] = [];

    for (let i = 0; i < 42; i++) {
      const d = new Date(
        gridStartDate.getFullYear(),
        gridStartDate.getMonth(),
        gridStartDate.getDate() + i,
      );
      days.push({
        date: d,
        dateStr: formatDateKey(d),
        isCurrentMonth: d.getMonth() === month,
      });
    }

    return days;
  }, [currentMonth]);

  const handlePrevMonth = () => {
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    onChangeMonth(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    onChangeMonth(next);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let targetIndex = -1;

    switch (e.key) {
      case "ArrowLeft":
        targetIndex = Math.max(0, index - 1);
        break;
      case "ArrowRight":
        targetIndex = Math.min(41, index + 1);
        break;
      case "ArrowUp":
        targetIndex = Math.max(0, index - 7);
        break;
      case "ArrowDown":
        targetIndex = Math.min(41, index + 7);
        break;
      default:
        return;
    }

    if (targetIndex !== -1 && gridRef.current) {
      e.preventDefault();
      const buttons = gridRef.current.querySelectorAll<HTMLButtonElement>("button");
      if (buttons[targetIndex]) {
        buttons[targetIndex].focus();
      }
    }
  };

  return (
    <div className={styles.calendarWrapper}>
      {/* Month Navigation */}
      <div className={styles.calendarNav}>
        <button
          type="button"
          className={styles.navBtn}
          onClick={handlePrevMonth}
          aria-label={locale === "en" ? "Previous month" : "পূর্ববর্তী মাস"}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className={styles.monthLabel}>{monthYearLabel}</span>
        <button
          type="button"
          className={styles.navBtn}
          onClick={handleNextMonth}
          aria-label={locale === "en" ? "Next month" : "পরবর্তী মাস"}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday Row */}
      <div className={styles.weekdayGrid} role="row">
        {weekdaysShort.map((day) => (
          <div key={day} className={styles.weekdayCell} role="columnheader">
            {day}
          </div>
        ))}
      </div>

      {/* 6x7 Days Grid */}
      <div className={styles.daysGrid} role="grid" ref={gridRef}>
        {daysGrid.map((item, index) => {
          const isSelected = item.dateStr === selectedDate;
          const isToday = item.dateStr === todayStr;
          const hasEvent = eventDatesSet.has(item.dateStr);

          const cellClasses = [
            styles.dayCell,
            !item.isCurrentMonth && styles.dayCellMuted,
            item.isCurrentMonth && styles.dayCellHover,
            isToday && styles.dayCellToday,
            isSelected && styles.dayCellSelected,
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={item.dateStr}
              type="button"
              role="gridcell"
              tabIndex={isSelected ? 0 : -1}
              aria-selected={isSelected}
              disabled={!item.isCurrentMonth}
              className={cellClasses}
              onClick={() => {
                if (item.isCurrentMonth) {
                  onSelectDate(item.dateStr);
                }
              }}
              onKeyDown={(e) => handleKeyDown(e, index)}
              aria-label={`${item.dateStr} ${hasEvent ? "bayan available" : ""}`}
            >
              <span className={styles.dayNumber}>
                {toLocalizedNumber(item.date.getDate(), locale)}
              </span>
              {hasEvent && item.isCurrentMonth && (
                <span className={styles.eventDot} aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
