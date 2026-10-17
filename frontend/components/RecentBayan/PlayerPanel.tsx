"use client";

import { AnimatePresence, motion } from "framer-motion";
import type React from "react";
import type { Bayan } from "@/data/mockRecentBayans";
import { useLocale } from "@/hooks/use-locale";
import { formatLocalizedShortDate } from "@/lib/banglaFormat";
import styles from "@/styles/recent-bayan.module.css";
import SeekBar from "./SeekBar";
import TransportControls, { type RepeatMode } from "./TransportControls";
import Waveform from "./Waveform";

type PlayerPanelProps = {
  currentTrack: Bayan;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onSeek: (timeSec: number) => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
  shuffle: boolean;
  onToggleShuffle: () => void;
  repeatMode: RepeatMode;
  onCycleRepeat: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  onReadyDuration?: (dur: number) => void;
  onFinishTrack?: () => void;
};

const PlayerPanel: React.FC<PlayerPanelProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onSeek,
  onPrevTrack,
  onNextTrack,
  shuffle,
  onToggleShuffle,
  repeatMode,
  onCycleRepeat,
  hasPrev,
  hasNext,
  onReadyDuration,
  onFinishTrack,
}) => {
  const { locale } = useLocale();
  const formattedDate = formatLocalizedShortDate(currentTrack.date, locale);

  return (
    <div className={styles.playerCard}>
      {/* 1. Now Playing Title & Subtitle */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTrack.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className={styles.nowPlayingMeta}
        >
          <h3 className={styles.nowPlayingTitle}>{currentTrack.title}</h3>
          <p className={styles.nowPlayingSubtitle}>
            {currentTrack.speaker} · {currentTrack.location} · {formattedDate}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* 2. Waveform */}
      <Waveform
        trackId={currentTrack.id}
        audioUrl={currentTrack.audioUrl}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration || currentTrack.durationSec}
        onSeek={onSeek}
        onReady={onReadyDuration}
        onFinish={onFinishTrack}
      />

      {/* 3. Seek Bar */}
      <SeekBar
        currentTime={currentTime}
        duration={duration || currentTrack.durationSec}
        onSeek={onSeek}
      />

      {/* 4. Transport Controls */}
      <TransportControls
        isPlaying={isPlaying}
        onTogglePlay={onTogglePlay}
        onPrevTrack={onPrevTrack}
        onNextTrack={onNextTrack}
        shuffle={shuffle}
        onToggleShuffle={onToggleShuffle}
        repeatMode={repeatMode}
        onCycleRepeat={onCycleRepeat}
        hasPrev={hasPrev}
        hasNext={hasNext}
      />
    </div>
  );
};

export default PlayerPanel;
