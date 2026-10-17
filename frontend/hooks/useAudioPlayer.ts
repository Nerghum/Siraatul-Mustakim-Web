"use client";

import { useEffect } from "react";
import { useAudioPlayerContext } from "@/components/providers/audio-player-provider";
import type { Bayan } from "@/data/mockRecentBayans";

export function useAudioPlayer(bayans?: Bayan[]) {
  const context = useAudioPlayerContext();

  // If a list is provided and playlist is empty or different, optionally sync it
  useEffect(() => {
    if (bayans && bayans.length > 0 && !context.hasSelected) {
      context.setPlaylist(bayans);
    }
  }, [bayans, context]);

  return context;
}
