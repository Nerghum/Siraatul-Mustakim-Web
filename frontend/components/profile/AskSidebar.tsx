"use client";

import React from "react";
import CategorySidebar from "@/components/shared/CategorySidebar";
import { MOCK_QA_CATEGORIES } from "@/data/mockCategories";
import { useTranslations } from "@/hooks/use-translations";

export function AskSidebar() {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-[1.5rem]">
      <CategorySidebar
        activeSlug={null}
        onSelect={() => {}}
        title={t("qa.categoriesTitle")}
        categories={MOCK_QA_CATEGORIES}
        translationNamespace="listing.qaCategories."
      />
    </div>
  );
}
