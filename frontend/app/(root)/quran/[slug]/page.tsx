import { Suspense } from "react";
import { notFound } from "next/navigation";
import QuranReaderClient from "@/components/quran/QuranReaderClient";
import QuranReaderSkeleton from "@/components/quran/QuranReaderSkeleton";
import { getQuranSurah, getQuranSurahs } from "@/data/quran";

type PageParams = Promise<{ slug: string }>;

export default async function QuranSurahPage({ params }: { params: PageParams }) {
  const { slug } = await params;
  const [surah, surahs] = await Promise.all([getQuranSurah(slug), getQuranSurahs()]);
  if (!surah) notFound();

  return (
    <Suspense fallback={<QuranReaderSkeleton />}>
      <QuranReaderClient surah={surah} surahs={surahs} />
    </Suspense>
  );
}
