/**
 * Placeholder mock data for the kitab (books) listing.
 * Books reuse the ListingItem shape; the book card only shows title + author +
 * cover, so excerpt/date/views are filled but unused on the card. To be
 * replaced by a real API endpoint in the future.
 */

import type { ListingItem } from "@/types/listing";

export type BookItem = ListingItem;

export const MOCK_BOOKS: BookItem[] = [
  {
    id: "1",
    title: "কুরআন বুঝার সহজ উপায়",
    excerpt: "কুরআনে কারীমের সহজ ব্যাখ্যা ও অনুধাবনের মৌলিক নিয়মাবলী।",
    author: "মুফতী মনসূরুল হক সাহেব",
    date: "2026-05-02",
    views: 863480,
    category: "quran",
  },
  {
    id: "2",
    title: "সহীহ হাদিসের আলোকে জীবন গঠন",
    excerpt: "দৈনন্দিন জীবনে প্রিয় নবীজির সুন্নাত ও হাদিসের ব্যবহারিক প্রয়োগ।",
    author: "মুফতী মনসূরুল হক সাহেব",
    date: "2026-04-18",
    views: 512309,
    category: "hadith",
  },
  {
    id: "3",
    title: "নফসের বিরুদ্ধে লড়াই ও আত্মশুদ্ধি",
    excerpt: "তাসাওউফ ও আত্মশুদ্ধির পথ ও পন্থা নিয়ে বিস্তারিত আলোচনা।",
    author: "মুফতী মনসূরুল হক সাহেব",
    date: "2026-03-10",
    views: 341275,
    category: "tasawwuf",
  },
  {
    id: "4",
    title: "দৈনন্দিন জীবনের জরুরি ফিকহি মাসায়েল",
    excerpt: "ইবাদত ও লেনদেন সংক্রান্ত ফিকহের প্রয়োজনীয় সমাধান।",
    author: "মুফতী মনসূরুল হক সাহেব",
    date: "2026-02-21",
    views: 287640,
    category: "fiqh",
  },
  {
    id: "5",
    title: "সীরাতে রাসূল সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম",
    excerpt: "রাসূলুল্লাহ সাল্লাল্লাহু আলাইহি ওয়াসাল্লামের পবিত্র জীবনী ও শিক্ষণীয় ঘটনাবলির সংকলন।",
    author: "মুফতী মনসূরুল হক সাহেব",
    date: "2026-01-30",
    views: 198432,
    category: "seerah",
  },
  {
    id: "6",
    title: "হাদিসে কুদসীর নির্বাচিত শিক্ষা",
    excerpt: "হাদিসে কুদসী থেকে গুরুত্বপূর্ণ আধ্যাত্মিক দিকনির্দেশনা।",
    author: "মুফতী মনসূরুল হক সাহেব",
    date: "2026-01-12",
    views: 154908,
    category: "hadith",
  },
];

/** Mock total — the real endpoint will return this alongside the page slice. */
export const MOCK_BOOKS_TOTAL_PAGES = 148;
