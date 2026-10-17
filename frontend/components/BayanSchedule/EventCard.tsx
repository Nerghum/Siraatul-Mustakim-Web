"use client";

import { Calendar as CalendarIcon } from "lucide-react";
import type React from "react";
import type { BayanEvent } from "@/data/mockBayanSchedule";
import styles from "@/styles/bayan-schedule.module.css";

type EventCardProps = {
  event: BayanEvent;
  onClick?: (event: BayanEvent) => void;
};

const VARIANT_MAP: Record<BayanEvent["type"], { card: string; icon: string }> = {
  amber: {
    card: styles.variantAmber,
    icon: styles.cardIconAmber,
  },
  green: {
    card: styles.variantGreen,
    icon: styles.cardIconGreen,
  },
};

const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const variant = VARIANT_MAP[event.type] || VARIANT_MAP.green;

  return (
    <button
      type="button"
      className={`${styles.eventCard} ${variant.card}`}
      onClick={() => onClick?.(event)}
    >
      <div className={styles.cardHeader}>
        <CalendarIcon className={variant.icon} aria-hidden="true" />
        <h4 className={styles.cardTitle}>{event.title}</h4>
      </div>
      <div className={styles.cardContent}>
        <p className={styles.cardMeta}>{event.time}</p>
        <p className={styles.cardLocation}>
          {event.districtName && !event.location.includes(event.districtName)
            ? `${event.location} (${event.districtName})`
            : event.location}
        </p>
      </div>
    </button>
  );
};

export default EventCard;
