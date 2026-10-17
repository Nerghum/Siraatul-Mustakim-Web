"use client";

import type React from "react";
import { SkeletonBar as Skeleton } from "@/components/ui/skeleton-bar";
import styles from "@/styles/books.module.css";

type BookCoverGridSkeletonProps = {
  /** Number of placeholder book tiles. */
  count?: number;
};

/**
 * Just the shimmering book tiles — no chrome. Reuses the real bookCard/cover/
 * title/author classes so spacing matches; used both inline while the list
 * fetches and inside the Suspense fallback.
 */
const BookCoverGridSkeleton: React.FC<BookCoverGridSkeletonProps> = ({ count = 6 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={styles.bookCard} aria-hidden="true">
        <div className={`${styles.bookCover} ${styles.bookCoverSkeleton}`}>
          <Skeleton style={{ position: "absolute", inset: 0 }} />
        </div>
        <h3 className={styles.bookTitle}>
          <Skeleton className="h-[1rem]" style={{ width: "85%", margin: "0 auto" }} />
        </h3>
        <p className={styles.bookAuthor}>
          <Skeleton className="h-[0.8125rem]" style={{ width: "60%", margin: "0 auto" }} />
        </p>
      </div>
    ))}
  </>
);

export default BookCoverGridSkeleton;
