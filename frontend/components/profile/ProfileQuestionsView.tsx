"use client";

import React from "react";
import SegmentedControl from "@/components/donate/SegmentedControl";
import { useAuthContext } from "@/components/auth/AuthProvider";
import EmptyState from "@/components/shared/EmptyState";
import Pagination from "@/components/shared/Pagination";
import { getAnswerQueue, getMyQuestions, type QuestionStatus } from "@/data/mockProfile";
import { useAsyncData } from "@/hooks/use-async-data";
import { useTranslations } from "@/hooks/use-translations";
import ProfileCardSkeleton from "./ProfileCardSkeleton";
import ProfileQuestionCard from "./ProfileQuestionCard";
import area from "./profile-area.module.css";
import QaAdCard from "./QaAdCard";

type Props = {
  /** "user" = /my-questions (read-only). "author" = /answer-queue (answer actions). */
  mode: "user" | "author";
};

const ProfileQuestionsView: React.FC<Props> = ({ mode }) => {
  const t = useTranslations();
  const ns = mode === "author" ? "answerQueue" : "myQuestions";

  const [status, setStatus] = React.useState<QuestionStatus>("answered");
  const [page, setPage] = React.useState(1);
  const { user } = useAuthContext();

  const fetcher = mode === "author" ? getAnswerQueue : getMyQuestions;
  const { data, loading } = useAsyncData(() => fetcher({ status, page, author: user?.name, phone: user?.phone }), [mode, status, page, user]);
  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const changeStatus = (next: QuestionStatus) => {
    setStatus(next);
    setPage(1);
  };

  const changePage = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={area.content}>
      <h1 className={area.pageTitle}>{t(`profile.${ns}.title`)}</h1>

      <div className={area.tabs}>
        <SegmentedControl
          ariaLabel={t(`profile.${ns}.title`)}
          value={status}
          onChange={changeStatus}
          options={[
            { value: "answered", label: t(`profile.${ns}.tabs.answered`) },
            { value: "waiting", label: t(`profile.${ns}.tabs.waiting`) },
          ]}
        />
      </div>

      <div className={area.stack}>
        {loading ? (
          <ProfileCardSkeleton count={2} />
        ) : items.length === 0 ? (
          <EmptyState
            title={t("profile.empty.title")}
            cta={
              mode === "author"
                ? { label: t("profile.empty.browse"), href: "/question-answer" }
                : { label: t("profile.empty.ask"), href: "/ask" }
            }
          />
        ) : (
          items.map((item) => <ProfileQuestionCard key={item.id} item={item} variant={mode} />)
        )}

        {!loading && items.length > 0 && (
          <Pagination page={page} totalPages={totalPages} onChange={changePage} />
        )}
      </div>

      {mode === "user" && <QaAdCard />}

    </div>
  );
};

export default ProfileQuestionsView;
