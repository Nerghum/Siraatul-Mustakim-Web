/**
 * Placeholder mock data for the public author article page (/author-article).
 * Shows a single author's QA and article content with tag chips.
 * To be replaced by a real API endpoint later — the component/hook/skeleton
 * shapes stay the same.
 */

import { mockFetch } from "@/lib/mock-api";

export type AuthorContentItem = {
  id: string;
  title: string;
  excerpt: string;
  /** ISO date — formatted per locale at render time. */
  date: string;
  /** Category slugs rendered as chips on the card. */
  tags: string[];
  /** Determines which tab this item appears under. */
  type: "qa" | "article";
  author?: string;
  views?: number;
};

export type AuthorContentTab = "qa" | "article";

const MOCK_AUTHOR_QA: AuthorContentItem[] = [
  {
    id: "qa-1",
    title: "নখ বড় করে রাখলে অথবা ফ্যাশনের জন্য কৃত্রিম নখ লাগালে ওযু হবে কি?",
    excerpt:
      "মুহতারাম, বর্তমানে অনেক নারী-পুরুষ শখ করে কিংবা ফ্যাশন হিসেবে হাতের নখ অনেক বড় রাখেন। বিশেষ করে নারীদের মাঝে দীর্ঘ নখ রাখা ও তার উপর কৃত্রিম নখ লাগানোর প্রচলন বেড়েছে। জানার বিষয় হলো, এভাবে নখ বড় রাখলে বা কৃত্রিম নখ লাগিয়ে ওযু করলে ওযু সহীহ হবে কি না এবং শরীয়তে এ বিষয়ে নির্দেশনা কী?",
    date: "2025-06-28",
    tags: ["taharat", "namaz"],
    type: "qa",
  },
  {
    id: "qa-2",
    title: "সফর অবস্থায় কসর নামায পড়ার সঠিক শরয়ী নিয়ম কী?",
    excerpt:
      "আমি চাকরির প্রয়োজনে প্রতি সপ্তাহে ঢাকা থেকে দূরের একটি জেলায় যাতায়াত করি। সেখানে কখনো দুই দিন, কখনো চার-পাঁচ দিন অবস্থান করতে হয়। জানার বিষয় হলো, কত দূরত্বে গেলে মুসাফির গণ্য হব, কত দিন অবস্থানের নিয়ত করলে কসর শেষ হয়ে যাবে এবং ইমামের পিছনে মুকীম হিসেবে নামায পড়লে কী নিয়ম অনুসরণ করব?",
    date: "2025-06-15",
    tags: ["taharat", "namaz"],
    type: "qa",
  },
  {
    id: "qa-3",
    title: "ব্যবসায়ী পণ্য ও সঞ্চিত অর্থের যাকাত হিসাব করার সঠিক পদ্ধতি",
    excerpt:
      "আমার একটি ছোট দোকান আছে, দোকানে সবসময় কিছু পণ্য মজুদ থাকে এবং ব্যাংকে কিছু নগদ অর্থও জমা আছে। এছাড়া স্ত্রীর কিছু স্বর্ণালংকার রয়েছে। জানার বিষয় হলো, বছর শেষে যাকাত হিসাব করার সময় পণ্যের ক্রয়মূল্য ধরব নাকি বিক্রয়মূল্য, বাকিতে বিক্রি করা পণ্যের টাকা হিসাবের মধ্যে আসবে কি না এবং ঋণ থাকলে তা বাদ দেওয়া যাবে কি?",
    date: "2025-06-02",
    tags: ["zakat"],
    type: "qa",
  },
  {
    id: "qa-4",
    title: "রোযা অবস্থায় ইনজেকশন বা স্যালাইন নিলে রোযা ভেঙে যাবে কি?",
    excerpt:
      "আমার পিতা দীর্ঘদিন যাবত অসুস্থ, চিকিৎসকের পরামর্শে তাকে নিয়মিত ইনজেকশন নিতে হয় এবং দুর্বলতা বেড়ে গেলে স্যালাইনও দিতে হয়। রমযান মাসে তিনি রোযা রাখতে চান। জানার বিষয় হলো, রোযা অবস্থায় ইনজেকশন নেওয়া কিংবা শিরায় স্যালাইন গ্রহণ করার দ্বারা রোযা ভেঙে যাবে কি না এবং ভাঙলে কাযা না কাফফারা ওয়াজিব হবে?",
    date: "2025-05-21",
    tags: ["roza"],
    type: "qa",
  },
  {
    id: "qa-5",
    title: "জানাযার নামাযে মাসবূক ব্যক্তি ছুটে যাওয়া তাকবীর কীভাবে আদায় করবে?",
    excerpt:
      "গত সপ্তাহে একটি জানাযার নামাযে শরীক হতে গিয়ে আমি দুই তাকবীর পর জামাতে শামিল হই। তখন কীভাবে বাকি তাকবীরগুলো আদায় করতে হবে তা নিয়ে উপস্থিত মুসল্লিদের মধ্যে মতপার্থক্য দেখা দেয়। জানার বিষয় হলো, মাসবূক ব্যক্তি ইমামের সালামের পর ছুটে যাওয়া তাকবীরগুলো আদায় করবে কি না এবং লাশ উঠিয়ে নেওয়া হলে করণীয় কী?",
    date: "2025-05-09",
    tags: ["janaza"],
    type: "qa",
  },
];

const MOCK_AUTHOR_ARTICLES: AuthorContentItem[] = [
  {
    id: "art-1",
    title: "ঈমানের হাকীকত ও চরিত্র গঠনে তাকওয়ার ভূমিকা",
    excerpt:
      "মানব জীবনে ঈমানের গুরুত্ব অপরিসীম। ঈমান কেবল মুখের স্বীকৃতি নয়, বরং অন্তরের দৃঢ় বিশ্বাস ও অঙ্গ-প্রত্যঙ্গের আমলের সমষ্টি। তাকওয়া অর্জনের মাধ্যমে একজন মুমিন বান্দা তার চরিত্রকে সৌন্দর্যমন্ডিত করে তুলতে পারে।",
    date: "2025-05-10",
    tags: ["iman-akida"],
    type: "article",
  },
  {
    id: "art-2",
    title: "রমাদানের শিক্ষা ও পরবর্তী ১১ মাসের আমল",
    excerpt:
      "পবিত্র রমাদান মাস চলে যাওয়ার পর মুমিনের ঈমানী চেতনা কীভাবে ধরে রাখতে হবে এবং আমলের ধারাবাহিকতা বজায় রাখার নিয়ম কী, তা নিয়ে অনেকেই দ্বিধায় থাকেন। রমাদান একটি প্রশিক্ষণকাল; এর প্রকৃত সফলতা প্রকাশ পায় বাকি এগারো মাসের আচরণে।",
    date: "2025-04-28",
    tags: ["roza"],
    type: "article",
  },
  {
    id: "art-3",
    title: "দাওয়াহ ইলাল্লাহ: সমকালীন চ্যালেঞ্জ ও আমাদের করণীয়",
    excerpt:
      "বর্তমান আধুনিক যুগে ইসলামি দাওয়াহের নতুন নতুন ক্ষেত্র তৈরি হয়েছে। সমকালীন প্রযুক্তি ব্যবহার করে সহীহ দ্বীন পৌঁছানোর সুযোগ যেমন বেড়েছে, তেমনি বিভ্রান্তি ছড়ানোর ঝুঁকিও বেড়েছে।",
    date: "2025-04-15",
    tags: ["ilm"],
    type: "article",
  },
  {
    id: "art-4",
    title: "ইসলামি অর্থনীতিতে সুদমুক্ত লেনদেনের মূলনীতি",
    excerpt:
      "সুদ ইসলামে কঠোরভাবে নিষিদ্ধ, অথচ আধুনিক আর্থিক ব্যবস্থার প্রায় প্রতিটি স্তরে তা জড়িয়ে আছে। একজন সাধারণ মুসলিম কীভাবে তার আয়-ব্যয় ও বিনিয়োগকে সুদমুক্ত রাখবেন, মুরাবাহা ও মুশারাকার মতো বিকল্প পদ্ধতিগুলো কীভাবে কাজ করে।",
    date: "2025-03-30",
    tags: ["samajik"],
    type: "article",
  },
  {
    id: "art-5",
    title: "সন্তান প্রতিপালনে নববী আদর্শ ও অভিভাবকের দায়িত্ব",
    excerpt:
      "সন্তান আল্লাহ তাআলার এক মহান আমানত। রাসূলুল্লাহ সাল্লাল্লাহু আলাইহি ওয়াসাল্লামের শিক্ষায় শিশুর বয়স অনুযায়ী স্নেহ, শিক্ষা ও শাসনের ভারসাম্যপূর্ণ পদ্ধতি বর্ণিত হয়েছে।",
    date: "2025-03-18",
    tags: ["samajik"],
    type: "article",
  },
];

export type AuthorContentParams = {
  tab: AuthorContentTab;
  category?: string | null;
  page?: number;
  author?: string | null;
};

export type AuthorContentResult = {
  items: AuthorContentItem[];
  totalPages: number;
};

const ITEMS_PER_PAGE = 10;

/**
 * Fetches dynamic author content (Q&A or Articles) from backend MongoDB APIs.
 */
export async function getAuthorContent(params: AuthorContentParams): Promise<AuthorContentResult> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";
  const { tab, category, page = 1, author } = params;
  const limit = ITEMS_PER_PAGE;

  try {
    if (tab === "qa") {
      const queryParams = new URLSearchParams();
      queryParams.set("status", "answered");
      queryParams.set("isPrivate", "false");
      if (category) queryParams.set("category", category);
      if (author) queryParams.set("answerAuthor", author);

      const res = await fetch(`${API_BASE}/api/faq?${queryParams.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch FAQs: ${res.statusText}`);
      }
      const data = await res.json();
      const faqsArray: any[] = Array.isArray(data) ? data : (data.faqs || []);

      const allItems: AuthorContentItem[] = faqsArray.map((faq: any) => {
        const questionText = faq.question?.question || "";
        const titleText =
          faq.title ||
          (questionText.length > 70 ? `${questionText.slice(0, 70)}...` : questionText) ||
          "প্রশ্নোত্তর";
        const rawExcerpt = faq.answer?.answer
          ? faq.answer.answer.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
          : questionText;
        const excerpt = rawExcerpt.length > 200 ? `${rawExcerpt.slice(0, 200)}...` : rawExcerpt;

        const tags: string[] = [];
        if (faq.answer?.category) {
          tags.push(faq.answer.category);
        } else if (faq.category) {
          tags.push(faq.category);
        }

        return {
          id: faq._id,
          title: titleText,
          excerpt,
          date: faq.answer?.timestamp || faq.createdAt || new Date().toISOString(),
          tags,
          type: "qa" as const,
          author: faq.answer?.author || faq.answer?.userId?.name || "সিরাতুল মুস্তাকিম",
          views: faq.views || 0,
        };
      });

      const total = allItems.length;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const startIndex = (page - 1) * limit;
      const items = allItems.slice(startIndex, startIndex + limit);

      return { items, totalPages };
    } else {
      // Articles tab
      const queryParams = new URLSearchParams();
      queryParams.set("status", "published");
      queryParams.set("page", String(page));
      queryParams.set("limit", String(limit));
      if (category) queryParams.set("category", category);
      if (author) queryParams.set("author", author);

      const res = await fetch(`${API_BASE}/api/articles?${queryParams.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch articles: ${res.statusText}`);
      }
      const result = await res.json();
      const articlesArray: any[] = Array.isArray(result) ? result : (result.data || []);
      const totalPages =
        result.pagination?.totalPages ||
        Math.max(1, Math.ceil((result.pagination?.total || articlesArray.length) / limit));

      const items: AuthorContentItem[] = articlesArray.map((article: any) => {
        const rawContent = article.content
          ? article.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
          : "";
        const excerpt = rawContent.length > 200 ? `${rawContent.slice(0, 200)}...` : rawContent;

        return {
          id: article._id || article.id,
          title: article.title || "আর্টিকেল",
          excerpt,
          date: article.createdAt || new Date().toISOString(),
          tags: Array.isArray(article.tags) ? article.tags : [],
          type: "article" as const,
          author: article.author?.name || "সিরাতুল মুস্তাকিম",
          views: article.views || 0,
        };
      });

      return { items, totalPages };
    }
  } catch (err) {
    console.error("Error in getAuthorContent:", err);
    return { items: [], totalPages: 1 };
  }
}
