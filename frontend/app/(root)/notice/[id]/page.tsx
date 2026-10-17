import type { Metadata } from "next";
import NoticeDetail from "@/components/notice/NoticeDetail";
import { fetchNoticeById } from "@/lib/api/notice";

type PageParams = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const { id } = await params;
  try {
    const detail = await fetchNoticeById(id);
    if (detail?.title) {
      return {
        title: `${detail.title} | Notice`,
        description: detail.description?.slice(0, 160) || "Notice details",
      };
    }
  } catch {
    // fallback
  }

  return {
    title: "Notice Details",
  };
}

export default async function NoticeDetailPage({ params }: { params: PageParams }) {
  const { id } = await params;

  return (
    <div>
      <NoticeDetail id={id} />
    </div>
  );
}
