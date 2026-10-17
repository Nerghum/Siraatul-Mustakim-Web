"use client";

import { Folder } from "lucide-react";
import React from "react";
import { FolderOpen } from "@/components/ui/folder-open";
import { MOCK_CATEGORIES } from "@/data/mockCategories";
import { useLocale } from "@/hooks/use-locale";
import { useSmartSticky } from "@/hooks/use-smart-sticky";
import { useTranslations } from "@/hooks/use-translations";
import { toLocalizedNumber } from "@/lib/banglaFormat";
import { cn } from "@/lib/utils";
import styles from "@/styles/listing.module.css";
import AdvertisementCard from "./AdvertisementCard";

type CategoryProps = {
  /** Currently selected `?category=` slug, or `null` for "all". */
  activeSlug: string | null;
  onSelect: (slug: string | null) => void;
  /** Custom categories array. Defaults to MOCK_CATEGORIES. */
  categories?: { id: string; slug: string; translationKey: string; count: number; name?: string }[];
  /** Translation namespace prefix. Defaults to "listing.categories.". */
  translationNamespace?: string;
  /** Label for the 'All' option. Defaults to listing.allCategories. */
  allLabel?: string;
};

function useToggle({ activeSlug, onSelect }: CategoryProps) {
  return (slug: string) => onSelect(activeSlug === slug ? null : slug);
}

/**
 * Mobile face of the category list: a horizontally scrolling chip row that sits
 * above the cards. Hidden from 1024px up, where `<CategorySidebar />` takes over.
 */
export const CategoryChips: React.FC<CategoryProps> = (props) => {
  const {
    activeSlug,
    onSelect,
    categories = MOCK_CATEGORIES,
    translationNamespace = "listing.categories.",
    allLabel,
  } = props;
  const t = useTranslations();
  const toggle = useToggle(props);
  const rowRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!rowRef.current) return;
    const active = rowRef.current.querySelector('[aria-selected="true"]') as HTMLElement | null;
    if (active) {
      const container = rowRef.current;
      const scrollLeft = active.offsetLeft - container.offsetWidth / 2 + active.offsetWidth / 2;
      container.scrollTo({ left: Math.max(0, scrollLeft), behavior: "smooth" });
    }
  }, [activeSlug]);

  return (
    <div
      ref={rowRef}
      className={styles.chipRow}
      role="tablist"
      aria-label={t("listing.categoriesTitle")}
    >
      <button
        type="button"
        role="tab"
        aria-selected={activeSlug === null}
        onClick={() => {
          onSelect(null);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className={cn(styles.chip, activeSlug === null && styles.chipActive)}
      >
        {allLabel ?? t("listing.allCategories")}
      </button>

      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          role="tab"
          aria-selected={activeSlug === category.slug}
          onClick={() => {
            toggle(category.slug);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={cn(styles.chip, activeSlug === category.slug && styles.chipActive)}
        >
          {t(`${translationNamespace}${category.translationKey}`) !== `${translationNamespace}${category.translationKey}`
            ? t(`${translationNamespace}${category.translationKey}`)
            : (category as any).name || category.translationKey}
        </button>
      ))}
    </div>
  );
};

type SidebarProps = CategoryProps & {
  /** Header label; defaults to the shared "categories" title. */
  title?: string;
  /** Placement key for targeted advertisements (e.g. 'books', 'bayan', 'dua', etc.) */
  placement?: string;
};

const CategorySidebar: React.FC<SidebarProps> = (props) => {
  const {
    activeSlug,
    title,
    allLabel,
    placement,
    categories = MOCK_CATEGORIES,
    translationNamespace = "listing.categories.",
  } = props;
  const t = useTranslations();
  const { locale } = useLocale();
  const toggle = useToggle(props);
  const stickyRef = useSmartSticky(88); // 72px header + 16px gap

  const totalCount = React.useMemo(
    () => categories.reduce((sum, c) => sum + (c.count || 0), 0),
    [categories],
  );

  return (
    <div ref={stickyRef} className={styles.sidebarWrapper}>
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarHeader}>
          <FolderOpen className={styles.sidebarHeaderIcon} fill="currentColor" />
          {title ?? t("listing.categoriesTitle")}
        </h2>

        <div className={styles.categoryList}>
          <button
            type="button"
            onClick={() => {
              props.onSelect(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={cn(styles.categoryRow, activeSlug === null && styles.categoryRowActive)}
          >
            <Folder className={styles.categoryIcon} />
            <span className={styles.categoryLabel}>{allLabel ?? t("listing.allCategories")}</span>
            <span className={styles.categoryCount}>{toLocalizedNumber(totalCount, locale)}</span>
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => {
                toggle(category.slug);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={cn(
                styles.categoryRow,
                activeSlug === category.slug && styles.categoryRowActive,
              )}
            >
              <Folder className={styles.categoryIcon} />
              <span className={styles.categoryLabel}>
                {t(`${translationNamespace}${category.translationKey}`) !== `${translationNamespace}${category.translationKey}`
                  ? t(`${translationNamespace}${category.translationKey}`)
                  : (category as any).name || category.translationKey}
              </span>
              <span className={styles.categoryCount}>
                {toLocalizedNumber(category.count, locale)}
              </span>
            </button>
          ))}
        </div>
      </aside>
      <AdvertisementCard placement={placement} />
    </div>
  );
};

export default CategorySidebar;
