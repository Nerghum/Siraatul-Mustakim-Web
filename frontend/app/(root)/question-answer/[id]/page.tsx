import type { Metadata } from "next";
import EssentialMasail from "@/components/EssentialMasail/EssentialMasail";
import QaDetail from "@/components/qa/detail/QaDetail";
import { getQuestionDetail } from "@/data/mockQaDetail";

type PageParams = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const { id } = await params;
  const detail = await getQuestionDetail(id);

  if (!detail) {
    return { title: "Question Not Found" };
  }

  return {
    title: detail.title,
    description: detail.excerpt.slice(0, 160),
    openGraph: {
      title: detail.title,
      description: detail.excerpt.slice(0, 160),
      url: `/question-answer/${detail.id}`,
      type: "article",
    },
  };
}

export default async function QADetailPage({ params }: { params: PageParams }) {
  const { id } = await params;

  return (
    <div>
      {/* Detail data is a synchronous lookup — renders directly, no skeleton. */}
      <QaDetail id={id} />
      <EssentialMasail />
    </div>
  );
}
