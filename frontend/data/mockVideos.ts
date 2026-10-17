/**
 * Placeholder mock data for the videos listing.
 * Videos use the VideoItem shape. To be replaced by a real API endpoint in the future.
 */

import type { VideoItem } from "@/types/listing";

const REAL_YOUTUBE_IDS = [
  "rPmpM-IPgoc",
  "JnvWYDDxFuA",
  "pSv5_PId5os",
  "MAehDph-lww",
  "mfGdivefj28",
  "VLnMuKy7z5A",
];

const BASE_VIDEOS: Omit<VideoItem, "id" | "youtubeId">[] = [
  {
    title: "ঈমান ও আক্বিদা বিষয়ক গুরুত্বপূর্ণ বয়ান",
    excerpt: "ঈমানের হাকীকত ও তাওহীদ নিয়ে আলোচনা",
    author: "মুফতি জাফর আহমাদ",
    date: "2026-05-10",
    views: 12500,
    category: "waz",
  },
  {
    title: "পারিবারিক জীবনের আদর্শ ও জুমার খুতবা",
    excerpt: "ইসলামী আদর্শে পরিবার গঠন ও জুমার বয়ান",
    author: "মুফতি জাফর আহমাদ",
    date: "2026-05-12",
    views: 9800,
    category: "jumah",
  },
  {
    title: "সহিহ হাদিসের ধারাবাহিক দারস",
    excerpt: "হাদিসের ব্যাখ্যা ও ফিকহি বিশ্লেষণ",
    author: "মুফতি জাফর আহমাদ",
    date: "2026-05-15",
    views: 15400,
    category: "dars",
  },
  {
    title: "১ মিনিটে জরুরি মাসায়েল ও আমল",
    excerpt: "দৈনন্দিন জীবনের সংক্ষিপ্ত দিকনির্দেশনা",
    author: "মুফতি জাফর আহমাদ",
    date: "2026-05-18",
    views: 11200,
    category: "shortClip",
  },
  {
    title: "যাকাতের হিসাব ও বিধান সংক্রান্ত বয়ান",
    excerpt: "সঠিকভাবে যাকাত আদায়ের নিয়ম ও তাৎপর্য",
    author: "মুফতি জাফর আহমাদ",
    date: "2026-05-20",
    views: 18900,
    category: "waz",
  },
  {
    title: "জুমার নামাজের ফজিলত ও আদব",
    excerpt: "জুমার দিনের গুরুত্বপূর্ণ শিক্ষা ও আমল",
    author: "মুফতি জাফর আহমাদ",
    date: "2026-05-22",
    views: 22000,
    category: "jumah",
  },
];

export const MOCK_VIDEOS: VideoItem[] = Array.from({ length: 12 }).map((_, index) => {
  const baseIndex = index % 6;
  return {
    ...BASE_VIDEOS[baseIndex],
    id: String(index + 1),
    youtubeId: REAL_YOUTUBE_IDS[baseIndex],
  };
});

/** Mock total — the real endpoint will return this alongside the page slice. */
export const MOCK_VIDEOS_TOTAL_PAGES = 10;
