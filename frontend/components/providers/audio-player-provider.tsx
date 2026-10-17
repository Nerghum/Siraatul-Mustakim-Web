"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { RepeatMode } from "@/components/RecentBayan/TransportControls";
import { type Bayan, MOCK_RECENT_BAYANS } from "@/data/mockRecentBayans";

export type AudioPlayerContextType = {
  currentTrack: Bayan;
  currentTrackId: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  shuffle: boolean;
  repeatMode: RepeatMode;
  hasSelected: boolean;
  isOpen: boolean;
  playlist: Bayan[];
  hasPrev: boolean;
  hasNext: boolean;
  selectTrack: (track: Bayan, autoPlay?: boolean, newPlaylist?: Bayan[]) => void;
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
  seek: (timeSec: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  handleTrackFinish: () => void;
  setDuration: (dur: number) => void;
  closePlayer: () => void;
  setPlaylist: (list: Bayan[]) => void;
};

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [playlist, setPlaylistState] = useState<Bayan[]>(MOCK_RECENT_BAYANS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [hasSelected, setHasSelected] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentTrack = useMemo(() => {
    if (currentTrackIndex >= 0 && currentTrackIndex < playlist.length) {
      return playlist[currentTrackIndex];
    }
    return playlist[0] || MOCK_RECENT_BAYANS[0];
  }, [playlist, currentTrackIndex]);

  // Simulated time ticker for fallback when real audio isn't ticking
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const trackDuration = duration || currentTrack.durationSec || 1800;
          if (prev >= trackDuration) {
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, duration, currentTrack]);

  const selectTrack = useCallback(
    (track: Bayan, autoPlay: boolean = true, newPlaylist?: Bayan[]) => {
      const activeList = newPlaylist && newPlaylist.length > 0 ? newPlaylist : playlist;
      if (newPlaylist && newPlaylist.length > 0) {
        setPlaylistState(newPlaylist);
      }

      let idx = activeList.findIndex((b) => b.id === track.id);
      if (idx === -1) {
        idx = activeList.length;
        setPlaylistState((prev) => [...prev, track]);
      }

      setCurrentTrackIndex(idx);
      setCurrentTime(0);
      setDuration(track.durationSec || 1800);
      setHasSelected(true);
      setIsOpen(true);
      if (autoPlay) {
        setIsPlaying(true);
      }
    },
    [playlist],
  );

  const togglePlay = useCallback(() => {
    setHasSelected(true);
    setIsOpen(true);
    setIsPlaying((prev) => !prev);
  }, []);

  const play = useCallback(() => {
    setHasSelected(true);
    setIsOpen(true);
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const seek = useCallback((timeSec: number) => {
    setCurrentTime(timeSec);
  }, []);

  const nextTrack = useCallback(() => {
    if (shuffle) {
      const randomIndex = Math.floor(Math.random() * playlist.length);
      setCurrentTrackIndex(randomIndex);
    } else {
      setCurrentTrackIndex((prev) => {
        if (prev + 1 < playlist.length) {
          return prev + 1;
        }
        return repeatMode === "all" ? 0 : prev;
      });
    }
    setCurrentTime(0);
  }, [playlist.length, shuffle, repeatMode]);

  const prevTrack = useCallback(() => {
    setCurrentTrackIndex((prev) => {
      if (prev > 0) {
        return prev - 1;
      }
      return repeatMode === "all" ? playlist.length - 1 : 0;
    });
    setCurrentTime(0);
  }, [playlist.length, repeatMode]);

  const toggleShuffle = useCallback(() => {
    setShuffle((prev) => !prev);
  }, []);

  const cycleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === "off") return "all";
      if (prev === "all") return "one";
      return "off";
    });
  }, []);

  const handleTrackFinish = useCallback(() => {
    if (repeatMode === "one") {
      setCurrentTime(0);
      setIsPlaying(true);
    } else if (shuffle) {
      nextTrack();
      setIsPlaying(true);
    } else if (currentTrackIndex + 1 < playlist.length) {
      nextTrack();
      setIsPlaying(true);
    } else if (repeatMode === "all") {
      setCurrentTrackIndex(0);
      setCurrentTime(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [repeatMode, shuffle, currentTrackIndex, playlist.length, nextTrack]);

  const closePlayer = useCallback(() => {
    setIsPlaying(false);
    setIsOpen(false);
  }, []);

  const setPlaylist = useCallback((list: Bayan[]) => {
    setPlaylistState(list);
  }, []);

  const value = useMemo<AudioPlayerContextType>(
    () => ({
      currentTrack,
      currentTrackId:
        hasSelected && currentTrackIndex >= 0 && currentTrackIndex < playlist.length
          ? playlist[currentTrackIndex].id
          : "",
      isPlaying,
      currentTime,
      duration: duration || currentTrack.durationSec || 1800,
      shuffle,
      repeatMode,
      hasSelected,
      isOpen,
      playlist,
      hasPrev: currentTrackIndex > 0 || repeatMode === "all",
      hasNext: currentTrackIndex + 1 < playlist.length || repeatMode === "all" || shuffle,
      selectTrack,
      togglePlay,
      play,
      pause,
      seek,
      nextTrack,
      prevTrack,
      toggleShuffle,
      cycleRepeat,
      handleTrackFinish,
      setDuration,
      closePlayer,
      setPlaylist,
    }),
    [
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      shuffle,
      repeatMode,
      hasSelected,
      isOpen,
      playlist,
      currentTrackIndex,
      selectTrack,
      togglePlay,
      play,
      pause,
      seek,
      nextTrack,
      prevTrack,
      toggleShuffle,
      cycleRepeat,
      handleTrackFinish,
      closePlayer,
      setPlaylist,
    ],
  );

  return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
}

export function useAudioPlayerContext() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudioPlayerContext must be used within an AudioPlayerProvider");
  }
  return context;
}
