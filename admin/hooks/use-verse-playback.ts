"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { QuranVerse } from "@/types/quran";
import { findCurrentVerse, getVerseEndTime, sortVersesByTimestamp } from "@/lib/utils";

interface UseVersePlaybackOptions {
  audioSrc: string | null;
  verses: QuranVerse[];
  surahDuration?: number | null;
}

interface UseVersePlaybackReturn {
  /** Call with the HTMLAudioElement from react-h5-audio-player */
  registerAudio: (el: HTMLAudioElement | null) => void;
  /** Whether audio is currently playing */
  isPlaying: boolean;
  /** Current playback time in seconds */
  currentTime: number;
  /** Total duration in seconds */
  duration: number;
  /** ID of the verse currently playing (null if none) */
  activeVerseId: number | null;
  /** Play the entire surah from start */
  playAll: () => void;
  /** Play a specific verse */
  playVerse: (verseId: number) => void;
  /** Pause playback */
  pause: () => void;
  /** Stop and reset to beginning */
  stop: () => void;
  /** Seek to a specific time */
  seekTo: (time: number) => void;
  /** Whether audio source is available */
  hasAudio: boolean;
}

export function useVersePlayback({
  audioSrc,
  verses,
  surahDuration,
}: UseVersePlaybackOptions): UseVersePlaybackReturn {
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeVerseId, setActiveVerseId] = useState<number | null>(null);
  const rafRef = useRef<number>(0);
  const stopTimeRef = useRef<number | null>(null);
  const listenersAttachedRef = useRef(false);

  const versesWithAudioStart = verses.map((v) => ({ ...v, audioStart: v.audioStart ?? 0 }));
  const sortedVerses = sortVersesByTimestamp(versesWithAudioStart);

  /** Call this from the component with the HTMLAudioElement */
  const registerAudio = useCallback((el: HTMLAudioElement | null) => {
    const prev = audioElRef.current;
    if (prev === el) return;

    // Clean up old listeners
    if (prev && listenersAttachedRef.current) {
      prev.removeEventListener("play", onPlayRef.current);
      prev.removeEventListener("pause", onPauseRef.current);
      prev.removeEventListener("loadedmetadata", onLoadedMetadataRef.current);
      prev.removeEventListener("ended", onEndedRef.current);
      prev.removeEventListener("error", onErrorRef.current);
      listenersAttachedRef.current = false;
    }

    audioElRef.current = el;

    // Attach new listeners
    if (el) {
      el.addEventListener("play", onPlayRef.current);
      el.addEventListener("pause", onPauseRef.current);
      el.addEventListener("loadedmetadata", onLoadedMetadataRef.current);
      el.addEventListener("ended", onEndedRef.current);
      el.addEventListener("error", onErrorRef.current);
      listenersAttachedRef.current = true;

      // Sync duration if metadata already loaded
      if (el.duration && !Number.isNaN(el.duration)) {
        setDuration(el.duration);
      }
    }
  }, []);

  // RAF-based time tracking for accurate verse boundary detection
  const trackTime = useCallback(() => {
    const audio = audioElRef.current;
    if (!audio || audio.paused) return;

    const time = audio.currentTime;
    setCurrentTime(time);

    // Check if we've passed the stop time
    if (stopTimeRef.current !== null && time >= stopTimeRef.current) {
      audio.pause();
      setIsPlaying(false);
      stopTimeRef.current = null;
      return;
    }

    // Update active verse
    const verseId = findCurrentVerse(time, sortedVerses);
    setActiveVerseId(verseId);

    rafRef.current = requestAnimationFrame(trackTime);
  }, [sortedVerses]);

  // Stable callback refs so listeners don't need re-attachment
  const onPlayRef = useRef(() => {
    setIsPlaying(true);
    rafRef.current = requestAnimationFrame(trackTime);
  });
  const onPauseRef = useRef(() => {
    setIsPlaying(false);
    cancelAnimationFrame(rafRef.current);
  });
  const onLoadedMetadataRef = useRef(() => {
    const audio = audioElRef.current;
    if (audio?.duration) setDuration(audio.duration);
  });
  const onEndedRef = useRef(() => {
    setIsPlaying(false);
    setActiveVerseId(null);
    stopTimeRef.current = null;
    cancelAnimationFrame(rafRef.current);
  });
  const onErrorRef = useRef(() => {
    setIsPlaying(false);
    setActiveVerseId(null);
    stopTimeRef.current = null;
  });

  // Keep trackTime callback fresh
  useEffect(() => {
    onPlayRef.current = () => {
      setIsPlaying(true);
      rafRef.current = requestAnimationFrame(trackTime);
    };
  }, [trackTime]);

  const playAll = useCallback(() => {
    const audio = audioElRef.current;
    if (!audio) return;

    stopTimeRef.current = null;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, []);

  const playVerse = useCallback(
    (verseId: number) => {
      const audio = audioElRef.current;
      if (!audio) return;

      const verseIndex = sortedVerses.findIndex((v) => v.id === verseId);
      if (verseIndex === -1) return;

      const verse = sortedVerses[verseIndex];
      const endTime = getVerseEndTime(verseIndex, sortedVerses, surahDuration);

      stopTimeRef.current = endTime;
      audio.currentTime = verse.audioStart;
      audio.play().catch(() => {});
    },
    [sortedVerses, surahDuration],
  );

  const pause = useCallback(() => {
    audioElRef.current?.pause();
  }, []);

  const stop = useCallback(() => {
    const audio = audioElRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setActiveVerseId(null);
    setCurrentTime(0);
    stopTimeRef.current = null;
    cancelAnimationFrame(rafRef.current);
  }, []);

  const seekTo = useCallback((time: number) => {
    const audio = audioElRef.current;
    if (!audio) return;

    audio.currentTime = time;
    setCurrentTime(time);

    const versesWithAudioStart = verses.map((v) => ({ ...v, audioStart: v.audioStart ?? 0 }));
    const verseId = findCurrentVerse(time, sortVersesByTimestamp(versesWithAudioStart));
    setActiveVerseId(verseId);
  }, [verses]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return {
    registerAudio,
    isPlaying,
    currentTime,
    duration,
    activeVerseId,
    playAll,
    playVerse,
    pause,
    stop,
    seekTo,
    hasAudio: !!audioSrc,
  };
}
