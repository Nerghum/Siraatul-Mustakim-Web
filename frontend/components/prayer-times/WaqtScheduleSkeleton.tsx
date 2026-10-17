"use client";

import { SkeletonBar as Skeleton } from "@/components/ui/skeleton-bar";
import styles from "@/styles/prayer-times-page.module.css";

/**
 * Five placeholder waqt rows for WaqtSchedule, rendered as a fragment inside
 * the real `.rowList`. Reuses the row/tile/name/time classes so padding, gap
 * and the tile size match the loaded rows exactly; only the icon, name and
 * time shimmer.
 */
const WaqtScheduleSkeleton = () => (
  <>
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className={styles.row} aria-busy="true">
        <div className={styles.rowMain}>
          <span className={styles.tile}>
            <Skeleton className="w-[24px] h-[24px] rounded-md" />
          </span>
          <div>
            <p className={styles.rowName}>
              <Skeleton className="h-[16px] w-[96px]" />
            </p>
          </div>
        </div>

        <p className={styles.rowTime}>
          <Skeleton className="h-[24px] w-[112px]" />
        </p>
      </div>
    ))}
  </>
);

export default WaqtScheduleSkeleton;
