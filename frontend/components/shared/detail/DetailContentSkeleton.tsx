"use client";

import type React from "react";
import { SkeletonBar as Skeleton } from "@/components/ui/skeleton-bar";
import { useTranslations } from "@/hooks/use-translations";
import { cn } from "@/lib/utils";
import styles from "@/styles/detail.module.css";
import type { ListingNamespace } from "@/types/listing";

/**
 * Mirrors DetailCard one-for-one. Skeletons render pure placeholder shapes
 * without static icons or action buttons so that during loading only the
 * loader is visible.
 */
const DetailContentSkeleton: React.FC<{ namespace: ListingNamespace }> = ({ namespace }) => {
  const t = useTranslations();

  return (
    <div className={styles.mainColumn} aria-busy="true">
      <article className={styles.card}>
        <div className="flex flex-col gap-2 mb-4">
          <Skeleton className="h-[24px] w-11/12" />
          <Skeleton className="h-[24px] w-2/3" />
        </div>

        {/* AuthorBlock placeholder */}
        <div className={styles.authorBlock}>
          <Skeleton className="w-[40px] h-[40px] rounded-full shrink-0" />
          <div className="flex flex-col gap-1.5 justify-center">
            <Skeleton className="w-[144px] h-[16px] rounded-md" />
            <Skeleton className="w-[96px] h-[14px] rounded-md" />
          </div>
        </div>

        <div className={cn(styles.metaRow, styles.metaRowDesktop)}>
          <Skeleton className="h-[28px] w-[80px] rounded-full" />
          <Skeleton className="h-[28px] w-[64px] rounded-full" />
          <Skeleton className="h-[28px] w-[90px] rounded-full" />
          <Skeleton className="h-[28px] w-[90px] rounded-full" />
        </div>

        <div className={styles.tagRow}>
          <Skeleton className="h-[28px] w-[96px] rounded-full" />
          <Skeleton className="h-[28px] w-[80px] rounded-full" />
        </div>

        <div className={cn(styles.tagRow, styles.topicsTop)}>
          <Skeleton className="h-[28px] w-[96px] rounded-full" />
          <Skeleton className="h-[28px] w-[112px] rounded-full" />
        </div>

        <hr className={styles.divider} />

        <p className={styles.bodyLabel}>{t(`${namespace}.detail.bodyLabel`)}</p>

        <div className="flex flex-col gap-3 mt-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn("h-[16px]", i % 4 === 3 ? "w-2/3" : i % 2 === 0 ? "w-full" : "w-[94%]")}
            />
          ))}
        </div>
      </article>
    </div>
  );
};

export default DetailContentSkeleton;
