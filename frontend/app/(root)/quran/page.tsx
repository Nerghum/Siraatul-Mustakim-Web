import QuranListingClient from "@/components/quran/QuranListingClient";
import { getQuranSurahs } from "@/data/quran";

export default async function QuranPage() {
  const surahs = await getQuranSurahs();
  return <QuranListingClient surahs={surahs} />;
}
