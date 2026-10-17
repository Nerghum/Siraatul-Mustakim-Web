/**
 * Placeholder mock data for the Q&A answer (detail) page.
 * Meta (title, author, date, views) is reused from `mockQuestions.ts` so the
 * listing and the detail page never disagree; this file only adds what the
 * detail view needs on top. To be replaced by a real API endpoint.
 */

import { mockFetch } from "@/lib/mock-api";
import type { ContentBlockItem, Tag } from "@/types/detail";
import { MOCK_QUESTIONS, type QuestionItem } from "./mockQuestions";

export type AnswerBlockItem = ContentBlockItem;

export type QuestionDetail = QuestionItem & {
  /** Full question text — the listing only shows a clamped excerpt. */
  question: string;
  /** Pills under the meta row. */
  tags: Tag[];
  /** Light grey pills at the end of the answer. */
  topics: Tag[];
  answer: AnswerBlockItem[];
  answeredBy: string;
};

const DEFAULT_ANSWER: AnswerBlockItem[] = [
  { type: "bismillah", text: "বিসমিল্লাহির রহমানির রহীম" },
  {
    type: "paragraph",
    text: "ক্রয়-বিক্রয় সম্পন্ন হয়ে ক্রেতা পণ্য বুঝে নেওয়ার পর পণ্যের যাবতীয় ঝুঁকি ও দায়ভার ক্রেতার ওপর বর্তায়। তাই সেই পণ্য থেকে অর্জিত আয় ক্রেতারই থাকবে। পরবর্তীতে সময়ে কোনো ত্রুটির কারণে পণ্যটি বিক্রেতাকে ফেরত দিলেও মাঝখানের অর্জিত আয় ক্রেতার থাকবে। কেননা, ইসলামে আর্থিক লেনদেনের ক্ষেত্রে একটি মূলনীতি হলো, সম্পদের ঝুঁকি ও দায়ভার যার থাকে মুনাফা তার হবে।",
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
  { type: "reference", text: "[সুনানে আবূ দাউদ, ৩৫০৮]" },
  {
    type: "paragraph",
    text: "প্রশ্নোক্ত ক্ষেত্রে মোটরসাইকেলটি ফেরত দেওয়ার আগ পর্যন্ত তা দিয়ে উপার্জিত আয়ের মালিক আপনি। কারণ, ফেরত দেওয়ার আগে তা কোনোভাবে ক্ষতিগ্রস্ত হলে তার দায়ভার আপনাকেই বহন করতে হতো।",
  },
  {
    type: "reference",
    text: "আরও দ্রষ্টব্য: মুসান্নাফে ইবনে আবী শাইবা, ৪/৩৭৩; আল-মাবসূত, সারাখসী, ১৩/১০৪; আল-মুদাওয়ানা, ৩/৩৩২; আল-ইসতেযকার, ৬/২৯০; রাদ্দুল মুহতার, ৭/১৮; ফয়যুল বারী, ৩/৪৫১।",
  },
];

/** Answers are identical placeholders for now — the shape is what matters. */
function buildDetail(item: QuestionItem): QuestionDetail {
  return {
    ...item,
    question: item.excerpt,
    tags: [
      { label: "জায়েয-নাজায়েয", variant: "primary" },
      { label: "বিবাহ-শাদী", variant: "dark" },
    ],
    topics: [
      { label: "হালাল-হারাম", variant: "muted" },
      { label: "ব্যবসা-বাণিজ্য", variant: "muted" },
    ],
    answer: DEFAULT_ANSWER,
    answeredBy: "মুহাম্মাদ খাইরুল ইসলাম",
  };
}

export async function getQuestionDetail(id: string): Promise<QuestionDetail | null> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";
  try {
    const res = await fetch(`${API_BASE}/api/faq/${id}`);
    if (!res.ok) return null;
    const faq = await res.json();
    return {
      id: faq._id,
      title: (faq.question?.question || "").substring(0, 60) + "...",
      questionNo: faq.serialNumber || faq._id.substring(faq._id.length - 4),
      excerpt: faq.question?.question || "",
      author: faq.question?.author || "অজানা",
      date: faq.createdAt,
      views: 0,
      category: faq.answer?.category || "অন্যান্য",
      question: faq.question?.question || "",
      tags: [],
      topics: [{ label: faq.answer?.category || "অন্যান্য", variant: "primary" }],
      answer: faq.answer?.answer ? [{ type: "html" as const, text: faq.answer.answer }] : [{ type: "paragraph" as const, text: "এখনও এই প্রশ্নের উত্তর দেওয়া হয় নি।" }],
      answeredBy: faq.answer?.author || "সিরাতুল মুস্তাকিম",
    };
  } catch (error) {
    console.error("Failed to fetch QA detail", error);
    return null;
  }
}

/** "প্রাসঙ্গিক প্রশ্নোত্তর" — everything except the question being read. */
export function getRelatedQuestions(id: string, limit = 6): QuestionItem[] {
  const others = MOCK_QUESTIONS.filter((q) => q.id !== id);
  const result: QuestionItem[] = [];
  while (result.length < limit && others.length > 0) {
    result.push(others[result.length % others.length]);
  }
  return result.slice(0, limit);
}

export type QaDetailPageData = {
  detail: QuestionDetail;
  related: QuestionItem[];
};

export async function fetchQuestionPage(id: string): Promise<QaDetailPageData | null> {
  const detail = await getQuestionDetail(id);
  if (!detail) return null;
  
  // You can fetch related questions from the API here if an endpoint exists.
  // For now, we return empty related items or fetch a general list.
  return {
    detail,
    related: [],
  };
}
