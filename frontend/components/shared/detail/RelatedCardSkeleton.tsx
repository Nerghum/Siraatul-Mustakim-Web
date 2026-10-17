"use client";

import type React from "react";
import { SkeletonBar as Skeleton } from "@/components/ui/skeleton-bar";
import styles from "@/styles/essential-masail.module.css";

/**
 * Mirrors RelatedCard / RelatedQuestionCard. Skeletons render pure placeholder shapes
 * without static icons or links so that during loading only the loader is visible.
 */
const RelatedCardSkeleton: React.FC = () => {
  return (
    <article className={styles.card} aria-hidden="true">
      <div className={styles.cardTopContent}>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-[1.25rem] w-full" />
          <Skeleton className="h-[1.25rem] w-2/3" />
        </div>
        <div className="flex flex-col gap-2 mt-3">
          <Skeleton className="h-[0.875rem] w-full" />
          <Skeleton className="h-[0.875rem] w-full" />
          <Skeleton className="h-[0.875rem] w-1/2" />
        </div>
        <div className="mt-3">
          <Skeleton className="h-[0.8125rem] w-[80px]" />
        </div>
      </div>

      <div>
        <hr className={styles.cardDivider} />
        <div className={styles.cardFooter}>
          <span className={styles.cardAuthor}>
            <Skeleton className="h-[0.8125rem] w-[100px]" />
          </span>
          <span className={styles.cardLink}>
            <Skeleton className="h-[0.8125rem] w-[48px]" />
          </span>
        </div>
      </div>
    </article>
  );
};

export default RelatedCardSkeleton;
