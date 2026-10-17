"use client";

import { CalendarX } from "lucide-react";
import type React from "react";
import type { BayanEvent } from "@/data/mockBayanSchedule";
import { useLocale } from "@/hooks/use-locale";
import { useTranslations } from "@/hooks/use-translations";
import { formatLocalizedDate } from "@/lib/banglaFormat";
import styles from "@/styles/bayan-schedule.module.css";
import EventCard from "./EventCard";

export type EventGroup = {
  date: string; // "YYYY-MM-DD"
  events: BayanEvent[];
};

type EventListProps = {
  groups: EventGroup[];
  onEventClick: (event: BayanEvent) => void;
  /** Registers each date-group wrapper so the calendar can scroll it into view. */
  registerRef: (date: string, el: HTMLDivElement | null) => void;
};

const EventList: React.FC<EventListProps> = ({ groups, onEventClick, registerRef }) => {
  const { locale } = useLocale();
  const t = useTranslations();

  if (groups.length === 0) {
    return (
      <div className={styles.emptyState}>
        <CalendarX className={styles.emptyIcon} aria-hidden="true" />
        <p className={styles.emptyTitle}>{t("home.bayanSchedule.empty")}</p>
        <p className={styles.emptySubtitle}>{t("home.bayanSchedule.emptyHint")}</p>
      </div>
    );
  }

  return (
    <div className={styles.scrollContainer}>
      {groups.map((group) => (
        <div
          key={group.date}
          ref={(el) => registerRef(group.date, el)}
          className={styles.dateGroup}
        >
          <h3 className={styles.dateHeading}>{formatLocalizedDate(group.date, locale)}</h3>
          <div className={styles.groupCards}>
            {group.events.map((event) => (
              <EventCard key={event.id} event={event} onClick={onEventClick} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventList;
