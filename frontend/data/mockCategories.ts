/**
 * Placeholder mock data for the category sidebar, shared by /qa and /masail.
 * To be replaced by a real API endpoint in the future.
 */

import type { StaticImageData } from "next/image";
import iconIman from "@/assets/Icons/1.png";
import iconNamaz from "@/assets/Icons/2.png";
import iconRoza from "@/assets/Icons/3.png";
import iconHajj from "@/assets/Icons/4.png";
import iconMuamalat from "@/assets/Icons/5.png";
import iconZakat from "@/assets/Icons/6.png";
import iconMuasharat from "@/assets/Icons/7.png";
import iconAkhlaq from "@/assets/Icons/8.png";
import iconDawatTabligh from "@/assets/Icons/9.png";
import iconTaskiyah from "@/assets/Icons/10.png";
import iconAqida from "@/assets/Icons/11.png";
import iconBiye from "@/assets/Icons/12.png";
import { mockFetch } from "@/lib/mock-api";
import { fetchMasailCategories } from "@/lib/api/masail";

export type Category = {
  id: string;
  /** Also the `?category=` query value. */
  slug: string;
  /** Translation key under `listing.categories.*`. */
  translationKey: string;
  count: number;
  name?: string;
};

export const MOCK_CATEGORIES: Category[] = [
  { id: "cat-1", slug: "iman", translationKey: "iman", count: 25 },
  { id: "cat-2", slug: "namaz", translationKey: "namaz", count: 66 },
  { id: "cat-3", slug: "roza", translationKey: "roza", count: 28 },
  { id: "cat-4", slug: "hajj", translationKey: "hajj", count: 18 },
  { id: "cat-5", slug: "zakat", translationKey: "zakat", count: 20 },
  { id: "cat-6", slug: "muamalat", translationKey: "muamalat", count: 32 },
  { id: "cat-7", slug: "muasharat", translationKey: "muasharat", count: 24 },
  { id: "cat-8", slug: "akhlaq", translationKey: "akhlaq", count: 19 },
  { id: "cat-9", slug: "dawat-tabligh", translationKey: "dawatTabligh", count: 15 },
  { id: "cat-10", slug: "islah", translationKey: "islah", count: 14 },
  { id: "cat-11", slug: "aqida", translationKey: "aqida", count: 22 },
  { id: "cat-12", slug: "biye", translationKey: "biye", count: 30 },
];

/** A single tile in the home page's category grid. */
export type HomeCategory = {
  id: string;
  /** Translation key under `home.categories.*`. */
  translationKey: string;
  href: string;
  image: StaticImageData | string;
  name?: string;
};

export const MOCK_HOME_CATEGORIES: HomeCategory[] = [
  {
    id: "iman",
    translationKey: "iman",
    href: "/masail?category=iman",
    image: iconIman,
  },
  {
    id: "namaz",
    translationKey: "namaz",
    href: "/masail?category=namaz",
    image: iconNamaz,
  },
  {
    id: "roza",
    translationKey: "roza",
    href: "/masail?category=roza",
    image: iconRoza,
  },
  {
    id: "hajj",
    translationKey: "hajj",
    href: "/masail?category=hajj",
    image: iconHajj,
  },
  {
    id: "zakat",
    translationKey: "zakat",
    href: "/masail?category=zakat",
    image: iconZakat,
  },
  {
    id: "muamalat",
    translationKey: "muamalat",
    href: "/masail?category=muamalat",
    image: iconMuamalat,
  },
  {
    id: "muasharat",
    translationKey: "muasharat",
    href: "/masail?category=muasharat",
    image: iconMuasharat,
  },
  {
    id: "akhlaq",
    translationKey: "akhlaq",
    href: "/masail?category=akhlaq",
    image: iconAkhlaq,
  },
  {
    id: "dawat-tabligh",
    translationKey: "dawatTabligh",
    href: "/masail?category=dawat-tabligh",
    image: iconDawatTabligh,
  },
  {
    id: "islah",
    translationKey: "islah",
    href: "/masail?category=islah",
    image: iconTaskiyah,
  },
  {
    id: "aqida",
    translationKey: "aqida",
    href: "/masail?category=aqida",
    image: iconAqida,
  },
  {
    id: "biye",
    translationKey: "biye",
    href: "/masail?category=biye",
    image: iconBiye,
  },
];

/** Simulated home-categories endpoint — drives the grid's loading state. */
export async function getHomeCategories(): Promise<HomeCategory[]> {
  try {
    const categories = await fetchMasailCategories();
    return categories.map((cat) => {
      const fallback = MOCK_HOME_CATEGORIES.find((m) => m.id === cat.slug || m.translationKey === cat.slug);
      return {
        id: cat.id || cat.slug,
        translationKey: fallback?.translationKey || cat.slug,
        href: `/masail?category=${cat.slug}`,
        image: fallback?.image || iconIman,
        name: (cat as any).name,
      };
    });
  } catch (err) {
    console.error("Failed to fetch masail categories", err);
    return mockFetch(MOCK_HOME_CATEGORIES);
  }
}

export const MOCK_BOOK_CATEGORIES: Category[] = [
  { id: "bc-1", slug: "quran", translationKey: "quran", count: 12 },
  { id: "bc-2", slug: "hadith", translationKey: "hadith", count: 45 },
  { id: "bc-3", slug: "fiqh", translationKey: "fiqh", count: 30 },
  { id: "bc-4", slug: "seerah", translationKey: "seerah", count: 18 },
  { id: "bc-5", slug: "tasawwuf", translationKey: "tasawwuf", count: 25 },
];

export const MOCK_VIDEO_CATEGORIES: Category[] = [
  { id: "vc-1", slug: "waz", translationKey: "waz", count: 120 },
  { id: "vc-2", slug: "jumah", translationKey: "jumah", count: 45 },
  { id: "vc-3", slug: "dars", translationKey: "dars", count: 80 },
  { id: "vc-4", slug: "shortClip", translationKey: "shortClip", count: 250 },
];

export const MOCK_ARTICLE_CATEGORIES: Category[] = [
  { id: "ac-1", slug: "samakal", translationKey: "samakal", count: 15 },
  { id: "ac-2", slug: "jiboni", translationKey: "jiboni", count: 22 },
  { id: "ac-3", slug: "dawati", translationKey: "dawati", count: 34 },
  { id: "ac-4", slug: "fikri", translationKey: "fikri", count: 10 },
];

export const MOCK_DUA_CATEGORIES: Category[] = [
  { id: "dc-1", slug: "morningEvening", translationKey: "morningEvening", count: 25 },
  { id: "dc-2", slug: "namaz", translationKey: "namaz", count: 15 },
  { id: "dc-3", slug: "sleep", translationKey: "sleep", count: 8 },
  { id: "dc-4", slug: "travel", translationKey: "travel", count: 5 },
];

export const MOCK_MALFUJAT_CATEGORIES: Category[] = [
  { id: "mc-1", slug: "nasihat", translationKey: "nasihat", count: 42 },
  { id: "mc-2", slug: "story", translationKey: "story", count: 18 },
  { id: "mc-3", slug: "warning", translationKey: "warning", count: 12 },
];

export const MOCK_QA_CATEGORIES: Category[] = [
  { id: "qc-1", slug: "aqida", translationKey: "aqida", count: 100 },
  { id: "qc-2", slug: "ibadat", translationKey: "ibadat", count: 250 },
  { id: "qc-3", slug: "muamalat", translationKey: "muamalat", count: 80 },
  { id: "qc-4", slug: "poribar", translationKey: "poribar", count: 120 },
];

export const MOCK_BAYAN_CATEGORIES: Category[] = [
  { id: "bc-1", slug: "nasihat", translationKey: "nasihat", count: 42 },
  { id: "bc-2", slug: "story", translationKey: "story", count: 18 },
  { id: "bc-3", slug: "warning", translationKey: "warning", count: 12 },
];
