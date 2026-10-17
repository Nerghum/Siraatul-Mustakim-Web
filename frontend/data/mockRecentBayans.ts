/**
 * Placeholder mock data for Recent Bayans section.
 * To be replaced by a real API endpoint in the future.
 */

import { mockFetch } from "@/lib/mock-api";

export type Bayan = {
  id: string;
  title: string;
  speaker: string;
  location: string;
  date: string;
  durationSec: number;
  audioUrl: string;
};

function getPastDateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Sample audio URLs for demonstration/mock play
const SAMPLE_AUDIO_URLS = ["", "", "", ""];

export const MOCK_RECENT_BAYANS: Bayan[] = [
  {
    id: "bayan-1",
    title: "তাকওয়ার গুরুত্ব ও ফজিলত",
    speaker: "মুফতি জাফর আহমেদ",
    location: "ময়মনসিংহ",
    date: getPastDateStr(2),
    durationSec: 2712,
    audioUrl: SAMPLE_AUDIO_URLS[0],
  },
  {
    id: "bayan-2",
    title: "ঈমানের হাকীকত ও আলামত",
    speaker: "মুফতি জাফর আহমেদ",
    location: "রাজশাহী",
    date: getPastDateStr(5),
    durationSec: 1945,
    audioUrl: SAMPLE_AUDIO_URLS[1],
  },
  {
    id: "bayan-3",
    title: "নামাযের গুরুত্ব ও সঠিক পদ্ধতি",
    speaker: "মুফতি জাফর আহমেদ",
    location: "শরীয়তপুর",
    date: getPastDateStr(8),
    durationSec: 3120,
    audioUrl: SAMPLE_AUDIO_URLS[2],
  },
  {
    id: "bayan-4",
    title: "রিজিকের বরকত লাভের উপায়",
    speaker: "মুফতি জাফর আহমেদ",
    location: "ফরিদপুর",
    date: getPastDateStr(12),
    durationSec: 2140,
    audioUrl: SAMPLE_AUDIO_URLS[3],
  },
  {
    id: "bayan-5",
    title: "আখলাক ও চরিত্র গঠনের গুরুত্ব",
    speaker: "মুফতি জাফর আহমেদ",
    location: "ঢাকা",
    date: getPastDateStr(15),
    durationSec: 2580,
    audioUrl: SAMPLE_AUDIO_URLS[0],
  },
  {
    id: "bayan-6",
    title: "দাওয়াত ও তাবলীগের মেহনত",
    speaker: "মুফতি জাফর আহমেদ",
    location: "চট্টগ্রাম",
    date: getPastDateStr(20),
    durationSec: 3450,
    audioUrl: SAMPLE_AUDIO_URLS[1],
  },
  {
    id: "bayan-7",
    title: "খাঁটি তাওবার ফযীলত ও নিয়ম",
    speaker: "মুফতি জাফর আহমেদ",
    location: "সিলেট",
    date: getPastDateStr(25),
    durationSec: 1890,
    audioUrl: SAMPLE_AUDIO_URLS[2],
  },
  {
    id: "bayan-8",
    title: "মৃত্যুর প্রস্তুতি ও আখেরাত ভাবনা",
    speaker: "মুফতি জাফর আহমেদ",
    location: "কুমিল্লা",
    date: getPastDateStr(30),
    durationSec: 2980,
    audioUrl: SAMPLE_AUDIO_URLS[3],
  },
  {
    id: "bayan-9",
    title: "বিপদে সবরের মাহাত্ম্য ও মর্যাদা",
    speaker: "মুফতি জাফর আহমেদ",
    location: "খুলনা",
    date: getPastDateStr(35),
    durationSec: 2210,
    audioUrl: SAMPLE_AUDIO_URLS[0],
  },
  {
    id: "bayan-10",
    title: "ইলম অর্জনের গুরুত্ব ও আদব",
    speaker: "মুফতি জাফর আহমেদ",
    location: "বরিশাল",
    date: getPastDateStr(42),
    durationSec: 3340,
    audioUrl: SAMPLE_AUDIO_URLS[1],
  },
  {
    id: "bayan-11",
    title: "জিকির ও দোয়ার ফজিলত",
    speaker: "মুফতি জাফর আহমেদ",
    location: "রংপুর",
    date: getPastDateStr(50),
    durationSec: 1750,
    audioUrl: SAMPLE_AUDIO_URLS[2],
  },
  {
    id: "bayan-12",
    title: "পরিবারের শরয়ী দায়িত্ব ও কর্তব্য",
    speaker: "মুফতি জাফর আহমেদ",
    location: "নারায়ণগঞ্জ",
    date: getPastDateStr(58),
    durationSec: 2630,
    audioUrl: SAMPLE_AUDIO_URLS[3],
  },
];

/** Simulated recent-bayans endpoint — drives the list's loading state. */
export async function getRecentBayans(): Promise<Bayan[]> {
  return mockFetch(MOCK_RECENT_BAYANS);
}

export const MOCK_BAYANS = MOCK_RECENT_BAYANS.map((b, i) => ({
  id: b.id,
  title: b.title,
  excerpt: "",
  author: b.speaker,
  date: b.date,
  views: 1200 + i * 150,
  category: ["nasihat", "story", "warning"][i % 3],
  location: b.location,
  audioUrl: b.audioUrl,
  durationSec: b.durationSec,
}));

export const MOCK_BAYANS_TOTAL_PAGES = 3;
