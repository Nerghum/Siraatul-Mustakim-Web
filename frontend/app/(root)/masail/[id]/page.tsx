import type { Metadata } from "next";

import DetailPage from "@/components/shared/detail/DetailPage";
import { fetchMasailById } from "@/lib/api/masail";

type PageParams = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const { id } = await params;
  try {
    const masail = await fetchMasailById(id);
    const description = masail.description.slice(0, 160);
    return {
      title: masail.title,
      description,
      openGraph: {
        title: masail.title,
        description,
        url: `/masail/${id}`,
        type: "article",
      },
    };
  } catch {
    return { title: "মাসায়েল", description: "" };
  }
}

export default async function MasailDetailPage({ params }: { params: PageParams }) {
  const { id } = await params;

  return (
    <div>
      {/* Detail data fetched client-side in DetailPage — no skeleton needed here. */}
      <DetailPage id={id} namespace="masail" basePath="/masail" />
    </div>
  );
}

