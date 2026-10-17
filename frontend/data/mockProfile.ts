/**
 * Placeholder mock data for the signed-in profile area (my-questions,
 * answer-queue, author article/masail lists, bookmarks, answer panel).
 * To be replaced by real API endpoints later — the component/hook/skeleton
 * shapes stay the same. See `lib/mock-api.ts`.
 */

import { type ArticleItem, MOCK_ARTICLES } from "@/data/mockArticles";
import { type MasailItem, MOCK_MASAIL } from "@/data/mockMasail";
import { MOCK_QUESTIONS, type QuestionItem } from "@/data/mockQuestions";
import { mockFetch } from "@/lib/mock-api";

/** Page count shown in the pagination strip of the mockups. */
export const PROFILE_TOTAL_PAGES = 148;

export type QuestionStatus = "answered" | "waiting";

export type ProfileQuestion = QuestionItem & {
  status: QuestionStatus;
  /** ISO timestamp for the relative "৩ দিন আগে" line — answered items only. */
  answeredAt?: string;
};

export type PublishStatus = "published" | "draft";

export type AuthorItem = (ArticleItem | MasailItem) & {
  status: PublishStatus;
  /** Category slugs rendered as chips on the card. */
  tags: string[];
};

type Paginated<T> = { items: T[]; totalPages: number };

const THREE_DAYS_AGO = new Date(Date.now() - 3 * 86400 * 1000).toISOString();

/** Cycle the base list into `count` items with rotating ids. */
function take<T, R>(source: T[], count: number, map: (item: T, i: number) => R): R[] {
  return Array.from({ length: count }, (_, i) => map(source[i % source.length], i));
}

// ── My questions (regular user: answered / waiting) ──────────────────────────
export async function getMyQuestions(params: {
  status: QuestionStatus;
  page?: number;
  author?: string;
  phone?: string;
}): Promise<Paginated<ProfileQuestion>> {
  if (!params.author && !params.phone) return { items: [], totalPages: 1 };
  
  const queryParams = new URLSearchParams();
  if (params.author) queryParams.set("author", params.author);
  if (params.phone) queryParams.set("phone", params.phone);
  queryParams.set("status", params.status === "waiting" ? "pending" : params.status);
  
  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";
  
  try {
    const res = await fetch(`${API_BASE}/api/faq?${queryParams.toString()}`);
    const data = await res.json();
    
    const faqsArray = Array.isArray(data) ? data : (data.faqs || []);

    if (!faqsArray.length) {
      return { items: [], totalPages: 1 };
    }

    const items = faqsArray.map((faq: any) => ({
      id: faq._id,
      title: (faq.question?.question || "").substring(0, 60) + "...",
      questionNo: faq.serialNumber || faq._id.substring(faq._id.length - 4),
      excerpt: faq.question?.question || "",
      author: faq.question?.author || "অজানা",
      date: faq.createdAt,
      views: 0,
      category: faq.answer?.category || "অন্যান্য",
      status: params.status,
      answeredAt: faq.answer?.timestamp || faq.updatedAt,
    }));

    const page = params.page || 1;
    const limit = 10;
    const startIndex = (page - 1) * limit;
    const paginatedItems = items.slice(startIndex, startIndex + limit);
    const totalPages = Math.ceil(items.length / limit) || 1;

    return { items: paginatedItems, totalPages };
  } catch (err) {
    console.error(err);
    return { items: [], totalPages: 1 };
  }
}

// ── Answer queue (author inbox: answered / waiting) ──────────────────────────
export async function getAnswerQueue(params: {
  status: QuestionStatus;
  page?: number;
  author?: string;
}): Promise<Paginated<ProfileQuestion>> {
  // If we only want questions this specific author answered, or we want all pending questions.
  // The backend might not support filtering by answering author yet. For now, fetch all waiting or answered.
  const queryParams = new URLSearchParams();
  queryParams.set("status", params.status === "waiting" ? "pending" : params.status);
  
  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";
  
  try {
    const res = await fetch(`${API_BASE}/api/faq?${queryParams.toString()}`);
    const data = await res.json();
    
    const faqsArray = Array.isArray(data) ? data : (data.faqs || []);

    if (!faqsArray.length) {
      return { items: [], totalPages: 1 };
    }

    const items = faqsArray.map((faq: any) => ({
      id: faq._id,
      title: (faq.question?.question || "").substring(0, 60) + "...",
      questionNo: faq.serialNumber || faq._id.substring(faq._id.length - 4),
      excerpt: faq.question?.question || "",
      author: faq.question?.author || "অজানা",
      date: faq.createdAt,
      views: 0,
      category: faq.answer?.category || "অন্যান্য",
      status: params.status,
      answeredAt: faq.answer?.timestamp || faq.updatedAt,
    }));

    const page = params.page || 1;
    const limit = 10;
    const startIndex = (page - 1) * limit;
    const paginatedItems = items.slice(startIndex, startIndex + limit);
    const totalPages = Math.ceil(items.length / limit) || 1;

    return { items: paginatedItems, totalPages };
  } catch (err) {
    console.error(err);
    return { items: [], totalPages: 1 };
  }
}

/** Single question shown at the top of the answer panel. */
export async function getAnswerQuestion(id: string): Promise<QuestionItem> {
  const base = MOCK_QUESTIONS[0];
  return mockFetch({ ...base, id, questionNo: 11211 });
}

// ── Author content lists (articles / masail, published / draft) ──────────────
const AUTHOR_TAGS = [["aqida", "namaz"], ["aqida"], ["aqida"]];

function toAuthorItems<T extends ArticleItem | MasailItem>(
  source: T[],
  status: PublishStatus,
  prefix: string,
): AuthorItem[] {
  return take(source, 3, (item, i) => ({
    ...item,
    id: `${item.id}-${prefix}-${i}`,
    status,
    tags: AUTHOR_TAGS[i % AUTHOR_TAGS.length],
  })) as unknown as AuthorItem[];
}

export async function getAuthorArticles(params: {
  status: PublishStatus;
  page?: number;
}): Promise<Paginated<AuthorItem>> {
  return mockFetch({
    items: toAuthorItems(MOCK_ARTICLES, params.status, "art"),
    totalPages: PROFILE_TOTAL_PAGES,
  });
}

export async function getAuthorMasail(params: {
  status: PublishStatus;
  page?: number;
}): Promise<Paginated<AuthorItem>> {
  return mockFetch({
    items: toAuthorItems(MOCK_MASAIL, params.status, "msl"),
    totalPages: PROFILE_TOTAL_PAGES,
  });
}

// ── Bookmarks (masail / article tabs) ────────────────────────────────────────
export type BookmarkTab = "masail" | "article";

export async function getBookmarks(params: {
  tab: BookmarkTab;
}): Promise<{ items: (MasailItem | ArticleItem)[] }> {
  const source = params.tab === "masail" ? MOCK_MASAIL : MOCK_ARTICLES;
  const items = take(source, 2, (item, i) => ({ ...item, id: `${item.id}-bm-${i}` }));
  return mockFetch({ items });
}
