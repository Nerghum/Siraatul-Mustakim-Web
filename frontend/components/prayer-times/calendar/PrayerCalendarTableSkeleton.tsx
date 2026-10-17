"use client";

import { SkeletonBar as Skeleton } from "@/components/ui/skeleton-bar";
import { CALENDAR_COLUMNS, IQAMAH_OFFSETS } from "@/data/mockPrayerCalendar";
import styles from "@/styles/prayer-calendar.module.css";

type PrayerCalendarTableSkeletonProps = {
  /** number of placeholder day rows — matches the month's length */
  rowCount: number;
  /** mirror the iqamah sub-line so the row height matches the loaded table */
  iqamah: boolean;
};

/**
 * Placeholder `<tr>` rows for PrayerCalendarTable's body, rendered as a
 * fragment inside the real `<tbody>`. Reuses bodyRow/cell/iqamahLine so the
 * zebra striping, padding and (optional) iqamah line height match the loaded
 * table exactly; every date and time value shimmers.
 */
const PrayerCalendarTableSkeleton = ({ rowCount, iqamah }: PrayerCalendarTableSkeletonProps) => (
  <>
    {Array.from({ length: rowCount }).map((_, i) => (
      <tr key={i} className={styles.bodyRow} aria-busy="true">
        <td className={styles.cell}>
          <Skeleton className="h-[22px] w-[28px] mx-auto" />
        </td>
        {CALENDAR_COLUMNS.map((column) => (
          <td key={column} className={styles.cell}>
            <Skeleton className="h-[22px] w-[56px] mx-auto" />
            {iqamah && IQAMAH_OFFSETS[column] !== undefined && (
              <span className={styles.iqamahLine}>
                <Skeleton className="h-[14px] w-[44px] mx-auto" />
              </span>
            )}
          </td>
        ))}
      </tr>
    ))}
  </>
);

export default PrayerCalendarTableSkeleton;
