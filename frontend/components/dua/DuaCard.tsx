"use client";

import { Bookmark, Pause, Play, Share2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import type { Bayan } from "@/data/mockRecentBayans";
import { useRipple } from "@/hooks/use-ripple";
import { useTranslations } from "@/hooks/use-translations";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { cn } from "@/lib/utils";
import styles from "./dua-detail.module.css";

export type DuaItemProps = {
  id?: string;
  duaId?: string;
  title: string;
  arabicText?: string;
  arabic?: string;
  pronunciation?: string;
  meaning?: string;
  translation?: string;
  tafsir?: string;
  sourceLabel?: string;
  sourceLabelBangla?: string;
  sourceLabelArabic?: string;
  ayahLabel?: string;
  audioUrl?: string;
};

function renderFormattedText(text?: string) {
  if (!text) return null;
  if (/<[a-z][\s\S]*>/i.test(text)) {
    return <div dangerouslySetInnerHTML={{ __html: text }} />;
  }
  return text;
}

function stripHtmlTags(text?: string): string {
  if (!text) return "";
  return text.replace(/<[^>]*>/g, "").trim();
}

const DuaCard: React.FC<{ item: DuaItemProps }> = ({ item }) => {
  const t = useTranslations();
  const createRipple = useRipple();
  const player = useAudioPlayer();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const rawArabic = item.arabicText || item.arabic || "";
  const rawMeaning = item.meaning || item.translation || "";
  const rawPronunciation = item.pronunciation || "";
  const sourceText = [item.sourceLabelBangla || item.sourceLabel, item.ayahLabel]
    .filter(Boolean)
    .join(", ");

  const trackId = item.id || item.duaId || item.title;
  const isCurrentActive = player.currentTrackId === trackId;
  const isPlaying = isCurrentActive && player.isPlaying;

  const handlePlayToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    createRipple(e);
    if (!item.audioUrl) {
      toast.info("এই দুআর অডিও এখনও যুক্ত করা হয়নি");
      return;
    }
    const trackItem: Bayan = {
      id: trackId,
      title: item.title,
      speaker: "সিরাতুল মুস্তাকিম",
      date: new Date().toISOString(),
      location: "দুআ ও দরুদ",
      audioUrl: item.audioUrl,
      durationSec: 180,
    };

    if (isCurrentActive) {
      player.togglePlay();
    } else {
      player.selectTrack(trackItem, true);
    }
  };

  const handleShare = async (e: React.MouseEvent<HTMLButtonElement>) => {
    createRipple(e);
    if (typeof window !== "undefined" && navigator.clipboard) {
      try {
        const parts = [
          item.title,
          "",
          stripHtmlTags(rawArabic),
          rawPronunciation ? `উচ্চারণঃ ${stripHtmlTags(rawPronunciation)}` : "",
          rawMeaning ? `অর্থঃ ${stripHtmlTags(rawMeaning)}` : "",
          sourceText ? `সূত্রঃ ${sourceText}` : "",
          item.tafsir ? `ব্যাখ্যাঃ ${stripHtmlTags(item.tafsir)}` : "",
        ].filter(Boolean);

        await navigator.clipboard.writeText(parts.join("\n\n"));
        toast.success(t("detail.shareSuccess") || "কপি করা হয়েছে");
      } catch {
        toast.error("কপি করা যায়নি");
      }
    }
  };

  const handleBookmark = (e: React.MouseEvent<HTMLButtonElement>) => {
    createRipple(e);
    setIsBookmarked((prev) => {
      const next = !prev;
      toast.success(next ? t("detail.bookmarkAdd") || "বুকমার্কে যুক্ত করা হয়েছে" : t("detail.bookmarkRemove") || "বুকমার্ক থেকে সরানো হয়েছে");
      return next;
    });
  };

  return (
    <div className={styles.card} id={item.id || item.duaId}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{item.title}</h3>
        <div className={styles.cardActions}>
          <button
            type="button"
            className={cn(
              styles.actionBtn,
              isPlaying && styles.actionBtnActive,
              !item.audioUrl && "opacity-50"
            )}
            aria-label={isPlaying ? "Pause Audio" : "Play Audio"}
            title={item.audioUrl ? "অডিও শুনুন" : "অডিও নেই"}
            onClick={handlePlayToggle}
          >
            {isPlaying ? (
              <Pause className={styles.actionIcon} />
            ) : (
              <Play className={styles.actionIcon} />
            )}
          </button>
          <button
            type="button"
            className={styles.actionBtn}
            aria-label="Share Dua"
            title="কপি করুন"
            onClick={handleShare}
          >
            <Share2 className={styles.actionIcon} />
          </button>
          <button
            type="button"
            className={cn(styles.actionBtn, isBookmarked && styles.actionBtnActive)}
            aria-label="Bookmark Dua"
            title="বুকমার্ক"
            onClick={handleBookmark}
          >
            <Bookmark className={styles.actionIcon} fill={isBookmarked ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {rawArabic && (
        <div className={styles.arabicText}>
          {renderFormattedText(rawArabic)}
        </div>
      )}

      {rawPronunciation && (
        <div className={styles.meaningSection}>
          <span className={styles.meaningLabel}>উচ্চারণঃ</span>
          <div className={styles.meaningText}>
            {renderFormattedText(rawPronunciation)}
          </div>
        </div>
      )}

      {rawMeaning && (
        <div className={styles.meaningSection}>
          <span className={styles.meaningLabel}>অর্থঃ</span>
          <div className={styles.meaningText}>
            {renderFormattedText(rawMeaning)}
          </div>
        </div>
      )}

      {sourceText && (
        <div className={styles.meaningSection}>
          <span className={styles.meaningLabel}>সূত্রঃ</span>
          <span className={styles.meaningText}>{sourceText}</span>
        </div>
      )}

      {item.tafsir && (
        <div className={styles.meaningSection}>
          <span className={styles.meaningLabel}>ফযিলত / ব্যাখ্যাঃ</span>
          <div className={styles.meaningText}>
            {renderFormattedText(item.tafsir)}
          </div>
        </div>
      )}
    </div>
  );
};

export default DuaCard;
