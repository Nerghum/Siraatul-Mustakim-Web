"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import DuaAccordion from "@/components/dua/DuaAccordion";
import CategorySidebar, { CategoryChips } from "@/components/shared/CategorySidebar";
import Pagination from "@/components/shared/Pagination";
import { ScrollRevealItem, ScrollRevealWrapper } from "@/components/shared/ScrollReveal";
import Wrapper from "@/components/wrapper";
import { fetchDuaChapters } from "@/lib/api/dua";
import { useAsyncData } from "@/hooks/use-async-data";
import { useTranslations } from "@/hooks/use-translations";
import styles from "@/styles/listing.module.css";

export default function DuaPage() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("q") ?? "";
  const category = searchParams.get("category");
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);

  const [searchValue, setSearchValue] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  // Sync state if URL search param changes externally (e.g. browser back/forward)
  useEffect(() => {
    const urlQ = searchParams.get("q") ?? "";
    if (urlQ !== debouncedQuery) {
      setSearchValue(urlQ);
      setDebouncedQuery(urlQ);
    }
  }, [searchParams]);

  // Listen for reset-page-search events (e.g. from clicking header/sidebar menu links)
  useEffect(() => {
    const handleResetSearch = (e: Event) => {
      const customEvent = e as CustomEvent<{ href?: string }>;
      if (!customEvent.detail?.href || customEvent.detail.href === pathname || customEvent.detail.href === "/dua") {
        setSearchValue("");
        setDebouncedQuery("");
        const params = new URLSearchParams(window.location.search);
        params.delete("q");
        params.delete("page");
        const qs = params.toString();
        window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
      }
    };
    window.addEventListener("reset-page-search", handleResetSearch);
    return () => window.removeEventListener("reset-page-search", handleResetSearch);
  }, [pathname]);

  const { data: rawChapters, loading } = useAsyncData(
    () => fetchDuaChapters({ q: debouncedQuery, includeItems: true }),
    [debouncedQuery],
  );

  const handleClearSearch = React.useCallback(() => {
    setSearchValue("");
    setDebouncedQuery("");
    const params = new URLSearchParams(window.location.search);
    params.delete("q");
    params.delete("page");
    const qs = params.toString();
    const target = qs ? `${pathname}?${qs}` : pathname;
    window.history.replaceState(null, "", target);
  }, [pathname]);

  // Debounce search input without triggering full-page router reloads
  useEffect(() => {
    if (searchValue === debouncedQuery) return;

    if (searchValue.trim() === "") {
      setDebouncedQuery("");
      const params = new URLSearchParams(window.location.search);
      params.delete("q");
      params.delete("page");
      const qs = params.toString();
      const target = qs ? `${pathname}?${qs}` : pathname;
      window.history.replaceState(null, "", target);
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedQuery(searchValue);
      const params = new URLSearchParams(window.location.search);
      params.set("q", searchValue);
      params.delete("page");
      const qs = params.toString();
      const target = qs ? `${pathname}?${qs}` : pathname;
      window.history.replaceState(null, "", target);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, debouncedQuery, pathname]);

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

  const filteredChapters = React.useMemo(() => {
    if (!rawChapters) return [];
    if (!category) return rawChapters;
    return rawChapters.filter(
      (c) => c.chapterId === category || c.id === category
    );
  }, [rawChapters, category]);

  const limit = 10;
  const totalPages = Math.max(1, Math.ceil(filteredChapters.length / limit));
  const pageChapters = React.useMemo(() => {
    return filteredChapters.slice((page - 1) * limit, page * limit);
  }, [filteredChapters, page]);

  const accordionCategories = React.useMemo(() => {
    return pageChapters.map((c) => ({
      id: c.chapterId,
      title: c.title,
      items: (c.items || []).map((item) => ({
        id: item.duaId,
        title: item.title,
        href: `/dua/${c.chapterId}?dua=${item.duaId}`,
      })),
    }));
  }, [pageChapters]);

  const dynamicSidebarCategories = React.useMemo(() => {
    if (!rawChapters || rawChapters.length === 0) return [];
    return rawChapters.map((c) => ({
      id: c.chapterId,
      slug: c.chapterId,
      name: c.title,
      translationKey: c.title,
      count: c.count ?? (c.items?.length || 0),
    }));
  }, [rawChapters]);

  const handlePageChange = (newPage: number) => {
    setParams({ page: newPage > 1 ? String(newPage) : null });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className={styles.section}>
      <Wrapper>
        <ScrollRevealWrapper>
          <ScrollRevealItem className={styles.pageHeader}>
            <div className={styles.headerTextGroup}>
              <h1 className={styles.title}>{t("dua.title")}</h1>
              <p className={styles.subtitle}>{t("dua.subtitle")}</p>
            </div>

            <div className={styles.searchBox}>
              <Search className={styles.searchIcon} />
              <input
                type="search"
                className={styles.searchInput}
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
                    const params = new URLSearchParams(window.location.search);
                    if (searchValue.trim()) params.set("q", searchValue);
                    else params.delete("q");
                    params.delete("page");
                    const qs = params.toString();
                    window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
                  }
                }}
              />
              {searchValue && (
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </ScrollRevealItem>

          <div className={styles.contentGrid}>
            <div className={styles.mainColumn}>
              <ScrollRevealItem className="flex flex-col gap-[1rem]">
                <CategoryChips
                  activeSlug={category}
                  onSelect={(slug) => setParams({ category: slug, page: null })}
                  categories={dynamicSidebarCategories}
                  translationNamespace="listing.duaCategories."
                  allLabel={t("dua.allTopics")}
                />

                <DuaAccordion categories={accordionCategories} loading={loading} />

                {totalPages > 1 && (
                  <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
                )}
              </ScrollRevealItem>
            </div>

            <CategorySidebar
              activeSlug={category}
              onSelect={(slug) => setParams({ category: slug, page: null })}
              categories={dynamicSidebarCategories}
              translationNamespace="listing.duaCategories."
              title={t("dua.categoriesTitle")}
              allLabel={t("dua.allTopics")}
              placement="dua"
            />
          </div>
        </ScrollRevealWrapper>
      </Wrapper>
    </section>
  );
}
