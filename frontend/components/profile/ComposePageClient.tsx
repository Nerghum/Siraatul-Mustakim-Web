"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useTranslations } from "@/hooks/use-translations";
import { useAuth } from "@/hooks/use-auth";
import { createArticle, updateArticle, fetchArticleById } from "@/lib/api/articles";
import ComposeForm from "./ComposeForm";
import area from "./profile-area.module.css";
import parts from "./profile-parts.module.css";

/** /my-articles/new & /my-masail/new — compose an article/masail. */
const ComposePageClient: React.FC<{ mode: "articles" | "masail"; id?: string }> = ({ mode, id }) => {
  const t = useTranslations();
  const router = useRouter();
  const { session } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [initialData, setInitialData] = React.useState<any>(null);

  React.useEffect(() => {
    if (id && mode === "articles") {
      fetchArticleById(id)
        .then(setInitialData)
        .catch((err) => alert("Failed to load article"));
    }
  }, [id, mode]);

  const handleSubmit = async (data: { title: string; content: string; status: "draft" | "published"; tags: string[] }) => {
    if (!session?.token) {
      alert("Please login first");
      return;
    }
    
    if (mode === "articles") {
      try {
        setIsSubmitting(true);
        if (id) {
          await updateArticle(id, data, session.token);
          alert(data.status === "published" ? "Article updated and published!" : "Draft updated!");
        } else {
          await createArticle(data, session.token);
          alert(data.status === "published" ? "Article published!" : "Draft saved!");
        }
        router.push("/my-articles");
      } catch (err: any) {
        alert(err.message || "An error occurred");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Masail submit placeholder
      alert("Masail creation not yet connected to backend");
    }
  };

  return (
    <div className={area.content}>
      <button type="button" className={area.backLink} onClick={() => router.back()}>
        <ChevronLeft size={20} />
        {t("profile.back")}
      </button>

      <div className={parts.panelCard}>
        <ComposeForm
          editorLabel={mode === "articles" ? t("profile.compose.articleLabel") : t("profile.compose.masailLabel") || "Content"}
          editorPlaceholder={t("profile.compose.articlePlaceholder")}
          publishLabel={mode === "articles" ? (id ? "Update" : t("profile.compose.publishArticle")) : t("profile.compose.publishMasail") || "Publish"}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          initialData={initialData}
        />
      </div>
    </div>
  );
};

export default ComposePageClient;
