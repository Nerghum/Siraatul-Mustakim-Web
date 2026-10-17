"use client";

import React, { useCallback, useMemo } from "react";
import { Play, Pause, Square, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { secondsToTimestamp } from "@/lib/utils";
import type { QuranVerse } from "@/types/quran";

interface SurahAudioPlayerProps {
  audioSrc: string | null;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSeek: (time: number) => void;
  verses?: QuranVerse[];
  activeVerseId?: number | null;
}

export function SurahAudioPlayer({
  audioSrc,
  audioRef,
  isPlaying,
  currentTime,
  duration,
  onPlay,
  onPause,
  onStop,
  onSeek,
}: SurahAudioPlayerProps) {
  const [muted, setMuted] = React.useState(false);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!duration) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = x / rect.width;
      const newTime = percent * duration;
      onSeek(Math.max(0, Math.min(newTime, duration)));
    },
    [duration, onSeek],
  );

  const handleToggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setMuted(audio.muted);
  }, [audioRef]);

  if (!audioSrc) {
    return (
      <div className="rounded-lg border bg-muted/30 p-4 flex items-center gap-3">
        <VolumeX className="size-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          No audio available for this Surah
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3 sticky top-0 z-10 shadow-sm">
      <audio ref={audioRef} src={audioSrc} preload="metadata" />

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            size="icon"
            variant={isPlaying ? "default" : "outline"}
            className="size-9"
            onClick={isPlaying ? onPause : onPlay}
          >
            {isPlaying ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4" />
            )}
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-9"
            onClick={onStop}
          >
            <Square className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-9"
            onClick={handleToggleMute}
          >
            {muted ? (
              <VolumeX className="size-4" />
            ) : (
              <Volume2 className="size-4" />
            )}
          </Button>
        </div>

        <div className="flex-1 space-y-1.5">
          <div
            className="relative h-2 bg-muted rounded-full cursor-pointer group"
            onClick={handleSeek}
          >
            <div
              className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 size-3.5 bg-primary rounded-full border-2 border-background shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${progress}% - 7px)` }}
            />
          </div>
        </div>

        <div className="text-xs text-muted-foreground font-mono whitespace-nowrap tabular-nums">
          {secondsToTimestamp(currentTime)} / {secondsToTimestamp(duration)}
        </div>
      </div>
    </div>
  );
}
