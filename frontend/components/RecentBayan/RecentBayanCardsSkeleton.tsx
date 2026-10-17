"use client";

import type React from "react";
import { SkeletonBar as Skeleton } from "@/components/ui/skeleton-bar";
import styles from "@/styles/recent-bayan.module.css";

type RecentBayanCardsSkeletonProps = {
  /** Number of placeholder list rows to render. */
  count?: number;
};

/**
 * Mirrors the two-column card grid (BayanList + PlayerPanel), reusing the same
 * wrappers so every gap and padding matches. The play glyph on each row and the
 * transport layout render as placeholders; the dynamic values (titles, speaker,
 * meta, duration, now-playing text) shimmer.
 */
const RecentBayanCardsSkeleton: React.FC<RecentBayanCardsSkeletonProps> = ({ count = 8 }) => (
  <>
    {/* Left Column: Bayan List */}
    <div className={styles.listColumn} aria-hidden="true">
      <div className={styles.listWrapper}>
        <div className={styles.listScrollArea}>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className={styles.listItem}>
              <div className={styles.itemPlayBtn}>
                <Skeleton className="w-[20px] h-[20px] rounded-full" />
              </div>
              <div className={styles.itemTextGroup}>
                <h4 className={styles.itemTitle}>
                  <Skeleton className="h-[20px] w-11/12" />
                </h4>
                <p className={styles.itemSpeaker}>
                  <Skeleton className="h-[16px] w-[128px] mt-[4px]" />
                </p>
                <p className={styles.itemMeta}>
                  <Skeleton className="h-[16px] w-[160px] mt-[4px]" />
                </p>
              </div>
              <span className={styles.itemDuration}>
                <Skeleton className="h-[16px] w-[48px]" />
              </span>
            </div>
          ))}
        </div>
        <div className={styles.fadeOverlay} aria-hidden="true" />
      </div>
    </div>

    {/* Right Column: Player Panel */}
    <div className={styles.playerColumn} aria-hidden="true">
      <div className={styles.playerCard}>
        <div className={styles.nowPlayingMeta}>
          <h3 className={styles.nowPlayingTitle}>
            <Skeleton className="h-[24px] w-3/4" />
          </h3>
          <p className={styles.nowPlayingSubtitle}>
            <Skeleton className="h-[16px] w-1/2 mt-[8px]" />
          </p>
        </div>

        <div className={styles.waveformContainer}>
          <Skeleton className="h-[56px] w-full" />
        </div>

        <div className={styles.seekBarWrapper}>
          <Skeleton className="h-[8px] w-full rounded-full" />
          <div className={styles.timeRow}>
            <Skeleton className="h-[16px] w-[40px]" />
            <Skeleton className="h-[16px] w-[40px]" />
          </div>
        </div>

        <div className={styles.controlsRow}>
          <Skeleton className="w-[36px] h-[36px] rounded-full" />
          <Skeleton className="w-[36px] h-[36px] rounded-full" />
          <Skeleton className="w-[48px] h-[48px] rounded-full" />
          <Skeleton className="w-[36px] h-[36px] rounded-full" />
          <Skeleton className="w-[36px] h-[36px] rounded-full" />
        </div>
      </div>
    </div>
  </>
);

export default RecentBayanCardsSkeleton;
