import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function formatDateTime(date: string) {
  return new Date(date).toLocaleString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
export function stripHtml(html?: string | null): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim()
}

export function extractYoutubeId(url?: string | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : "";
}

// ============= Audio Timestamp Utilities =============

/**
 * Convert seconds to MM:SS.mmm format
 * @example secondsToTimestamp(125.456) => "02:05.456"
 */
export function secondsToTimestamp(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "00:00.000";

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = seconds.toFixed(3).padStart(6, "0");

  return `${mm}:${ss}`;
}

/**
 * Convert MM:SS.mmm or MM:SS format to seconds
 * @example timestampToSeconds("02:05.456") => 125.456
 */
export function timestampToSeconds(timestamp: string): number {
  const match = timestamp.match(/^(\d+):(\d+(?:\.\d+)?)$/);
  if (!match) return NaN;

  const minutes = parseInt(match[1], 10);
  const seconds = parseFloat(match[2]);

  if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return NaN;

  return minutes * 60 + seconds;
}

/**
 * Get the end time of a verse (start of next verse, or surah duration for last verse)
 */
export function getVerseEndTime(
  currentVerseIndex: number,
  sortedVerses: Array<{ audioStart: number }>,
  surahDuration: number | null | undefined,
): number {
  const nextVerse = sortedVerses[currentVerseIndex + 1];
  if (nextVerse) return nextVerse.audioStart;
  return surahDuration ?? 0;
}

/**
 * Find which verse is currently playing based on audio time
 */
export function findCurrentVerse(
  currentTime: number,
  sortedVerses: Array<{ id: number; audioStart: number }>,
): number | null {
  if (!sortedVerses.length) return null;

  // Binary search for the verse
  let low = 0;
  let high = sortedVerses.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (sortedVerses[mid].audioStart <= currentTime) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  // low is now the index of the first verse whose start > currentTime
  // So the current verse is at index low - 1
  const verseIndex = low - 1;
  if (verseIndex < 0) return sortedVerses[0]?.id ?? null;

  return sortedVerses[verseIndex]?.id ?? null;
}

/**
 * Sort verses by audioStart timestamp ascending
 */
export function sortVersesByTimestamp<T extends { audioStart: number }>(
  verses: T[],
): T[] {
  return [...verses].sort((a, b) => a.audioStart - b.audioStart);
}
