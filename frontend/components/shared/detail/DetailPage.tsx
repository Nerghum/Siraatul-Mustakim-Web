"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { useAuthContext } from "@/components/auth/AuthProvider";
import CategorySidebar from "@/components/shared/CategorySidebar";
import { ScrollRevealItem, ScrollRevealWrapper } from "@/components/shared/ScrollReveal";
import Wrapper from "@/components/wrapper";
import { MOCK_ARTICLE_CATEGORIES, MOCK_CATEGORIES } from "@/data/mockCategories";
import { fetchMasailById, fetchMasailCategories, fetchMasailList } from "@/lib/api/masail";
import { fetchDetailPage } from "@/data/mockDetail";
import { fetchArticleById } from "@/lib/api/articles";
import { useAsyncData } from "@/hooks/use-async-data";
import { useLocale } from "@/hooks/use-locale";
import { useRecordView } from "@/hooks/use-record-view";
import { useRipple } from "@/hooks/use-ripple";
import { useTranslations } from "@/hooks/use-translations";
import { cn } from "@/lib/utils";
import styles from "@/styles/detail.module.css";
import type { ListingNamespace } from "@/types/listing";
import DetailCard from "./DetailCard";
import DetailContentSkeleton from "./DetailContentSkeleton";
import RelatedSection from "./RelatedSection";
import ShareRow from "./ShareRow";

type DetailPageProps = {
  id: string;
  namespace: ListingNamespace;
  /** Link prefix for this route, e.g. "/masail". */
  basePath: string;
};

const DetailPage: React.FC<DetailPageProps> = ({ id, namespace, basePath }) => {
  const t = useTranslations();
  const { locale } = useLocale();
  const router = useRouter();
  const createRipple = useRipple();
  const { isAuthenticated, openAuthModal, setOnAuthenticated } = useAuthContext();

  const { data: dynamicCategories } = useAsyncData(
    () => (namespace === "masail" ? fetchMasailCategories() : Promise.resolve(null)),
    [namespace],
  );

  let categoriesToUse = dynamicCategories && dynamicCategories.length > 0 ? dynamicCategories : MOCK_CATEGORIES;
  let translationNamespaceToUse = "listing.categories.";
  if (namespace === "articles") {
    categoriesToUse = MOCK_ARTICLE_CATEGORIES;
    translationNamespaceToUse = "listing.articleCategories.";
  }

  const { data, loading } = useAsyncData(
    async () => {
      if (namespace === "masail") {
        const [m, categories, allMasail] = await Promise.all([
          fetchMasailById(id),
          fetchMasailCategories().catch(() => []),
          fetchMasailList().catch(() => []),
        ]);

        const matchedCategory = categories.find(
          (c) => c.slug === m.category || c.name === m.category || c.id === m.category
        );
        const categoryLabel = matchedCategory?.name || m.category || "";
        const categorySlug = matchedCategory?.slug || m.category || "";

        const masailAuthor = locale === "bn" ? "সিরাতুল মুস্তাকিম" : "Siraatul Mustaqim";

        // Adapt MasailApiItem → DetailPageData shape
        const detail = {
          id: m._id,
          title: m.title,
          excerpt: (m.description || "").replace(/<[^>]*>?/gm, "").slice(0, 200),
          author: masailAuthor,
          date: m.createdAt,
          views: m.views ?? 0,
          category: categorySlug,
          body: [
            { type: "bismillah" as const, text: "বিসমিল্লাহির রহমানির রহীম" },
            { type: "html" as const, text: m.description },
          ],
          tags: categoryLabel
            ? [{ label: categoryLabel, variant: "primary" as const }]
            : [],
          topics: [],
        };

        const otherMasail = allMasail.filter((item) => item._id !== id);
        const sameCategory = otherMasail.filter(
          (item) => item.category && (item.category === categorySlug || item.category === m.category)
        );
        const remaining = otherMasail.filter((item) => !sameCategory.includes(item));
        const relatedRaw = [...sameCategory, ...remaining].slice(0, 6);
        const related = relatedRaw.map((item) => ({
          id: item._id,
          title: item.title,
          excerpt: (item.description || "").replace(/<[^>]*>?/gm, "").slice(0, 200),
          author: masailAuthor,
          date: item.createdAt,
          views: item.views ?? 0,
          category: item.category ?? "",
        }));

        return { detail, related };
      }
      if (namespace === "articles") {
        const a = await fetchArticleById(id);
        const detail = {
          id: a._id,
          title: a.title,
          excerpt: a.content.slice(0, 200),
          author: a.author?.name || "লেখক",
          date: a.createdAt,
          views: a.views ?? 0,
          category: a.tags?.[0] || "",
          body: [
            {
              type: "html" as const,
              text: a.content,
            },
          ],
          tags: a.tags || [],
          topics: [],
        };
        return { detail, related: [] };
      }
      return fetchDetailPage(namespace, id);
    },
    [namespace, id, locale],
  );
  const detail = data?.detail ?? null;
  const related = data?.related ?? [];

  const entityType = namespace === "articles" ? "article" : namespace === "masail" ? "masail" : namespace;
  const liveViews = useRecordView(
    { entityType, entityId: id },
    detail?.views ?? 0
  );

  const [saved, setSaved] = React.useState(false);

  const handleToggleSave = () => {
    if (!isAuthenticated) {
      setOnAuthenticated(() => {
        setSaved(true);
        toast.success(t("detail.bookmarkAdd") || "বুকমার্কে যুক্ত করা হয়েছে");
      });
      openAuthModal();
      return;
    }
    setSaved((prev) => {
      const next = !prev;
      toast.success(
        next
          ? t("detail.bookmarkAdd") || "বুকমার্কে যুক্ত করা হয়েছে"
          : t("detail.bookmarkRemove") || "বুকমার্ক থেকে সরানো হয়েছে",
      );
      return next;
    });
  };

  const path = detail ? `${basePath}/${detail.id}` : basePath;

  const handleShare = async () => {
    if (!detail) return;
    const url = `${window.location.origin}${path}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: detail.title, url });
        return;
      } catch {
        // Sheet dismissed — fall through to the clipboard copy.
      }
    }
    try {
      await navigator.clipboard?.writeText(url);
    } catch {
      // Clipboard write failed (e.g. document not focused)
    }
  };

  return (
    <>
      <section className={styles.section}>
        <Wrapper>
          <ScrollRevealWrapper>
            <ScrollRevealItem>
              <button
                type="button"
                className={styles.backLink}
                onClick={() => {
                  router.back();
                }}
              >
                <ChevronLeft className={styles.backIcon} />
                {t("detail.back")}
              </button>
            </ScrollRevealItem>

            <div className={styles.contentGrid}>
              <ScrollRevealItem className={styles.mainColumn}>
                {loading || !detail ? (
                  <DetailContentSkeleton namespace={namespace} />
                ) : (
                  <div className={styles.mainColumn}>
                    <DetailCard
                      detail={{ ...detail, views: liveViews }}
                      namespace={namespace}
                      saved={saved}
                      onToggleSave={handleToggleSave}
                      onShare={handleShare}
                      path={path}
                      basePath={basePath}
                    />

                    <div className={styles.shareCardMobile}>
                      <ShareRow path={path} title={detail.title} />
                    </div>
                  </div>
                )}
              </ScrollRevealItem>

              <CategorySidebar
                activeSlug={detail?.category || null}
                onSelect={(slug) => router.push(slug ? `${basePath}?category=${slug}` : basePath)}
                categories={categoriesToUse}
                translationNamespace={translationNamespaceToUse}
                title={t(`${namespace}.categoriesTitle`)}
              />
            </div>
          </ScrollRevealWrapper>
        </Wrapper>
      </section>

      <RelatedSection items={related} basePath={basePath} namespace={namespace} loading={loading} />
    </>
  );
};

export default DetailPage;
