"use client";

import { Calendar, Plus, Edit3 } from "lucide-react";
import Link from "next/link";
import React from "react";
import SegmentedControl from "@/components/donate/SegmentedControl";
import EmptyState from "@/components/shared/EmptyState";
import Pagination from "@/components/shared/Pagination";
import {
  type AuthorItem,
  getAuthorMasail,
  type PublishStatus,
} from "@/data/mockProfile";
import { getAuthorArticles } from "@/lib/api/articles";
import { useAuth } from "@/hooks/use-auth";
import { useAsyncData } from "@/hooks/use-async-data";
import { useLocale } from "@/hooks/use-locale";
import { useTranslations } from "@/hooks/use-translations";
import { formatLocalizedShortDate } from "@/lib/banglaFormat";
import ProfileCardSkeleton from "./ProfileCardSkeleton";
import area from "./profile-area.module.css";
import parts from "./profile-parts.module.css";

type Props = {
  /** "articles" = /my-articles, "masail" = /my-masail. */
  mode: "articles" | "masail";
};

const baseId = (id: string) => id.split("-")[0];

const AuthorCard: React.FC<{ item: AuthorItem; basePath: string; editPath?: string }> = ({ item, basePath, editPath }) => {
  const t = useTranslations();
  const { locale } = useLocale();

  const targetHref = editPath ? `${editPath}/${baseId(item.id)}/edit` : `${basePath}/${baseId(item.id)}`;

  return (
    <Link href={targetHref} className={parts.pqCard}>
      {item.tags.length > 0 && (
        <div className={parts.tagRow}>
          {item.tags.map((tag) => {
            const key = `listing.categories.${tag}`;
            const label = t(key);
            return (
              <span key={tag} className={parts.tag}>
                {label === key ? tag : label}
              </span>
            );
          })}
        </div>
      )}

      <h3 className={parts.pqTitle}>{item.title}</h3>

      <p className={parts.pqExcerpt}>{item.excerpt}</p>

      <div className={parts.pqBottom}>
        <span className={parts.pqDate}>
          <Calendar className={parts.pqDateIcon} />
          {formatLocalizedShortDate(item.date, locale)}
        </span>
        {editPath && (
          <span className={parts.pqEditBtn}>
            <Edit3 size={14} />
            {t("profile.edit") || "Edit"}
          </span>
        )}
      </div>
    </Link>
  );
};

const AuthorContentView: React.FC<Props> = ({ mode }) => {
  const t = useTranslations();
  const { session } = useAuth();
  const ns = mode === "articles" ? "articles" : "masailList";
  const basePath = mode === "articles" ? "/articles" : "/masail";
  const createHref = mode === "articles" ? "/my-articles/new" : "/my-masail/new";

  const [status, setStatus] = React.useState<PublishStatus>("published");
  const [page, setPage] = React.useState(1);

  const fetcher = mode === "articles" 
    ? (params: any) => getAuthorArticles({ ...params, authorId: session?.user?.id || "" }, session?.token || "")
    : getAuthorMasail;
    
  const { data, loading } = useAsyncData(
    () => fetcher({ status, page }), 
    [mode, status, page, session?.token, session?.user?.id]
  );
  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const changeStatus = (next: PublishStatus) => {
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

      <div className={parts.createRow}>
        <Link href={createHref} className={parts.createBtn}>
          <Plus size={16} />
          {t(`profile.${ns}.create`)}
        </Link>
      </div>

      <div className={area.tabs}>
        <SegmentedControl
          ariaLabel={t(`profile.${ns}.title`)}
          value={status}
          onChange={changeStatus}
          options={[
            { value: "published", label: t(`profile.${ns}.tabs.published`) },
            { value: "draft", label: t(`profile.${ns}.tabs.draft`) },
          ]}
        />
      </div>

      <div className={area.stack}>
        {loading ? (
          <ProfileCardSkeleton count={3} withTopRow={false} />
        ) : items.length === 0 ? (
          <EmptyState
            title={t("profile.empty.title")}
            cta={{
              label: t(`profile.${ns}.create`),
              href: createHref,
              icon: <Plus size={16} />,
            }}
          />
        ) : (
          items.map((item: any) => <AuthorCard key={item.id} item={item} basePath={basePath} editPath={mode === "articles" ? "/my-articles" : undefined} />)
        )}

        {!loading && items.length > 0 && (
          <Pagination page={page} totalPages={totalPages} onChange={changePage} />
        )}
      </div>
    </div>
  );
};

export default AuthorContentView;
