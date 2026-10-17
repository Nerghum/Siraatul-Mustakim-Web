"use client";

import {
  Pause,
  Play,
  Repeat,
  Repeat1,
  RotateCcw,
  Shuffle,
  SkipBack,
  SkipForward,
} from "lucide-react";
import type React from "react";
import styles from "@/styles/recent-bayan.module.css";

export type RepeatMode = "off" | "all" | "one";

type TransportControlsProps = {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
  shuffle: boolean;
  onToggleShuffle: () => void;
  repeatMode: RepeatMode;
  onCycleRepeat: () => void;
  hasPrev: boolean;
  hasNext: boolean;
};

const TransportControls: React.FC<TransportControlsProps> = ({
  isPlaying,
  onTogglePlay,
  onPrevTrack,
  onNextTrack,
  shuffle,
  onToggleShuffle,
  repeatMode,
  onCycleRepeat,
  hasPrev,
  hasNext,
}) => {
  return (
    <div className={styles.controlsRow}>
      {/* 1. Shuffle */}
      <button
        type="button"
        className={`${styles.ctrlBtn} ${shuffle ? styles.ctrlBtnActive : ""}`}
        onClick={onToggleShuffle}
        aria-label={shuffle ? "শাফল বন্ধ করুন" : "শাফল চালু করুন"}
        aria-pressed={shuffle}
        title={shuffle ? "শাফল: চালু" : "শাফল: বন্ধ"}
      >
        <Shuffle className="w-[14px] h-[14px]" />
      </button>

      {/* 2. Previous Track */}
      <button
        type="button"
        className={styles.ctrlBtn}
        onClick={onPrevTrack}
        disabled={!hasPrev && repeatMode === "off"}
        aria-label="পূর্ববর্তী বয়ান"
        title="পূর্ববর্তী বয়ান"
      >
        <SkipBack className="w-[14px] h-[14px]" />
      </button>

      {/* 3. Main Play / Pause Button */}
      <button
        type="button"
        className={styles.playPauseMainBtn}
        onClick={onTogglePlay}
        aria-label={isPlaying ? "বিরতি দিন" : "প্লে করুন"}
        title={isPlaying ? "বিরতি দিন" : "প্লে করুন"}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 fill-current ml-0.5" />
        )}
      </button>

      {/* 4. Next Track */}
      <button
        type="button"
        className={styles.ctrlBtn}
        onClick={onNextTrack}
        disabled={!hasNext && repeatMode === "off"}
        aria-label="পরবর্তী বয়ান"
        title="পরবর্তী বয়ান"
      >
        <SkipForward className="w-[14px] h-[14px]" />
      </button>

      {/* 5. Repeat Mode */}
      <button
        type="button"
        className={`${styles.ctrlBtn} ${repeatMode !== "off" ? styles.ctrlBtnActive : ""}`}
        onClick={onCycleRepeat}
        aria-label={
          repeatMode === "one"
            ? "একটি বয়ান পুনরাবৃত্তি"
            : repeatMode === "all"
              ? "সব বয়ান পুনরাবৃত্তি"
              : "পুনরাবৃত্তি বন্ধ"
        }
        aria-pressed={repeatMode !== "off"}
        title={
          repeatMode === "one"
            ? "পুনরাবৃত্তি: একটি"
            : repeatMode === "all"
              ? "পুনরাবৃত্তি: সব"
              : "পুনরাবৃত্তি: বন্ধ"
        }
      >
        {repeatMode === "one" ? (
          <Repeat1 className="w-[14px] h-[14px]" />
        ) : (
          <Repeat className="w-[14px] h-[14px]" />
        )}
      </button>
    </div>
  );
};

export default TransportControls;
