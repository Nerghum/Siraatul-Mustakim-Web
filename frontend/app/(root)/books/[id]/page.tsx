import type { Metadata } from "next";
import { Suspense } from "react";

import BookDetailClient from "@/components/books/detail/BookDetailClient";
import { fetchKitabById } from "@/lib/api/kitab";
import styles from "@/styles/books.module.css";

type PageParams = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const { id } = await params;
  try {
    const kitab = await fetchKitabById(id);
    const description = kitab.content?.slice(0, 160) ?? kitab.title;
    return {
      title: kitab.title,
      description,
      openGraph: {
        title: kitab.title,
        description,
        url: `/books/${id}`,
        type: "article",
      },
    };
  } catch {
    return { title: "কিতাব", description: "" };
  }
}

export default async function BooksDetailPage({ params }: { params: PageParams }) {
  const { id } = await params;

  return (
    <div>
      {/* BookDetailClient reads useSearchParams (?pageId) — needs a Suspense
          boundary. It renders its own skeletons, so the fallback is minimal. */}
      <Suspense fallback={null}>
        <BookDetailClient id={id} />
      </Suspense>
    </div>
  );
}

