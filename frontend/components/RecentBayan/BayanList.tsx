"use client";

import type React from "react";
import type { Bayan } from "@/data/mockRecentBayans";
import styles from "@/styles/recent-bayan.module.css";
import BayanListItem from "./BayanListItem";

type BayanListProps = {
  bayans: Bayan[];
  currentTrackId: string;
  isPlaying: boolean;
  onSelectTrack: (bayan: Bayan) => void;
};

const BayanList: React.FC<BayanListProps> = ({
  bayans,
  currentTrackId,
  isPlaying,
  onSelectTrack,
}) => {
  return (
    <div className={styles.listWrapper}>
      <div className={styles.listScrollArea} role="list">
        {bayans.map((bayan) => {
          const isActive = bayan.id === currentTrackId;
          return (
            <div key={bayan.id} role="listitem">
              <BayanListItem
                bayan={bayan}
                isActive={isActive}
                isPlaying={isActive && isPlaying}
                onSelect={() => onSelectTrack(bayan)}
              />
            </div>
          );
        })}
      </div>
      <div className={styles.fadeOverlay} aria-hidden="true" />
    </div>
  );
};

export default BayanList;
