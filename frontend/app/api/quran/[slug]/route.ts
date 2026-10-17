import { getQuranSurah } from "@/data/quran";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const surah = await getQuranSurah(slug);
  if (!surah) return Response.json({ error: "Surah not found" }, { status: 404 });
  return Response.json(surah, {
    headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
  });
}
