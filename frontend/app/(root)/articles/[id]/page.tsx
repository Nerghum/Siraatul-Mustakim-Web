import type { Metadata } from "next";

import { fetchArticleById } from "@/lib/api/articles";
import DetailPage from "@/components/shared/detail/DetailPage";

type PageParams = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const { id } = await params;
  let detail: any = null;
  try {
    detail = await fetchArticleById(id);
  } catch (e) {
    return { title: "Article not found" };
  }

  return {
    title: detail.title,
    description: detail.content?.slice(0, 160) || "",
    openGraph: {
      title: detail.title,
      description: detail.content?.slice(0, 160) || "",
      url: `/articles/${detail._id}`,
      type: "article",
    },
  };
}

export default async function ArticleDetailPage({ params }: { params: PageParams }) {
  const { id } = await params;

  return (
    <div>
      <DetailPage id={id} namespace="articles" basePath="/articles" />
    </div>
  );
}
