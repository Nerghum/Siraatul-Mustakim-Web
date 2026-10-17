"use client";

import { Calendar as CalendarIcon } from "lucide-react";
import type React from "react";
import { SkeletonBar as Skeleton } from "@/components/ui/skeleton-bar";
import { useLocale } from "@/hooks/use-locale";
import { formatLocalizedDate } from "@/lib/banglaFormat";
import styles from "@/styles/bayan-schedule.module.css";

type EventListSkeletonProps = {
  selectedDate: string; // "YYYY-MM-DD"
  /** Number of placeholder event cards to render. */
  count?: number;
};

const VARIANTS = [
  { card: styles.variantAmber, icon: styles.cardIconAmber },
  { card: styles.variantGreen, icon: styles.cardIconGreen },
] as const;

/**
 * Mirrors EventList, reusing the same wrappers so the spacing matches. The date
 * heading (derived from the selected day, not the API) and each card's calendar
 * icon render for real; only the dynamic values (title, time, location) shimmer.
 */
const EventListSkeleton: React.FC<EventListSkeletonProps> = ({ selectedDate, count = 3 }) => {
  const { locale } = useLocale();
  const formattedDate = formatLocalizedDate(selectedDate, locale);

  return (
    <div className={styles.eventListWrapper} aria-busy="true">
      <h3 className={styles.dateHeading}>{formattedDate}</h3>

      <div className={styles.scrollContainer}>
        {Array.from({ length: count }).map((_, i) => {
          const variant = VARIANTS[i % VARIANTS.length];
          return (
            <div key={i} className={`${styles.eventCard} ${variant.card}`} aria-hidden="true">
              <div className={styles.cardHeader}>
                <CalendarIcon className={variant.icon} aria-hidden="true" />
                <h4 className={styles.cardTitle}>
                  <Skeleton className="h-[20px] w-[128px]" />
                </h4>
              </div>
              <div className={styles.cardContent}>
                <p className={styles.cardMeta}>
                  <Skeleton className="h-[16px] w-[112px]" />
                </p>
                <p className={styles.cardLocation}>
                  <Skeleton className="h-[16px] w-[160px]" />
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventListSkeleton;
