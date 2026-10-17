"use client";

import { SkeletonBar } from "@/components/ui/skeleton-bar";
import styles from "@/styles/prayer-times.module.css";

/**
 * Task 12: Renders clean full-card skeleton placeholders for the prayer
 * highlight section matching exact card dimensions and layout without inner
 * broken text or icon fragments.
 */
const PrayerHighlightSkeleton = () => {
  return (
    <div className={styles.cardLayout} aria-busy="true">
      <SkeletonBar className={styles.currentCardSkeleton} />
      <SkeletonBar className={styles.gridCardSkeleton} />
    </div>
  );
};

export default PrayerHighlightSkeleton;
