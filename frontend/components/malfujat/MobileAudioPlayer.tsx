"use client";

import { Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "@/hooks/use-locale";
import { useRipple } from "@/hooks/use-ripple";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { formatLocalizedShortDate } from "@/lib/banglaFormat";
import styles from "@/styles/malfujat.module.css";

export default function MobileAudioPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    prevTrack,
    nextTrack,
    shuffle,
    toggleShuffle,
    repeatMode,
    cycleRepeat,
    seek,
    closePlayer,
    isOpen,
  } = useAudioPlayer();

  const { locale } = useLocale();
  const createRipple = useRipple();
  const [mounted, setMounted] = useState(false);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("mobile-player-active");
    } else {
      document.body.classList.remove("mobile-player-active");
    }
    return () => {
      document.body.classList.remove("mobile-player-active");
    };
  }, [isOpen]);

  if (!mounted || !isOpen || !currentTrack) return null;

  const formattedDate = formatLocalizedShortDate(currentTrack.date, locale);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    seek(pct * duration);
  };

  return createPortal(
    <div className={styles.mobilePlayer} role="region" aria-label="Audio Player">
      {/* Top Meta Info (Task 11) */}
      <div className={styles.mobilePlayerMeta}>
        <div className={styles.mobilePlayerTextGroup}>
          <h4 className={styles.mobilePlayerTitle}>{currentTrack.title}</h4>
          <p className={styles.mobilePlayerSpeaker}>{currentTrack.speaker}</p>
          <p className={styles.mobilePlayerDateLocation}>
            {formattedDate} - {currentTrack.location}
          </p>
        </div>
        <button
          type="button"
          className={styles.mobilePlayerCloseBtn}
          onClick={closePlayer}
          aria-label="Close player"
        >
          <X size={18} />
        </button>
      </div>

      {/* Scrubber / Progress bar */}
      <div className={styles.mobileProgress} onClick={handleProgressClick}>
        <div className={styles.mobileProgressFill} style={{ width: `${progress}%` }} />
        <div
          className={styles.mobileProgressThumb}
          style={{ left: `clamp(6px, ${progress}%, calc(100% - 6px))` }}
        />
      </div>

      {/* Control buttons */}
      <div className={styles.mobilePlayerControls}>
        <button
          type="button"
          className={styles.playerBtn}
          onClick={(e) => {
            createRipple(e);
            toggleShuffle();
          }}
          style={{
            color: shuffle ? "var(--color-primary)" : undefined,
            position: "relative",
            overflow: "hidden",
          }}
          aria-label="Shuffle"
        >
          <Shuffle size={20} />
        </button>

        <button
          type="button"
          className={styles.playerBtn}
          onClick={(e) => {
            createRipple(e);
            prevTrack();
          }}
          style={{ position: "relative", overflow: "hidden" }}
          aria-label="Previous track"
        >
          <SkipBack size={24} />
        </button>

        <button
          type="button"
          className={styles.mobilePlayerMainBtn}
          onClick={(e) => {
            createRipple(e);
            togglePlay();
          }}
          style={{ position: "relative", overflow: "hidden" }}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause size={24} fill="currentColor" />
          ) : (
            <Play size={24} fill="currentColor" className="ml-0.5" />
          )}
        </button>

        <button
          type="button"
          className={styles.playerBtn}
          onClick={(e) => {
            createRipple(e);
            nextTrack();
          }}
          style={{ position: "relative", overflow: "hidden" }}
          aria-label="Next track"
        >
          <SkipForward size={24} />
        </button>

        <button
          type="button"
          className={styles.playerBtn}
          onClick={(e) => {
            createRipple(e);
            cycleRepeat();
          }}
          style={{
            color: repeatMode !== "off" ? "var(--color-primary)" : undefined,
            position: "relative",
            overflow: "hidden",
          }}
          aria-label="Repeat mode"
        >
          {repeatMode === "one" ? <Repeat1 size={20} /> : <Repeat size={20} />}
        </button>
      </div>
    </div>,
    document.body,
  );
}
