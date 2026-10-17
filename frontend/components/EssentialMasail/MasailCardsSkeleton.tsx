"use client";

import type React from "react";
import { SkeletonBar as Skeleton } from "@/components/ui/skeleton-bar";
import styles from "@/styles/essential-masail.module.css";

type MasailCardsSkeletonProps = {
  /** Number of placeholder cards to render. */
  count?: number;
};

/**
 * Mirrors MasailCard one-for-one. Skeletons render pure placeholder shapes
 * without static icons or links so that during loading only the loader is visible.
 */
const MasailCardsSkeleton: React.FC<MasailCardsSkeletonProps> = ({ count = 6 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.card} aria-hidden="true">
          <div className={styles.cardTopContent}>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-[1.75rem] w-full" />
              <Skeleton className="h-[1.75rem] w-3/4" />
            </div>
            <div className="flex flex-col gap-2 mt-3">
              <Skeleton className="h-[1.05rem] w-full" />
              <Skeleton className="h-[1.05rem] w-full" />
              <Skeleton className="h-[1.05rem] w-full" />
              <Skeleton className="h-[1.05rem] w-2/3" />
            </div>
            <div className="mt-3">
              <Skeleton className="h-[0.8125rem] w-[4.5rem]" />
            </div>
          </div>

          <div>
            <hr className={styles.cardDivider} />
            <div className={styles.cardFooter}>
              <span className={styles.cardAuthor}>
                <Skeleton className="h-[0.8125rem] w-[9rem]" />
              </span>
              <span className={styles.cardLink}>
                <Skeleton className="h-[0.8125rem] w-[3.5rem]" />
              </span>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default MasailCardsSkeleton;
