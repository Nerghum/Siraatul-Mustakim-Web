"use client";

import type React from "react";
import { SkeletonBar as Skeleton } from "@/components/ui/skeleton-bar";
import styles from "@/styles/listing.module.css";

type CardListSkeletonProps = {
  /** Number of placeholder cards to render. */
  count?: number;
  /** Q&A cards carry a question number placeholder line under the title. */
  withQuestionNo?: boolean;
};

/**
 * Mirrors QuestionCard / ListingCard one-for-one. Skeletons render pure placeholder
 * bars and pills without static icons or chrome so that during loading only the
 * loader is visible.
 */
const CardListSkeleton: React.FC<CardListSkeletonProps> = ({
  count = 6,
  withQuestionNo = false,
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <article key={i} className={styles.card} aria-hidden="true">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-[1.25rem] w-11/12" />
            <Skeleton className="h-[1.25rem] w-2/3" />
          </div>

          {withQuestionNo && (
            <div className="mt-2.5">
              <Skeleton className="h-[0.8125rem] w-[5rem]" />
            </div>
          )}

          <div className="flex flex-col gap-2 mt-3.5">
            <Skeleton className="h-[0.9375rem] w-full" />
            <Skeleton className="h-[0.9375rem] w-full" />
            <Skeleton className="h-[0.9375rem] w-full" />
            <Skeleton className="h-[0.9375rem] w-2/3" />
          </div>

          <div className={styles.metaRow}>
            <Skeleton className="h-[1.125rem] w-[5.5rem] rounded-full" />
            <Skeleton className="h-[1.125rem] w-[4.5rem] rounded-full" />
          </div>
        </article>
      ))}
    </>
  );
};

export default CardListSkeleton;
