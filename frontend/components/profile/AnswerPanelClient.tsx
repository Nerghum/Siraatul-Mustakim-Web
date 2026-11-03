"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { getAnswerQuestion } from "@/data/mockProfile";
import type { QuestionItem } from "@/data/mockQuestions";
import { useAsyncData } from "@/hooks/use-async-data";
import { useLocale } from "@/hooks/use-locale";
import { useTranslations } from "@/hooks/use-translations";
import { toLocalizedNumber } from "@/lib/banglaFormat";
import { useAuthContext } from "@/components/auth/AuthProvider";
import ComposeForm from "./ComposeForm";
import area from "./profile-area.module.css";
import parts from "./profile-parts.module.css";

/** /answer-queue/[id] — the author answer panel (question + authoring form). */
const AnswerPanelClient: React.FC<{ id: string }> = ({ id }) => {
  const t = useTranslations();
  const { locale } = useLocale();
  const router = useRouter();
  const { user, token } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { data, loading } = useAsyncData<QuestionItem>(() => getAnswerQuestion(id), [id]);

  const handleSubmit = async (formData: {
    title: string;
    content: string;
    status: "draft" | "published";
    tags: string[];
  }) => {
    if (!formData.content.trim()) {
      alert("অনুগ্রহ করে আপনার উত্তরটি লিখুন।");
      return;
    }

    if (!token) {
      alert("অনুগ্রহ করে প্রথমে লগইন করুন।");
      return;
    }

    setIsSubmitting(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";
      const res = await fetch(`${API_BASE}/api/faq/${id}/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user?.id,
          author: user?.name || "মুফতি",
          category: formData.tags[0] || "অন্যান্য",
          answer: formData.content,
          status: formData.status === "published" ? "answered" : "pending",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "উত্তর সংরক্ষণ করা যায়নি।");
      }

      alert(
        formData.status === "published"
          ? "উত্তর সফলভাবে পাবলিশ করা হয়েছে।"
          : "উত্তর ড্রাফট হিসেবে সংরক্ষিত হয়েছে。"
      );
      router.push("/answer-queue");
    } catch (err: any) {
      alert(err.message || "উত্তর সংরক্ষণ করা যায়নি।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={area.content}>
      <button type="button" className={area.backLink} onClick={() => router.back()}>
        <ChevronLeft size={20} />
        {t("profile.back")}
      </button>

      <div className={parts.panelCard}>
        {!loading && data && (
          <>
            <h1 className={parts.qNo}>
              {t("profile.compose.questionNo")} {toLocalizedNumber(data.questionNo, locale)}
            </h1>
            <p className={parts.qText}>{data.excerpt}</p>
          </>
        )}

        <ComposeForm
          editorLabel={t("profile.compose.answerLabel")}
          editorPlaceholder={t("profile.compose.answerPlaceholder")}
          publishLabel={t("profile.compose.publishAnswer")}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default AnswerPanelClient;
