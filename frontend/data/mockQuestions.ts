/**
 * Placeholder mock data for the Q&A listing.
 * To be replaced by a real API endpoint in the future.
 */

import { mockFetch } from "@/lib/mock-api";

export type QuestionItem = {
  id: string;
  title: string;
  /** Public question number shown under the title ("প্রশ্নঃ 2779"). */
  questionNo: number | string;
  excerpt: string;
  author: string;
  /** ISO date — formatted per locale at render time. */
  date: string;
  views: number;
  /** Matches a `slug` in `data/mockCategories.ts`. */
  category: string;
};

export const MOCK_QUESTIONS: QuestionItem[] = [
  {
    id: "1",
    title: "ত্রুটিযুক্ত মোটরসাইকেল ফেরত দেওয়ার পূর্বে অর্জিত আয়ের হুকুম",
    questionNo: 2779,
    excerpt:
      "আমি এক মাস আগে এক ব্যক্তির কাছ থেকে কাগজপত্রসহ একটি মোটরসাইকেল ক্রয় করি। এরপর সেটি ভাড়ায় চালিয়ে কিছু অর্থও উপার্জন করি। পরে জানতে পারি, মোটরসাইকেলটির কাগজসমূহ আসল নয়। তখন আমি মালিকের সাথে কথা বলে তার মোটরসাইকেল ফেরত দিয়ে আমার টাকা ফেরত নিয়ে আসি। এখন জানার বিষয় হলো আমি যে, মাঝখানে উক্ত মোটরসাইকেল দিয়ে কিছু টাকা উপার্জন করেছি তা কি আমি রাখতে পারব, নাকি বিক্রেতাকে ফেরত দিতে হবে?",
    author: "সিরাতুল মুস্তাকিম",
    date: "2026-07-06",
    views: 863480,
    category: "muamalat",
  },
  {
    id: "2",
    title: "নখ বড় করে রাখলে অথবা ফ্যাশনের জন্য কৃত্রিম নখ লাগালে ওযু হবে কি?",
    questionNo: 2778,
    excerpt:
      "মুহতারাম, বর্তমানে অনেক নারী-পুরুষ শখ করে কিংবা ফ্যাশন হিসেবে হাতের নখ অনেক বড় রাখেন। বিশেষ করে নারীদের মাঝে দীর্ঘ নখ রাখা ও তার উপর কৃত্রিম নখ লাগানোর প্রচলন বেড়েছে। জানার বিষয় হলো, এভাবে নখ বড় রাখলে বা কৃত্রিম নখ লাগিয়ে ওযু করলে ওযু সহীহ হবে কি না এবং শরীয়তে এ বিষয়ে নির্দেশনা কী?",
    author: "সিরাতুল মুস্তাকিম",
    date: "2026-06-28",
    views: 512309,
    category: "ibadat",
  },
  {
    id: "3",
    title: "তাকদীরে বিশ্বাস ও মানুষের ইচ্ছাশক্তির সঠিক শরয়ী ব্যাখ্যা কী?",
    questionNo: 2777,
    excerpt:
      "ইসলামের মৌলিক আকীদার একটি গুরুত্বপূর্ণ অংশ হলো তাকদীরের উপর ঈমান আনা। কিন্তু অনেকেই বিভ্রান্তিতে ভোগেন যে সবকিছু যদি পূর্বনির্ধারিত হয় তবে মানুষের চেষ্টা ও আমলের ভূমিকা কী? এই বিষয়ে কুরআন ও সহীহ সুন্নাহর আলোকে আহলুস সুন্নাহ ওয়াল জামাআতের বিশুদ্ধ আকিদা বিস্তারিত জানতে চাই।",
    author: "সিরাতুল মুস্তাকিম",
    date: "2026-06-15",
    views: 341275,
    category: "aqida",
  },
  {
    id: "4",
    title: "ব্যবসায়ী পণ্য ও সঞ্চিত অর্থের যাকাত হিসাব করার সঠিক পদ্ধতি",
    questionNo: 2776,
    excerpt:
      "আমার একটি ছোট দোকান আছে, দোকানে সবসময় কিছু পণ্য মজুদ থাকে এবং ব্যাংকে কিছু নগদ অর্থও জমা আছে। এছাড়া স্ত্রীর কিছু স্বর্ণালংকার রয়েছে। জানার বিষয় হলো, বছর শেষে যাকাত হিসাব করার সময় পণ্যের ক্রয়মূল্য ধরব নাকি বিক্রয়মূল্য, বাকিতে বিক্রি করা পণ্যের টাকা হিসাবের মধ্যে আসবে কি না এবং ঋণ থাকলে তা বাদ দেওয়া যাবে কি?",
    author: "সিরাতুল মুস্তাকিম",
    date: "2026-06-02",
    views: 287640,
    category: "muamalat",
  },
  {
    id: "5",
    title: "রোযা অবস্থায় ইনজেকশন বা স্যালাইন নিলে রোযা ভেঙে যাবে কি?",
    questionNo: 2775,
    excerpt:
      "আমার পিতা দীর্ঘদিন যাবত অসুস্থ, চিকিৎসকের পরামর্শে তাকে নিয়মিত ইনজেকশন নিতে হয় এবং দুর্বলতা বেড়ে গেলে স্যালাইনও দিতে হয়। রমযান মাসে তিনি রোযা রাখতে চান। জানার বিষয় হলো, রোযা অবস্থায় ইনজেকশন নেওয়া কিংবা শিরায় স্যালাইন গ্রহণ করার দ্বারা রোযা ভেঙে যাবে কি না এবং ভাঙলে কাযা না কাফফারা ওয়াজিব হবে?",
    author: "সিরাতুল মুস্তাকিম",
    date: "2026-05-21",
    views: 198432,
    category: "ibadat",
  },
  {
    id: "6",
    title: "পারিবারিক জীবনে স্ত্রীর মোহরানা পরিশোধ ও ভরণপোষণের সঠিক বিধান",
    questionNo: 2774,
    excerpt:
      "বিবাহের সময় ধার্যকৃত মোহরানা পরিশোধের বিষয়ে সমাজে নানা ভুল ধারণা রয়েছে। মোহরানার কতটুকু তাৎক্ষণিক এবং কতটুকু পরবর্তীতে পরিশোধ করা যায়, এবং স্বামীর আর্থিক সামর্থ্য অনুযায়ী স্ত্রীর ন্যায্য ভরণপোষণের শরয়ী সীমা কতটুকু — এ বিষয়ে সুস্পষ্ট দিকনির্দেশনা কামনা করছি।",
    author: "সিরাতুল মুস্তাকিম",
    date: "2026-05-09",
    views: 154908,
    category: "poribar",
  },
  {
    id: "7",
    title: "আল্লাহ তা'আলার সিফাত ও তাওহীদে আসমা ওয়াস সিফাত এর তাৎপর্য",
    questionNo: 2773,
    excerpt:
      "আল্লাহ সুবহানাহু ওয়া তা'আলার পবিত্র নাম ও গুণাবলীর উপর ঈমান আনার সঠিক পদ্ধতি কী এবং এ ক্ষেত্রে কোনো প্রকার বিকৃতি বা সাদৃশ্য স্থাপন ছাড়া বিশ্বাস স্থাপনের গুরুত্ব কতখানি?",
    author: "সিরাতুল মুস্তাকিম",
    date: "2026-04-25",
    views: 142100,
    category: "aqida",
  },
  {
    id: "8",
    title: "সন্তানের সুন্দর নাম রাখা ও আকীকা আদায়ের সঠিক নিয়ম",
    questionNo: 2772,
    excerpt:
      "নবজাতক সন্তানের ইসলামী নাম রাখার নীতিমালা কী এবং জন্মের কততম দিনে আকীকা করা সুন্নাত? আর্থিক অস্বচ্ছলতার কারণে নির্ধারিত সময়ে আকীকা দিতে না পারলে পরবর্তীতে তা কীভাবে আদায় করা যায়?",
    author: "সিরাতুল মুস্তাকিম",
    date: "2026-04-12",
    views: 118900,
    category: "poribar",
  },
];

export type QuestionListParams = {
  query?: string;
  category?: string | null;
  page?: number;
};

export type QuestionListResult = {
  items: QuestionItem[];
  totalPages: number;
};

export async function getQuestions(params: QuestionListParams): Promise<QuestionListResult> {
  const queryParams = new URLSearchParams();
  if (params.query) queryParams.set("search", params.query);
  if (params.category) queryParams.set("category", params.category);
  if (params.page) queryParams.set("page", String(params.page));
  queryParams.set("status", "answered");
  queryParams.set("isPrivate", "false");
  queryParams.set("limit", "10");

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
      category: faq.answer?.category || "অন্যান্য"
    }));

    // Temporary frontend pagination since backend doesn't paginate yet
    const page = params.page || 1;
    const limit = 10;
    const startIndex = (page - 1) * limit;
    const paginatedItems = items.slice(startIndex, startIndex + limit);
    const totalPages = Math.ceil(items.length / limit) || 1;

    return {
      items: paginatedItems,
      totalPages
    };
  } catch (error) {
    console.error("Failed to fetch questions:", error);
    return { items: [], totalPages: 1 };
  }
}
