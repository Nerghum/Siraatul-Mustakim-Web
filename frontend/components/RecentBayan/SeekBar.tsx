"use client";

import type React from "react";
import { useLocale } from "@/hooks/use-locale";
import { formatLocalizedTime } from "@/lib/banglaFormat";
import styles from "@/styles/recent-bayan.module.css";

type SeekBarProps = {
  currentTime: number;
  duration: number;
  onSeek: (timeSec: number) => void;
};

const SeekBar: React.FC<SeekBarProps> = ({ currentTime, duration, onSeek }) => {
  const { locale } = useLocale();
  const formattedCurrentTime = formatLocalizedTime(currentTime, locale);
  const formattedDuration = formatLocalizedTime(duration, locale);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    onSeek(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onSeek(Math.max(0, currentTime - 5));
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onSeek(Math.min(duration, currentTime + 5));
    } else if (e.key === "Home") {
      e.preventDefault();
      onSeek(0);
    } else if (e.key === "End") {
      e.preventDefault();
      onSeek(duration);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={styles.seekBarWrapper}>
      <input
        type="range"
        min={0}
        max={duration || 100}
        value={currentTime}
        onChange={handleSliderChange}
        onKeyDown={handleKeyDown}
        className={styles.rangeInput}
        aria-label={locale === "en" ? "Bayan Progress" : "বয়ানের অগ্রগতি"}
        aria-valuetext={`${formattedCurrentTime} / ${formattedDuration}`}
        style={{
          background: `linear-gradient(to right, #008e48 0%, #008e48 ${progressPercent}%, #e5e7eb ${progressPercent}%, #e5e7eb 100%)`,
        }}
      />

      <div className={styles.timeRow}>
        <span>{formattedCurrentTime}</span>
        <span>{formattedDuration}</span>
      </div>
    </div>
  );
};

export default SeekBar;
