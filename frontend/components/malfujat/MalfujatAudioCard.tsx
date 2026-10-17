"use client";

import { Pause, Play } from "lucide-react";
import React from "react";
import type { Bayan } from "@/data/mockRecentBayans";
import { useLocale } from "@/hooks/use-locale";
import { formatLocalizedShortDate, formatLocalizedTime } from "@/lib/banglaFormat";
import styles from "@/styles/malfujat.module.css";
import bayanStyles from "@/styles/recent-bayan.module.css";

type Props = {
  item: Bayan;
  isActive: boolean;
  isPlaying: boolean;
  onTogglePlay: () => void;
};

export default function MalfujatAudioCard({ item, isActive, isPlaying, onTogglePlay }: Props) {
  const { locale } = useLocale();
  const formattedDate = formatLocalizedShortDate(item.date, locale);
  const formattedDuration = formatLocalizedTime(item.durationSec || 1800, locale);

  const rowClasses = [
    styles.inlineAudioCard,
    isActive ? styles.inlineAudioCardActive : styles.inlineAudioCardNormal,
  ]
    .filter(Boolean)
    .join(" ");

  const playBtnClasses = [
    bayanStyles.itemPlayBtn,
    isActive && isPlaying && bayanStyles.itemPlayBtnPlaying,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={rowClasses}
      onClick={onTogglePlay}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onTogglePlay();
        }
      }}
    >
      <div className={styles.inlineAudioLeft}>
        <div className={playBtnClasses}>
          {isActive && isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </div>

        <div className={bayanStyles.itemTextGroup}>
          <h4 className={bayanStyles.itemTitle}>{item.title}</h4>
          <p className={bayanStyles.itemSpeaker}>{item.speaker}</p>
          <p className={bayanStyles.itemMeta}>
            {formattedDate} - {item.location}
          </p>
        </div>

        <span className={bayanStyles.itemDuration}>{formattedDuration}</span>
      </div>
    </div>
  );
}
