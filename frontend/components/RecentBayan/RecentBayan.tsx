"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollRevealItem, ScrollRevealWrapper } from "@/components/shared/ScrollReveal";
import Wrapper from "@/components/wrapper";
import { getRecentBayans, MOCK_RECENT_BAYANS } from "@/data/mockRecentBayans";
import { fetchBoyanList, boyanAudioUrl } from "@/lib/api/boyan";
import { useAsyncData } from "@/hooks/use-async-data";
import { useTranslations } from "@/hooks/use-translations";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import styles from "@/styles/recent-bayan.module.css";
import BayanList from "./BayanList";
import PlayerPanel from "./PlayerPanel";
import RecentBayanCardsSkeleton from "./RecentBayanCardsSkeleton";

type RecentBayanProps = {
  seeMoreHref?: string;
  seeMore?: boolean;
};

const RecentBayan: React.FC<RecentBayanProps> = ({ seeMoreHref = "/bayan", seeMore = true }) => {
  const t = useTranslations();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isSectionVisible, setIsSectionVisible] = useState(true);

  // Fetch the bayans from the real API; drives the card grid's skeleton.
  const { data: apiData, loading } = useAsyncData(() => fetchBoyanList({ limit: 12 }), []);

  const data = useMemo(() => {
    if (!apiData) return null;
    return apiData.items.map(b => ({
      id: b._id,
      title: b.title,
      speaker: b.author || "",
      location: "", // No location on Boyan model
      date: b.createdAt,
      durationSec: b.audioDuration || 1800,
      audioUrl: boyanAudioUrl(b.audioUrl)
    }));
  }, [apiData]);

  // On the homepage (seeMore = true), display only 5 items in the list preview.
  const displayedBayans = useMemo(() => {
    if (!data) return [];
    return seeMore ? data.slice(0, 5) : data;
  }, [data, seeMore]);

  // Seed the player with the fetched list (falling back to the mock while it
  // loads, so the player state always has a current track under the skeleton).
  const player = useAudioPlayer(data ?? MOCK_RECENT_BAYANS);

  // Observe section visibility in viewport
  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSectionVisible(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Keyboard shortcut: Space key toggles play/pause when focus is within section
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === "Space" &&
        sectionRef.current &&
        sectionRef.current.contains(document.activeElement)
      ) {
        // Prevent default space scroll if not focused inside input/textarea
        const tag = document.activeElement?.tagName.toLowerCase();
        if (tag !== "input" && tag !== "textarea") {
          e.preventDefault();
          player.togglePlay();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [player]);

  return (
    <section id="recent-bayan" className={styles.section} ref={sectionRef}>
      <Wrapper>
        <ScrollRevealWrapper className={styles.container}>
          {/* Accessibility announcement for screen readers */}
          <div className="sr-only" aria-live="polite">
            {player.isPlaying
              ? `এখন বাজছে: ${player.currentTrack.title}`
              : `প্লেয়ার থামানো আছে: ${player.currentTrack.title}`}
          </div>

          {/* 1. Header matching MMBC structure */}
          <ScrollRevealItem className={styles.header}>
            <div className={styles.headerTextGroup}>
              <h2 className={styles.titleSection}>
                {t("home.recentBayan.title") || "সাম্প্রতিক বয়ান"}
              </h2>
              <p className={styles.subtitle}>
                {t("home.recentBayan.subtitle") || "হযরতওয়ালা মুফতি জাফর আহমাদ সাহেবের বয়ানসমূহ"}
              </p>
            </div>
            {seeMore && (
              <Link href={seeMoreHref} className={styles.seeMoreBtn}>
                {t("home.recentBayan.seeMore") || "সব বয়ান শুনুন"}
                <ChevronRight size={18} />
              </Link>
            )}
          </ScrollRevealItem>

          {/* 2. Main Card with 2 Columns */}
          <ScrollRevealItem className={styles.cardGrid}>
            {loading || !data ? (
              <RecentBayanCardsSkeleton count={seeMore ? 5 : 8} />
            ) : (
              <>
                {/* Left Column: Bayan List */}
                <div className={styles.listColumn}>
                  <BayanList
                    bayans={displayedBayans}
                    currentTrackId={player.currentTrackId}
                    isPlaying={player.isPlaying}
                    onSelectTrack={(bayan) => {
                      if (player.currentTrackId === bayan.id) {
                        player.togglePlay();
                      } else {
                        player.selectTrack(bayan, true, displayedBayans);
                      }
                    }}
                  />
                </div>

                {/* Right Column: Player Panel */}
                <div className={styles.playerColumn}>
                  <PlayerPanel
                    currentTrack={player.currentTrack}
                    isPlaying={player.isPlaying}
                    currentTime={player.currentTime}
                    duration={player.duration}
                    onTogglePlay={player.togglePlay}
                    onSeek={player.seek}
                    onPrevTrack={player.prevTrack}
                    onNextTrack={player.nextTrack}
                    shuffle={player.shuffle}
                    onToggleShuffle={player.toggleShuffle}
                    repeatMode={player.repeatMode}
                    onCycleRepeat={player.cycleRepeat}
                    hasPrev={player.hasPrev}
                    hasNext={player.hasNext}
                    onReadyDuration={(dur) => player.setDuration(dur)}
                    onFinishTrack={player.handleTrackFinish}
                  />
                </div>
              </>
            )}
          </ScrollRevealItem>
        </ScrollRevealWrapper>

        {seeMore && (
          <Link href={seeMoreHref} className={styles.seeMoreBtnMobile}>
            {t("home.recentBayan.seeMore") || "সব বয়ান শুনুন"}
            <ChevronRight size={18} />
          </Link>
        )}
      </Wrapper>
    </section>
  );
};

export default RecentBayan;
