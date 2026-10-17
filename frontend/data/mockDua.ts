import type { DuaItemProps } from "@/components/dua/DuaCard";
import { mockFetch } from "@/lib/mock-api";

export type DuaSubItem = {
  id: string;
  title: string;
  href: string;
};

export type DuaCategory = {
  id: string;
  title: string;
  items: DuaSubItem[];
};

export const MOCK_DUA_DATA: DuaCategory[] = [
  {
    id: "morningEvening",
    title: "সকাল-সন্ধ্যার দুআ",
    items: [
      { id: "me-1", title: "সকাল-সন্ধ্যায় পঠিত প্রধান দোয়া", href: "/dua/iman-1" },
      { id: "me-2", title: "শয়তান ও বিপদাপদ থেকে রক্ষার দোয়া", href: "/dua/iman-2" },
      { id: "me-3", title: "আল্লাহর সন্তুষ্টি লাভের দোয়া", href: "/dua/iman-3" },
      { id: "me-4", title: "সাইয়্যিদুল ইস্তিগফার", href: "/dua/iman-4" },
    ],
  },
  {
    id: "namaz",
    title: "নামাযের মধ্যে পঠিত দোয়া",
    items: [
      { id: "namaz-1", title: "নামায শুরুর সানা", href: "/dua/namaz-1" },
      { id: "namaz-2", title: "রুকু ও সেজদার তাসবীহ", href: "/dua/namaz-1" },
      { id: "namaz-3", title: "তাশাহহুদ ও দুরুদ শরীফ", href: "/dua/namaz-1" },
      { id: "namaz-4", title: "দোয়ায়ে মাসূরা ও কুনূতে নাযেলা", href: "/dua/namaz-1" },
    ],
  },
  {
    id: "sleep",
    title: "ঘুম ও জাগ্রত হওয়ার দোয়া",
    items: [
      { id: "sleep-1", title: "ঘুমানোর পূর্বে পঠিত দোয়া", href: "/dua/roza-1" },
      { id: "sleep-2", title: "ঘুম থেকে জাগ্রত হওয়ার দোয়া", href: "/dua/roza-1" },
      { id: "sleep-3", title: "দুঃস্বপ্ন দেখলে করণীয় ও দোয়া", href: "/dua/roza-1" },
    ],
  },
  {
    id: "travel",
    title: "সফর ও যানবাহনে আরোহণের দোয়া",
    items: [
      { id: "travel-1", title: "যানবাহনে আরোহণের দোয়া", href: "/dua/hajj-1" },
      { id: "travel-2", title: "সফরে রওয়ানা হওয়ার দোয়া", href: "/dua/hajj-1" },
      { id: "travel-3", title: "সফর থেকে ফিরে আসার দোয়া", href: "/dua/hajj-1" },
    ],
  },
];

export const MOCK_DUAS: DuaItemProps[] = [
  {
    id: "dua-1",
    title: "১. ঈমানের প্রতি ভালোবাসা ও এর প্রতিকার থেকে মুক্তি চাওয়া",
    arabicText:
      "اللَّهُمَّ حَبِّبْ إِلَيْنَا الإِيمَانَ وَزَيِّنْهُ فِي قُلُوبِنَا، وَكَرِّهْ إِلَيْنَا الْكُفْرَ وَالْفُسُوقَ وَالْعِصْيَانَ، وَاجْعَلْنَا مِنَ الرَّاشِدِينَ",
    pronunciation:
      "আল্লা-হুম্মা ইন্নী আস্আলুকা লায্‌যাতান্‌ নায্বরি ইলা ওয়াজহিকা, ওয়াশ্‌শাওকা ইলা লিকা-ইকা, ফী গায়রি যাররা-আ মুদ্বিররাতিন মুদ্বিল্লাতিন।",
    meaning:
      "হে আল্লাহ! আমাদের অন্তরে ঈমানের ভালোবাসা সঞ্চার করুন এবং আমাদের অন্তরে তা (ঈমান) আকর্ষণীয় করুন। ও অবাধ্যতাকে আমাদের অন্তরে ঘৃণ্য বানিয়ে দিন এবং আমাদেরকে সঠিক পথপ্রাপ্তদের অন্তর্ভুক্ত করুন।",
  },
  {
    id: "dua-2",
    title: "২. ঈমান কি?",
    arabicText: "الإيمان",
    pronunciation:
      "ঈমান একটি আরবী শব্দ। এর সাধারণ অর্থ হলো— বিশ্বাস করা। এছাড়াও আনুগত্য করা, অবনত হওয়া, নির্ভর করা অর্থে ঈমান শব্দটি ব্যবহৃত হয়।",
    meaning: "ঈমান অর্থ আন্তরিক বিশ্বাস, মৌখিক স্বীকৃতি এবং অঙ্গ-প্রত্যঙ্গের মাধ্যমে তা বাস্তবায়ন করা।",
  },
  {
    id: "dua-3",
    title: "৩. ঈমানের ওপর অবিচল থাকার দুআ",
    arabicText: "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ",
    pronunciation: "ইয়া মুকাল্লিবাল কুলূবি ছাব্বিত কালবী 'আলা দীনিক।",
    meaning: "হে অন্তরসমূহের পরিবর্তনকারী! আমার অন্তরকে আপনার দ্বীনের ওপর অবিচল রাখুন।",
  },
];

export async function getDuaCategoriesData(params?: {
  query?: string;
  category?: string | null;
}): Promise<DuaCategory[]> {
  const category = params?.category ?? null;
  const needle = (params?.query ?? "").trim().toLowerCase();

  let list = MOCK_DUA_DATA;
  if (category) {
    list = list.filter((c) => c.id === category);
  }
  if (needle) {
    list = list.filter(
      (c) =>
        c.title.toLowerCase().includes(needle) ||
        c.items.some((item) => item.title.toLowerCase().includes(needle)),
    );
  }
  return mockFetch(list);
}

export async function getDuaDetailList(): Promise<DuaItemProps[]> {
  return mockFetch(MOCK_DUAS);
}
