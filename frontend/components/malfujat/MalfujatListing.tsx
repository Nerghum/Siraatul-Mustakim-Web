"use client";

import { ChevronLeft, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import BooksCategorySheet from "@/components/books/BooksCategorySheet";
import CategorySidebar from "@/components/shared/CategorySidebar";
import Pagination from "@/components/shared/Pagination";
import { FolderOpen } from "@/components/ui/folder-open";
import Wrapper from "@/components/wrapper";
import { getListing } from "@/data/listing";
import { MOCK_MALFUJAT_CATEGORIES } from "@/data/mockCategories";
import type { Bayan } from "@/data/mockRecentBayans";
import { useAsyncData } from "@/hooks/use-async-data";
import { useRipple } from "@/hooks/use-ripple";
import { useTranslations } from "@/hooks/use-translations";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import listing from "@/styles/listing.module.css";
import styles from "@/styles/malfujat.module.css";
import type { ListingItem, MalfujatAudioItem } from "@/types/listing";
import MalfujatAudioCard from "./MalfujatAudioCard";
import MalfujatAudioSkeleton from "./MalfujatAudioSkeleton";
import MalfujatTextCard from "./MalfujatTextCard";
import MalfujatTextSkeleton from "./MalfujatTextSkeleton";
import PlayerPanel from "@/components/RecentBayan/PlayerPanel";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  query?: string;
  category?: string;
  page: number;
  tab: string;
};

export default function MalfujatListing({ query = "", category, page, tab }: Props) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const createRipple = useRipple();

  const [sheetOpen, setSheetOpen] = React.useState(false);

  const setParams = React.useCallback(
    (next: Record<string, string | null>, options?: { replace?: boolean }) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(next).forEach(([key, value]) => {
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      });
      const queryString = params.toString();
      const target = queryString ? `${pathname}?${queryString}` : pathname;
      if (options?.replace) {
        router.replace(target, { scroll: false });
      } else {
        router.push(target, { scroll: false });
      }
    },
    [pathname, router, searchParams],
  );

  const { data, loading } = useAsyncData(
    () =>
      getListing(tab === "audio" ? "malfujat-audio" : "malfujat-text", {
        query,
        category,
        page,
      }),
    [query, category, page, tab],
  );
  const items = React.useMemo(() => data?.items ?? [], [data?.items]);
  const totalPages = data?.totalPages ?? 1;

  const audioItems = React.useMemo(() => {
    if (tab !== "audio") return [];
    return items.map((item) => ({
      id: item.id,
      title: item.title,
      speaker: (item as MalfujatAudioItem).author || "",
      date: item.date,
      location: (item as MalfujatAudioItem).location || "Unknown",
      audioUrl: (item as MalfujatAudioItem).audioUrl || "",
      durationSec: (item as MalfujatAudioItem & { durationSec?: number }).durationSec || 1800,
    })) as Bayan[];
  }, [items, tab]);

  const player = useAudioPlayer(audioItems.length > 0 ? audioItems : undefined);

  const handlePageChange = (nextPage: number) => {
    setParams({ page: nextPage === 1 ? null : String(nextPage) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectCategory = (slug: string | null) => setParams({ category: slug, page: null });

  return (
    <section className={`${listing.section} ${styles.malfujatSection}`}>
      {/* Mobile Sticky Bar */}
      <div className={styles.mobileBar}>
        <div className={styles.mobileBarLeft}>
          <button
            type="button"
            className="header-back-btn"
            aria-label={t("sidebar.back") || "Back"}
            onClick={(e) => {
              createRipple(e);
              router.back();
            }}
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className={styles.mobileTitle}>{t("malfujat.title")}</h1>
        </div>
        <div className={styles.mobileBarRight}>
          <button
            type="button"
            className={styles.mobileCategoryBtn}
            onClick={(e) => {
              createRipple(e);
              setSheetOpen(true);
            }}
          >
            <FolderOpen size={18} fill="currentColor" />
            <span>{t("books.categoryButton")}</span>
          </button>
          <button
            type="button"
            className="header-menu-btn"
            onClick={(e) => {
              createRipple(e);
              window.dispatchEvent(new Event("open-sidebar"));
            }}
            aria-label={t("header.menu") || "Menu"}
          >
            <span className="header-ripple-container"></span>
            <svg
              className="header-menu-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
            >
              <path
                d="M3 12H21M3 6H21M3 18H21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
            <span className="header-ripple-overlay"></span>
          </button>
        </div>
      </div>

      <Wrapper>
        {/* Desktop Mobile Tab & Header */}
        <div className={`${listing.pageHeader} ${styles.controlsHeader}`}>
          <div className={`${listing.headerTextGroup} hide-on-mobile`}>
            <h1 className={listing.title}>{t("malfujat.title")}</h1>
            <p className={listing.subtitle}>{t("malfujat.subtitle")}</p>
          </div>

          <div className={styles.tabsContainer}>
            <button
              className={`${styles.tabBtn} ${tab === "text" ? styles.tabActive : ""}`}
              onClick={() => setParams({ tab: "text", page: null })}
            >
              {t("malfujat.tabText")}
            </button>
            <button
              className={`${styles.tabBtn} ${tab === "audio" ? styles.tabActive : ""}`}
              onClick={() => setParams({ tab: "audio", page: null })}
            >
              {t("malfujat.tabAudio")}
            </button>
          </div>
        </div>

        <div className={listing.contentGrid}>
          <div className={listing.mainColumn}>
            <div>
              {loading ? (
                tab === "audio" ? (
                  <div className="flex flex-col gap-[1rem]" role="list">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <MalfujatAudioSkeleton key={i} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-[1rem]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <MalfujatTextSkeleton key={i} />
                    ))}
                  </div>
                )
              ) : items.length === 0 ? (
                <p className={listing.emptyState}>{t("malfujat.empty")}</p>
              ) : (
                <>
                  {tab === "audio" ? (
                    <div className="flex flex-col gap-[1rem]" role="list">
                      {audioItems.map((item) => (
                        <MalfujatAudioCard
                          key={item.id}
                          item={item}
                          isActive={player.currentTrackId === item.id}
                          isPlaying={player.currentTrackId === item.id && player.isPlaying}
                          onTogglePlay={() => {
                            if (player.currentTrackId === item.id) {
                              player.togglePlay();
                            } else {
                              player.selectTrack(item, true, audioItems);
                            }
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-[1rem]">
                      {items.map((item) => (
                        <MalfujatTextCard key={item.id} item={item as ListingItem} />
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: "2rem" }}>
                    <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Reusing shared CategorySidebar */}
          <CategorySidebar
            activeSlug={category ?? null}
            onSelect={selectCategory}
            categories={MOCK_MALFUJAT_CATEGORIES}
            translationNamespace="listing.malfujatCategories."
            title={t("malfujat.categoriesTitle")}
            placement="malfujat"
          />
        </div>
      </Wrapper>

      {/* Reusing mobile category drawer from books for now since it works */}
      <BooksCategorySheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        activeSlug={category ?? null}
        onSelect={selectCategory}
        title={t("malfujat.categoriesTitle")}
        categories={MOCK_MALFUJAT_CATEGORIES}
        translationNamespace="listing.malfujatCategories."
      />

      <AnimatePresence>
        {player.currentTrack && player.isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className={styles.playerPopup}
          >
            <button 
              onClick={player.closePlayer} 
              className={styles.closePlayerBtn}
              aria-label="Close player"
            >
              <X size={20} />
            </button>
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
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
