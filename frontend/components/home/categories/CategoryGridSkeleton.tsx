"use client";

import type React from "react";
import { SkeletonBar as Skeleton } from "@/components/ui/skeleton-bar";
import styles from "@/styles/categories.module.css";

type CategoryGridSkeletonProps = {
  /** Number of placeholder tiles to render. */
  count?: number;
};

/**
 * Mirrors the category grid, reusing the same card/iconWrapper wrappers so the
 * spacing matches. Every tile (icon, href and label) comes from the fetched
 * data, so the whole card shimmers.
 */
const CategoryGridSkeleton: React.FC<CategoryGridSkeletonProps> = ({ count = 12 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={styles.card} aria-hidden="true">
        <div className={styles.iconWrapper}>
          <Skeleton className="w-[40px] h-[40px] rounded-full" />
        </div>
        <Skeleton className="h-[16px] w-[64px]" />
      </div>
    ))}
  </>
);

export default CategoryGridSkeleton;
