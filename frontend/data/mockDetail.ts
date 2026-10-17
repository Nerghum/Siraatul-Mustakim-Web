/**
 * Placeholder mock data for the masail/article detail pages.
 * Meta (title, author, date, views) is reused from the listing mocks so the
 * listing and the detail page never disagree; this file only adds what the
 * detail view needs on top. To be replaced by a real API endpoint.
 */

import { mockFetch } from "@/lib/mock-api";
import type { ContentBlockItem, DetailItem, Tag } from "@/types/detail";
import type { ListingItem, ListingNamespace } from "@/types/listing";
import { MOCK_ARTICLES } from "./mockArticles";
import { MOCK_BOOKS } from "./mockBooks";
import { MOCK_MALFUJAT_AUDIO, MOCK_MALFUJAT_TEXT } from "./mockMalfujat";
import { MOCK_MASAIL } from "./mockMasail";
import { MOCK_BAYANS } from "./mockRecentBayans";
import { MOCK_VIDEOS } from "./mockVideos";

const SOURCES: Record<ListingNamespace, ListingItem[]> = {
  masail: MOCK_MASAIL,
  articles: MOCK_ARTICLES,
  videos: MOCK_VIDEOS,
  bayan: MOCK_BAYANS,
  // Detail/reader page is a later phase; registered so the type stays exhaustive.
  books: MOCK_BOOKS,
  "malfujat-text": MOCK_MALFUJAT_TEXT,
  "malfujat-audio": MOCK_MALFUJAT_AUDIO,
};

const DEFAULT_TAGS: Tag[] = [
  { label: "জায়েয-নাজায়েয", variant: "primary" },
  { label: "বিবাহ-শাদী", variant: "dark" },
];

const DEFAULT_TOPICS: Tag[] = [
  { label: "হালাল-হারাম", variant: "muted" },
  { label: "ব্যবসা-বাণিজ্য", variant: "muted" },
];

const DEFAULT_BODY: ContentBlockItem[] = [
  { type: "bismillah", text: "বিসমিল্লাহির রহমানির রহীম" },
  {
    type: "paragraph",
    text: "ক্রয়-বিক্রয় সম্পন্ন হয়ে ক্রেতা পণ্য বুঝে নেওয়ার পর পণ্যের যাবতীয় ঝুঁকি ও দায়ভার ক্রেতার ওপর বর্তায়। তাই সেই পণ্য থেকে অর্জিত আয়ও ক্রেতারই থাকবে। পরবর্তী সময়ে কোনো ত্রুটির কারণে পণ্যটি বিক্রেতাকে ফেরত দিলেও মাঝখানের অর্জিত আয় ক্রেতার থাকবে। কেননা, ইসলামে আর্থিক লেনদেনের ক্ষেত্রে একটি মূলনীতি হলো, সম্পদের ঝুঁকি ও দায়ভার যার থাকে মুনাফা তার হক।",
  },
  { type: "paragraph", text: "আয়েশা রা. থেকে বর্ণিত," },
  {
    type: "arabic",
    text: "أَنَّ رَجُلًا ابْتَاعَ غُلَامًا فَأَقَامَ عِنْدَهُ مَا شَاءَ اللهُ أَنْ يُقِيمَ ثُمَّ وَجَدَ بِهِ عَيْبًا فَخَاصَمَهُ إِلَى النَّبِيِّ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ فَرَدَّهُ عَلَيْهِ فَقَالَ الرَّجُلُ: يَا رَسُولَ اللهِ قَدِ اسْتَغَلَّ غُلَامِي فَقَالَ رَسُولُ اللهِ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ: الْخَرَاجُ بِالضَّمَانِ",
  },
  {
    type: "translation",
    text: "অর্থ: এক ব্যক্তি একটি গোলাম (দাস) ক্রয় করল। এরপর গোলামটি তার কাছে বেশ কিছুদিন থাকার পর তার মাঝে (আগে থেকে বিদ্যমান) একটি খুঁত বা ত্রুটি দেখতে পেল। তখন বিষয়টি নিয়ে সে নবী সাল্লাল্লাহু আলাইহি ওয়াসাল্লামের কাছে মামলা পেশ করল। আর নবী সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম গোলামটিকে (বিক্রেতার কাছে) ফেরত দেওয়ার ফয়সালা দিলেন। তখন সে (বিক্রেতা) বলল, হে আল্লাহর রাসূল! সে তো আমার গোলামকে খাটিয়ে আয় করেছে! রাসূলুল্লাহ সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম বললেন, লাভ বা আয় তো লোকসান ও ঝুঁকি বহনের দায়িত্বের ভিত্তিতে।",
  },
  { type: "reference", text: "[ সুনানে আবূ দাউদ, ৩৫১০ ]" },
  {
    type: "paragraph",
    text: "প্রশ্নোক্ত ক্ষেত্রে মোটরসাইকেলটি ফেরত দেওয়ার আগ পর্যন্ত তা দিয়ে উপার্জিত আয়ের মালিক আপনি। কারণ, ফেরত দেওয়ার আগে তা কোনোভাবে ক্ষতিগ্রস্ত হলে তার দায়ভার আপনাকেই বহন করতে হতো।",
  },
  {
    type: "reference",
    text: "আরও দ্রষ্টব্য: মুসান্নাফে ইবনে আবী শাইবা, ৪/৩৭৩; আল-মাবসূত, সারখাসী, ১৩/১০৪; আল-মুদাওয়ানাহ, ৩/৩৫২; আল-ইসতেযকার, ৬/২৯০; রাদ্দুল মুহতার, ৫/১৮; ফয়যুল বারী, ৩/৪৫১।",
  },
];

function toDetail(item: ListingItem): DetailItem {
  return {
    ...item,
    body: DEFAULT_BODY,
    tags: DEFAULT_TAGS,
    topics: DEFAULT_TOPICS,
  };
}

/** Falls back to the first item so an unknown id still renders a full page. */
export function getDetail(namespace: ListingNamespace, id: string): DetailItem {
  const items = SOURCES[namespace];
  return toDetail(items.find((item) => item.id === id) ?? items[0]);
}

/** Everything except the current item, cycled to fill the grid. */
export function getRelated(namespace: ListingNamespace, id: string, limit = 6): ListingItem[] {
  const others = SOURCES[namespace].filter((item) => item.id !== id);
  if (others.length === 0) return [];

  return Array.from({ length: limit }, (_, i) => others[i % others.length]);
}

export type DetailPageData = {
  detail: DetailItem;
  related: ListingItem[];
};

/** Simulated detail endpoint — one round-trip for the item and its related. */
export async function fetchDetailPage(
  namespace: ListingNamespace,
  id: string,
): Promise<DetailPageData> {
  return mockFetch({
    detail: getDetail(namespace, id),
    related: getRelated(namespace, id),
  });
}
