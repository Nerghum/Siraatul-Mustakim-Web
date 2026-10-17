"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import styles from "@/styles/recent-bayan.module.css";

type WaveformProps = {
  audioUrl: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onSeek: (timeSec: number) => void;
  onReady?: (durationSec: number) => void;
  onFinish?: () => void;
  trackId: string;
  height?: number;
};

// Deterministic pseudo-random height array for fallback skeleton (seeded by trackId string)
function generateDeterministicHeights(seedStr: string, count: number = 48): number[] {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }

  const heights: number[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.sin(hash + i * 1.5) * 10000;
    const norm = x - Math.floor(x);
    heights.push(Math.floor(20 + norm * 70)); // 20% to 90%
  }
  return heights;
}

const Waveform: React.FC<WaveformProps> = ({
  audioUrl,
  isPlaying,
  currentTime,
  duration,
  onSeek,
  onReady,
  onFinish,
  trackId,
  height = 56,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  const fallbackHeights = useMemo(() => {
    return generateDeterministicHeights(trackId, 50);
  }, [trackId]);

  useEffect(() => {
    if (!containerRef.current) return;

    setIsLoaded(false);
    setHasError(false);

    let ws: WaveSurfer | null = null;

    try {
      ws = WaveSurfer.create({
        container: containerRef.current,
        waveColor: "#111111",
        progressColor: "#008e48",
        cursorWidth: 0,
        barWidth: 2,
        barGap: 2,
        barRadius: 2,
        height: height,
        normalize: true,
        interact: true,
        url: audioUrl,
      });

      wavesurferRef.current = ws;

      ws.on("ready", () => {
        setIsLoaded(true);
        const dur = ws?.getDuration() || duration;
        if (onReady) onReady(dur);
      });

      ws.on("interaction", (newTimeRatio) => {
        const dur = ws?.getDuration() || duration;
        onSeek(newTimeRatio * dur);
      });

      ws.on("finish", () => {
        if (onFinish) onFinish();
      });

      ws.on("error", () => {
        setHasError(true);
        setIsLoaded(false);
      });
    } catch {
      setHasError(true);
      setIsLoaded(false);
    }

    return () => {
      if (ws) {
        try {
          ws.destroy();
        } catch {
          // Ignore unmount destroy errors
        }
      }
      wavesurferRef.current = null;
    };
  }, [audioUrl, trackId]);

  // Sync play / pause state
  useEffect(() => {
    const ws = wavesurferRef.current;
    if (!ws || !isLoaded) return;

    if (isPlaying && !ws.isPlaying()) {
      ws.play().catch(() => {
        // Safe catch for autoplay restrictions
      });
    } else if (!isPlaying && ws.isPlaying()) {
      ws.pause();
    }
  }, [isPlaying, isLoaded]);

  // Sync current time seek
  useEffect(() => {
    const ws = wavesurferRef.current;
    if (!ws || !isLoaded || !duration) return;

    const wsTime = ws.getCurrentTime();
    if (Math.abs(wsTime - currentTime) > 0.5) {
      ws.setTime(currentTime);
    }
  }, [currentTime, duration, isLoaded]);

  return (
    <div className={styles.waveformContainer} style={{ height: height }}>
      {/* Real WaveSurfer element */}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          display: isLoaded && !hasError ? "block" : "none",
        }}
      />

      {/* Fallback skeleton bars while loading or if error */}
      {(!isLoaded || hasError) && (
        <div className={styles.waveformSkeleton} aria-hidden="true">
          {fallbackHeights.map((h, i) => {
            const isPlayed = duration > 0 && i / fallbackHeights.length <= currentTime / duration;
            return (
              <div
                key={i}
                className={styles.skeletonBar}
                style={{
                  height: `${h}%`,
                  backgroundColor: isPlayed ? "#008e48" : "#e5e7eb",
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Waveform;
