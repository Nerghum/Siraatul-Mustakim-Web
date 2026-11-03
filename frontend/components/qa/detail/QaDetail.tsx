"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { useAuthContext } from "@/components/auth/AuthProvider";
import CategorySidebar from "@/components/shared/CategorySidebar";
import ShareRow from "@/components/shared/detail/ShareRow";
import { ScrollRevealItem, ScrollRevealWrapper } from "@/components/shared/ScrollReveal";
import Wrapper from "@/components/wrapper";
import { MOCK_QA_CATEGORIES } from "@/data/mockCategories";
import { fetchQuestionPage } from "@/data/mockQaDetail";
import { useAsyncData } from "@/hooks/use-async-data";
import { useRecordView } from "@/hooks/use-record-view";
import { useRipple } from "@/hooks/use-ripple";
import { useTranslations } from "@/hooks/use-translations";
import styles from "@/styles/detail.module.css";
import AnswerPanel from "./AnswerPanel";
import AskCta from "./AskCta";
import QaDetailContentSkeleton from "./QaDetailContentSkeleton";
import QuestionPanel from "./QuestionPanel";
import RelatedQuestions from "./RelatedQuestions";

const QaDetail: React.FC<{ id: string }> = ({ id }) => {
  const t = useTranslations();
  const router = useRouter();
  const createRipple = useRipple();
  const { isAuthenticated, openAuthModal, setOnAuthenticated } = useAuthContext();

  const { data, loading } = useAsyncData(() => fetchQuestionPage(id), [id]);
  const detail = data?.detail ?? null;
  const related = data?.related ?? [];

  const liveViews = useRecordView(
    { entityType: "faq", entityId: id },
    detail?.views ?? 0
  );

  // The question and answer cards share one saved state — they are one item.
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

  const handleShare = async () => {
    if (!detail) return;
    const url = `${window.location.origin}/qa/${detail.id}`;
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
      // Ignore if document not focused
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
                {t("qa.detail.back")}
              </button>
            </ScrollRevealItem>

            <div className={styles.contentGrid}>
              <ScrollRevealItem className={styles.mainColumn}>
                {loading || !detail ? (
                  <QaDetailContentSkeleton />
                ) : (
                  <div className={styles.mainColumn}>
                    <QuestionPanel
                      detail={{ ...detail, views: liveViews }}
                      saved={saved}
                      onToggleSave={handleToggleSave}
                      onShare={handleShare}
                    />

                    <div className={styles.qaMobileDivider} />

                    <AnswerPanel
                      detail={{ ...detail, views: liveViews }}
                      saved={saved}
                      onToggleSave={handleToggleSave}
                      onShare={handleShare}
                    />

                    <div className={styles.shareCardMobile}>
                      <ShareRow path={`/question-answer/${detail.id}`} title={detail.title} />
                    </div>

                    <AskCta />
                  </div>
                )}
              </ScrollRevealItem>

              <CategorySidebar
                activeSlug={null}
                onSelect={(slug) => router.push(slug ? `/question-answer?category=${slug}` : "/question-answer")}
                title={t("qa.categoriesTitle")}
                categories={MOCK_QA_CATEGORIES}
                translationNamespace="listing.qaCategories."
                placement="masail"
              />
            </div>
          </ScrollRevealWrapper>
        </Wrapper>
      </section>

      <RelatedQuestions items={related} loading={loading} />
    </>
  );
};

export default QaDetail;
