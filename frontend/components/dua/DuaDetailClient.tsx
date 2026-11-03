"use client";

import { ChevronLeft, Search, X } from "lucide-react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import CategorySidebar, { CategoryChips } from "@/components/shared/CategorySidebar";
import Wrapper from "@/components/wrapper";
import { fetchDuaChapters, fetchDuaChapterItems, fetchDuaById } from "@/lib/api/dua";
import { useAsyncData } from "@/hooks/use-async-data";
import { useTranslations } from "@/hooks/use-translations";
import detailStyles from "@/styles/detail.module.css";
import listingStyles from "@/styles/listing.module.css";
import DuaCard from "./DuaCard";
import DuaDetailSkeleton from "./DuaDetailSkeleton";
import styles from "./dua-detail.module.css";

export default function DuaDetailClient() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();

  const chapterId = (params?.id as string) || "";
  const initialQuery = searchParams.get("q") ?? "";
  const targetDuaId = searchParams.get("dua");

  const [searchValue, setSearchValue] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  // Sync state if URL search param changes externally
  useEffect(() => {
    const urlQ = searchParams.get("q") ?? "";
    if (urlQ !== debouncedQuery) {
      setSearchValue(urlQ);
      setDebouncedQuery(urlQ);
    }
  }, [searchParams]);

  // Listen for reset-page-search events
  useEffect(() => {
    const handleResetSearch = (e: Event) => {
      const customEvent = e as CustomEvent<{ href?: string }>;
      if (!customEvent.detail?.href || customEvent.detail.href === pathname || customEvent.detail.href === "/dua") {
        setSearchValue("");
        setDebouncedQuery("");
        const p = new URLSearchParams(window.location.search);
        p.delete("q");
        const qs = p.toString();
        window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
      }
    };
    window.addEventListener("reset-page-search", handleResetSearch);
    return () => window.removeEventListener("reset-page-search", handleResetSearch);
  }, [pathname]);

  // Fetch chapters for the sidebar
  const { data: rawChapters } = useAsyncData(
    () => fetchDuaChapters(),
    [],
  );

  // Fetch duas for this chapter / id using debouncedQuery (no router reloads)
  const { data: detailData, loading } = useAsyncData(
    async () => {
      if (!chapterId) return { chapter: null, items: [] };
      try {
        const res = await fetchDuaChapterItems(chapterId, debouncedQuery);
        if (res.chapter || (res.items && res.items.length > 0)) {
          return res;
        }
      } catch {}

      try {
        const single = await fetchDuaById(chapterId);
        if (single.item) {
          return {
            chapter: single.chapter,
            items: [single.item],
          };
        }
      } catch {}

      return { chapter: null, items: [] };
    },
    [chapterId, debouncedQuery],
  );

  const duas = detailData?.items ?? [];
  const currentChapter = detailData?.chapter;

  const handleClearSearch = React.useCallback(() => {
    setSearchValue("");
    setDebouncedQuery("");
    const p = new URLSearchParams(window.location.search);
    p.delete("q");
    const qs = p.toString();
    const target = qs ? `${pathname}?${qs}` : pathname;
    window.history.replaceState(null, "", target);
  }, [pathname]);

  // Debounce search input without triggering full-page router reloads
  useEffect(() => {
    if (searchValue === debouncedQuery) return;

    if (searchValue.trim() === "") {
      setDebouncedQuery("");
      const p = new URLSearchParams(window.location.search);
      p.delete("q");
      const qs = p.toString();
      const target = qs ? `${pathname}?${qs}` : pathname;
      window.history.replaceState(null, "", target);
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedQuery(searchValue);
      const p = new URLSearchParams(window.location.search);
      p.set("q", searchValue);
      const qs = p.toString();
      const target = qs ? `${pathname}?${qs}` : pathname;
      window.history.replaceState(null, "", target);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, debouncedQuery, pathname]);

  const setParams = React.useCallback(
    (next: Record<string, string | null>) => {
      const p = new URLSearchParams(searchParams.toString());
      Object.entries(next).forEach(([key, value]) => {
        if (value === null || value === "") p.delete(key);
        else p.set(key, value);
      });
      const queryString = p.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  // Smooth scroll to targeted dua
  useEffect(() => {
    if (targetDuaId && !loading && duas.length > 0) {
      const timer = setTimeout(() => {
        const el = document.getElementById(targetDuaId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [targetDuaId, loading, duas.length]);

  const dynamicSidebarCategories = React.useMemo(() => {
    if (!rawChapters || rawChapters.length === 0) return [];
    return rawChapters.map((c) => ({
      id: c.chapterId,
      slug: c.chapterId,
      name: c.title,
      translationKey: c.title,
      count: c.count || 0,
    }));
  }, [rawChapters]);

  const onSelectCategory = (slug: string | null) => {
    if (!slug) {
      router.push("/dua");
    } else {
      router.push(`/dua/${slug}`);
    }
  };

  return (
    <section className={listingStyles.section}>
      <Wrapper>
        <button
          type="button"
          onClick={() => router.push("/dua")}
          className={detailStyles.backLink}
        >
          <ChevronLeft className={detailStyles.backIcon} />
          {t("detail.back") || "সব দুআ"}
        </button>

        <div className={listingStyles.pageHeader}>
          <div className={listingStyles.headerTextGroup}>
            <h1 className={listingStyles.title}>
              {currentChapter?.title || t("dua.title")}
            </h1>
            <p className={listingStyles.subtitle}>{t("dua.subtitle")}</p>
          </div>

          <div className={listingStyles.searchBox}>
            <Search className={listingStyles.searchIcon} />
            <input
              type="search"
              className={listingStyles.searchInput}
              placeholder={t("dua.searchPlaceholder")}
              aria-label={t("dua.searchPlaceholder")}
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  handleClearSearch();
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  setDebouncedQuery(searchValue);
                  const p = new URLSearchParams(window.location.search);
                  if (searchValue.trim()) p.set("q", searchValue);
                  else p.delete("q");
                  const qs = p.toString();
                  window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
                }
              }}
            />
            {searchValue && (
              <button
                type="button"
                className={listingStyles.clearBtn}
                onClick={handleClearSearch}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className={listingStyles.contentGrid}>
          <div className={listingStyles.mainColumn}>
            <CategoryChips
              activeSlug={chapterId}
              onSelect={onSelectCategory}
              categories={dynamicSidebarCategories}
              translationNamespace="listing.duaCategories."
              allLabel={t("dua.allTopics")}
            />

            {loading ? (
              <DuaDetailSkeleton />
            ) : duas.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                এই অধ্যায়ে কোনো দুআ পাওয়া যায়নি
              </div>
            ) : (
              <div className={styles.duaList}>
                {duas.map((dua) => (
                  <DuaCard
                    key={dua._id || dua.duaId}
                    item={{
                      id: dua.duaId || dua._id,
                      duaId: dua.duaId,
                      title: dua.title,
                      arabic: dua.arabic,
                      pronunciation: dua.pronunciation,
                      translation: dua.translation,
                      meaning: dua.translation,
                      tafsir: dua.tafsir,
                      sourceLabel: dua.sourceLabel,
                      sourceLabelBangla: dua.sourceLabelBangla,
                      sourceLabelArabic: dua.sourceLabelArabic,
                      ayahLabel: dua.ayahLabel,
                      audioUrl: dua.audioUrl,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <CategorySidebar
            activeSlug={chapterId}
            onSelect={onSelectCategory}
            categories={dynamicSidebarCategories}
            translationNamespace="listing.duaCategories."
            title={t("dua.categoriesTitle")}
            allLabel={t("dua.allTopics")}
            placement="dua"
          />
        </div>
      </Wrapper>
    </section>
  );
}
