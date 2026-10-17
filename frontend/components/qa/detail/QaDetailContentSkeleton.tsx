"use client";

import type React from "react";
import { SkeletonBar as Skeleton } from "@/components/ui/skeleton-bar";
import { cn } from "@/lib/utils";
import styles from "@/styles/detail.module.css";

/**
 * Mirrors the question + answer panels one-for-one. Skeletons render pure
 * placeholder shapes without static icons or action buttons so that during
 * loading only the loader is visible.
 */
const QaDetailContentSkeleton: React.FC = () => {
  return (
    <div className={styles.mainColumn} aria-busy="true">
      {/* Question panel */}
      <section className={styles.card}>
        <div className="flex flex-col gap-2 mb-4">
          <Skeleton className="h-[24px] w-11/12" />
          <Skeleton className="h-[24px] w-2/3" />
        </div>

        <div className={styles.metaRow}>
          <Skeleton className="h-[28px] w-[80px] rounded-full" />
          <Skeleton className="h-[28px] w-[64px] rounded-full" />
          <Skeleton className="h-[28px] w-[60px] rounded-full" />
          <Skeleton className="h-[28px] w-[80px] rounded-full" />
        </div>

        <div className={styles.tagRow}>
          <Skeleton className="h-[28px] w-[96px] rounded-full" />
          <Skeleton className="h-[28px] w-[80px] rounded-full" />
        </div>

        <div className="mt-6 mb-3">
          <Skeleton className="h-[18px] w-[100px] rounded-md" />
        </div>

        <div className="flex flex-col gap-3">
          <Skeleton className="h-[16px] w-full" />
          <Skeleton className="h-[16px] w-full" />
          <Skeleton className="h-[16px] w-2/3" />
        </div>
      </section>

      {/* Answer panel */}
      <section className={styles.card}>
        <div className="mb-4">
          <Skeleton className="h-[18px] w-[90px] rounded-md" />
        </div>

        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn("h-[16px]", i % 3 === 2 ? "w-2/3" : i % 2 === 0 ? "w-full" : "w-[95%]")}
            />
          ))}
        </div>

        <div className={cn(styles.tagRow, "mt-4")}>
          <Skeleton className="h-[28px] w-[96px] rounded-full" />
          <Skeleton className="h-[28px] w-[112px] rounded-full" />
        </div>

        <div className={cn(styles.metaRow, "mt-4")}>
          <Skeleton className="h-[28px] w-[80px] rounded-full" />
          <Skeleton className="h-[28px] w-[80px] rounded-full" />
        </div>

        {/* AnswererCard placeholder */}
        <div className={styles.answerer}>
          <Skeleton className="w-[40px] h-[40px] rounded-full shrink-0" />
          <div className="flex flex-col gap-1.5 justify-center">
            <Skeleton className="w-[100px] h-[14px] rounded-md" />
            <Skeleton className="w-[140px] h-[16px] rounded-md" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default QaDetailContentSkeleton;
