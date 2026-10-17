"use client";

import { Search } from "lucide-react";
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

  const query = searchParams.get("q") ?? "";
  const category = searchParams.get("category");
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);

  const { data: rawChapters, loading } = useAsyncData(
    () => fetchDuaChapters({ q: query, includeItems: true }),
    [query],
  );

  const [searchValue, setSearchValue] = useState(query);
  const [lastQuery, setLastQuery] = useState(query);

  if (lastQuery !== query) {
    setLastQuery(query);
    setSearchValue(query);
  }

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

  useEffect(() => {
    if (searchValue === query) return;
    const timer = setTimeout(
      () => setParams({ q: searchValue, page: null }, { replace: true }),
      300,
    );
    return () => clearTimeout(timer);
  }, [searchValue, query, setParams]);

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
              />
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
