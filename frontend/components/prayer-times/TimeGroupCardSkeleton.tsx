"use client";

import { SkeletonBar as Skeleton } from "@/components/ui/skeleton-bar";
import styles from "@/styles/prayer-times-page.module.css";

/**
 * Placeholder columns for TimeGroupCard, rendered as a fragment inside the
 * real `.groupBody`. Reuses groupItem/groupTile/groupName/groupTime so the
 * grid, tile size and vertical rhythm match the loaded card; the icon, name
 * and time shimmer.
 */
const TimeGroupCardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={styles.groupItem} aria-busy="true">
        <span className={styles.groupTile}>
          <Skeleton className="w-[32px] h-[32px] max-w-full rounded-md" />
        </span>

        <p className={styles.groupName}>
          <Skeleton className="h-[16px] w-[80px] max-w-full" />
        </p>

        <p className={styles.groupTime}>
          <Skeleton className="h-[20px] w-[96px] max-w-full" />
        </p>
      </div>
    ))}
  </>
);

export default TimeGroupCardSkeleton;
