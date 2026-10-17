"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { getAnswerQuestion } from "@/data/mockProfile";
import type { QuestionItem } from "@/data/mockQuestions";
import { useAsyncData } from "@/hooks/use-async-data";
import { useLocale } from "@/hooks/use-locale";
import { useTranslations } from "@/hooks/use-translations";
import { toLocalizedNumber } from "@/lib/banglaFormat";
import ComposeForm from "./ComposeForm";
import area from "./profile-area.module.css";
import parts from "./profile-parts.module.css";

/** /answer-queue/[id] — the author answer panel (question + authoring form). */
const AnswerPanelClient: React.FC<{ id: string }> = ({ id }) => {
  const t = useTranslations();
  const { locale } = useLocale();
  const router = useRouter();

  const { data, loading } = useAsyncData<QuestionItem>(() => getAnswerQuestion(id), [id]);

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
          onSubmit={() => { alert("Answer submission not yet implemented"); }}
        />
      </div>
    </div>
  );
};

export default AnswerPanelClient;
