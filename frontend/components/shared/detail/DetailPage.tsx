"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useAuthContext } from "@/components/auth/AuthProvider";
import CategorySidebar from "@/components/shared/CategorySidebar";
import { ScrollRevealItem, ScrollRevealWrapper } from "@/components/shared/ScrollReveal";
import Wrapper from "@/components/wrapper";
import { MOCK_ARTICLE_CATEGORIES, MOCK_CATEGORIES } from "@/data/mockCategories";
import { fetchMasailById } from "@/lib/api/masail";
import { fetchDetailPage } from "@/data/mockDetail";
import { fetchArticleById } from "@/lib/api/articles";
import { useAsyncData } from "@/hooks/use-async-data";
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
  const router = useRouter();
  const createRipple = useRipple();
  const { isAuthenticated, openAuthModal, setOnAuthenticated } = useAuthContext();

  const { data, loading } = useAsyncData(
    async () => {
      if (namespace === "masail") {
        const m = await fetchMasailById(id);
        // Adapt MasailApiItem → DetailPageData shape
        const detail = {
          id: m._id,
          title: m.title,
          excerpt: (m.description || "").replace(/<[^>]*>?/gm, '').slice(0, 200),
          author: "সিরাতুল মুস্তাকিম",
          date: m.createdAt,
          views: 0,
          category: "",
          body: [
            { type: "bismillah" as const, text: "বিসমিল্লাহির রহমানির রহীম" },
            { type: "html" as const, text: m.description },
          ],
          tags: [],
          topics: [],
        };
        return { detail, related: [] };
      }
      if (namespace === "articles") {
        const a = await fetchArticleById(id);
        const detail = {
          id: a._id,
          title: a.title,
          excerpt: a.content.slice(0, 200),
          author: a.author?.name || "লেখক",
          date: a.createdAt,
          views: 0,
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
    [namespace, id],
  );
  const detail = data?.detail ?? null;
  const related = data?.related ?? [];

  const [saved, setSaved] = React.useState(false);

  const handleToggleSave = () => {
    if (!isAuthenticated) {
      setOnAuthenticated(() => {
        setSaved(true);
      });
      openAuthModal();
      return;
    }
    setSaved((prev) => !prev);
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
                      detail={detail}
                      namespace={namespace}
                      saved={saved}
                      onToggleSave={handleToggleSave}
                      onShare={handleShare}
                      path={path}
                    />

                    <div className={styles.shareCardMobile}>
                      <ShareRow path={path} title={detail.title} />
                    </div>
                  </div>
                )}
              </ScrollRevealItem>

              <CategorySidebar
                activeSlug={null}
                onSelect={(slug) => router.push(slug ? `${basePath}?category=${slug}` : basePath)}
                categories={namespace === "articles" ? MOCK_ARTICLE_CATEGORIES : MOCK_CATEGORIES}
                translationNamespace={
                  namespace === "articles" ? "listing.articleCategories." : "listing.categories."
                }
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
