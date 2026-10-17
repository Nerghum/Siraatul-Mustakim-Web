"use client";

import { ChevronDown, ChevronLeft, MapPin, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import LocationPickerSheet from "@/components/BayanSchedule/LocationPickerSheet";
import BooksCategorySheet from "@/components/books/BooksCategorySheet";
import CategorySidebar from "@/components/shared/CategorySidebar";
import Pagination from "@/components/shared/Pagination";
import { FolderOpen } from "@/components/ui/folder-open";
import Wrapper from "@/components/wrapper";
import { BD_DISTRICTS } from "@/data/bdDistricts";
import { getListing } from "@/data/listing";
import { MOCK_BAYAN_CATEGORIES } from "@/data/mockCategories";
import { fetchBoyanCategories } from "@/lib/api/boyan";
import type { Bayan } from "@/data/mockRecentBayans";
import { useAsyncData } from "@/hooks/use-async-data";
import { useLocale } from "@/hooks/use-locale";
import { useRipple } from "@/hooks/use-ripple";
import { useTranslations } from "@/hooks/use-translations";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import styles from "@/styles/bayan-listing.module.css";
import listing from "@/styles/listing.module.css";
import type { MalfujatAudioItem } from "@/types/listing";
import BayanAudioCard from "./BayanAudioCard";
import BayanAudioSkeleton from "./BayanAudioSkeleton";
import PlayerPanel from "@/components/RecentBayan/PlayerPanel";
import { AnimatePresence, motion } from "framer-motion";

const ALL_LOCATIONS = "__ALL__";

export default function BayanListing() {
  const t = useTranslations();
  const { locale } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const createRipple = useRipple();

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [locationPickerOpen, setLocationPickerOpen] = React.useState(false);

  const category = searchParams.get("category");
  const location = searchParams.get("location");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const districtLocations = React.useMemo(() => {
    return BD_DISTRICTS.map((d) => d.name[locale]);
  }, [locale]);

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
      getListing("bayan", {
        category,
        location,
        page,
      }),
    [category, location, page],
  );

  const { data: categoriesData } = useAsyncData(
    () => fetchBoyanCategories(),
    [],
  );

  const dynamicCategories = React.useMemo(() => {
    if (!categoriesData || categoriesData.length === 0) return MOCK_BAYAN_CATEGORIES;
    return categoriesData.map((c) => {
      const name = typeof c === "string" ? c : c.name;
      const slug = typeof c === "string" ? c : c.slug;
      const count = typeof c === "string" ? 0 : c.count || 0;
      return {
        id: slug || name,
        slug: slug || name,
        name,
        translationKey: name,
        count,
      };
    });
  }, [categoriesData]);

  const items = React.useMemo(() => data?.items ?? [], [data?.items]);
  const totalPages = data?.totalPages ?? 1;

  const audioItems = React.useMemo(() => {
    return items.map((item) => ({
      id: item.id,
      title: item.title,
      speaker: (item as MalfujatAudioItem).author || "",
      date: item.date,
      location: (item as MalfujatAudioItem).location || "",
      audioUrl: (item as MalfujatAudioItem).audioUrl || "",
      durationSec: (item as MalfujatAudioItem & { durationSec?: number }).durationSec || 1800,
    })) as Bayan[];
  }, [items]);

  const player = useAudioPlayer(audioItems.length > 0 ? audioItems : undefined);

  const handlePageChange = (nextPage: number) => {
    setParams({ page: nextPage === 1 ? null : String(nextPage) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectCategory = (slug: string | null) => setParams({ category: slug, page: null });
  const selectLocation = (loc: string | null) => setParams({ location: loc, page: null });

  return (
    <section className={`${listing.section} ${styles.bayanSection}`}>
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
          <h1 className={styles.mobileTitle}>{t("bayan.title")}</h1>
        </div>

        <div className={styles.mobileBarRight}>
          <button
            type="button"
            className={styles.categoryBtn}
            onClick={(e) => {
              createRipple(e);
              setSheetOpen(true);
            }}
          >
            <FolderOpen className={styles.categoryBtnIcon} fill="currentColor" />
            <span>{t("bayan.categoryButton")}</span>
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
        {/* Mobile Location Toolbar */}
        <div className={styles.mobileToolbar}>
          <button
            type="button"
            className={styles.locationTrigger}
            onClick={() => setLocationPickerOpen(true)}
          >
            <MapPin size={18} className={styles.locationTriggerIcon} />
            <span className={styles.locationTriggerLabel}>
              {location || t("bayan.locationPlaceholder")}
            </span>
            <ChevronDown size={18} className={styles.locationTriggerChevron} />
          </button>
        </div>

        {/* Desktop Header */}
        <div className={styles.desktopHeader}>
          <div className={styles.headerTextGroup}>
            <h1 className={styles.titleSection}>{t("bayan.title")}</h1>
            <p className={styles.subtitle}>{t("bayan.subtitle")}</p>
          </div>

          <button
            type="button"
            className={styles.locationTrigger}
            onClick={() => setLocationPickerOpen(true)}
          >
            <MapPin size={18} className={styles.locationTriggerIcon} />
            <span className={styles.locationTriggerLabel}>
              {location || t("bayan.locationPlaceholder")}
            </span>
            <ChevronDown size={18} className={styles.locationTriggerChevron} />
          </button>
        </div>

        <div className={listing.contentGrid}>
          <div className={listing.mainColumn}>
            {loading ? (
              <div className={styles.audioList}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <BayanAudioSkeleton key={i} />
                ))}
              </div>
            ) : items.length === 0 ? (
              <p className={listing.emptyState}>{t("bayan.empty")}</p>
            ) : (
              <>
                <div className={styles.audioList} role="list">
                  {audioItems.map((item) => (
                    <BayanAudioCard
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

                <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
              </>
            )}
          </div>

          <CategorySidebar
            activeSlug={category}
            onSelect={selectCategory}
            title={t("bayan.categoriesTitle")}
            categories={dynamicCategories}
            translationNamespace="listing.bayanCategories."
            placement="bayan"
          />
        </div>
      </Wrapper>

      <BooksCategorySheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        activeSlug={category}
        onSelect={selectCategory}
        title={t("bayan.categoriesTitle")}
        categories={dynamicCategories}
        translationNamespace="listing.bayanCategories."
      />

      <LocationPickerSheet
        open={locationPickerOpen}
        onClose={() => setLocationPickerOpen(false)}
        allValue={ALL_LOCATIONS}
        locations={districtLocations}
        value={location ?? ALL_LOCATIONS}
        onSelect={(val) => selectLocation(val === ALL_LOCATIONS ? null : val)}
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
