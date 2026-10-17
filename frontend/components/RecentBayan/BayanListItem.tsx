"use client";

import { Pause, Play } from "lucide-react";
import type React from "react";
import type { Bayan } from "@/data/mockRecentBayans";
import { useLocale } from "@/hooks/use-locale";
import { formatLocalizedShortDate, formatLocalizedTime } from "@/lib/banglaFormat";
import styles from "@/styles/recent-bayan.module.css";

type BayanListItemProps = {
  bayan: Bayan;
  isActive: boolean;
  isPlaying: boolean;
  onSelect: () => void;
};

const BayanListItem: React.FC<BayanListItemProps> = ({ bayan, isActive, isPlaying, onSelect }) => {
  const { locale } = useLocale();
  const formattedDate = formatLocalizedShortDate(bayan.date, locale);
  const formattedDuration = formatLocalizedTime(bayan.durationSec, locale);

  const rowClasses = [styles.listItem, isActive && styles.listItemActive].filter(Boolean).join(" ");

  const playBtnClasses = [styles.itemPlayBtn, isActive && isPlaying && styles.itemPlayBtnPlaying]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={rowClasses}
      onClick={onSelect}
      aria-label={`${bayan.title}, ${bayan.speaker}, ${bayan.location}`}
      aria-current={isActive ? "true" : undefined}
    >
      <div className={playBtnClasses}>
        {isActive && isPlaying ? (
          <Pause className="w-5 h-5 fill-current" />
        ) : (
          <Play className="w-5 h-5 fill-current ml-0.5" />
        )}
      </div>

      <div className={styles.itemTextGroup}>
        <h4 className={styles.itemTitle}>{bayan.title}</h4>
        <p className={styles.itemSpeaker}>{bayan.speaker}</p>
        <p className={styles.itemMeta}>
          {formattedDate} - {bayan.location}
        </p>
      </div>

      <span className={styles.itemDuration}>{formattedDuration}</span>
    </button>
  );
};

export default BayanListItem;
