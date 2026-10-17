import { mockFetch } from "@/lib/mock-api";

export type TocItem = {
  id: string;
  /** Translation key under `listing.categories.*` (labels shared with the sidebar). */
  titleKey: string;
  count: number;
};

export type BookPage = {
  id: string;
  title: string;
  body: string[];
};

export type BookReaderData = {
  bookId: string;
  toc: TocItem[];
  pageIndex: number;
  currentPage: BookPage;
  totalPages: number;
};

/** The book's chapter list — mirrors the reference's সূচীপত্র (labels + counts). */
const MOCK_TOC: TocItem[] = [
  { id: "iman-akida", titleKey: "imanAkida", count: 3 },
  { id: "ilm", titleKey: "ilm", count: 0 },
  { id: "sirat-itihas", titleKey: "siratItihas", count: 3 },
  { id: "rajniti", titleKey: "rajniti", count: 1 },
  { id: "samajik", titleKey: "samajik", count: 7 },
  { id: "taharat", titleKey: "taharat", count: 13 },
  { id: "namaz", titleKey: "namaz", count: 26 },
  { id: "janaza", titleKey: "janaza", count: 1 },
  { id: "roza", titleKey: "roza", count: 18 },
  { id: "zakat", titleKey: "zakat", count: 3 },
];

const IMAN_BODY = [
  "আল্লাহ তা'আলার ওপর ঈমান আনার অর্থ এ কথা বিশ্বাস করা যে, আল্লাহ এক, অদ্বিতীয় ও অতুলনীয়। তাঁর কোন প্রকার অংশ বা অংশীদার বা শরীক নেই, তাঁর কোন কিছুর অভাব নেই। তিনিই সকলের সব অভাব পূরণকারী। তিনি কারো পিতা নন, পুত্রও নন, তাঁর সমতুল্য কেউ নেই। একমাত্র তিনিই সবকিছুর সৃষ্টিকর্তা, রক্ষাকর্তা ও পালনকর্তা। কোন জ্ঞান বা চক্ষু আল্লাহ তা'আলাকে আয়ত্ত করতে পারে না। তিনি চিরকাল আছেন এবং থাকবেন। তিনি অনাদি ও অনন্ত। আল্লাহ তা'আলা ছাড়া আর কোন মা'বুদ নাই। তিনিই একমাত্র ইবাদত পাওয়ার যোগ্য।",
  "সারকথা, আল্লাহ তা'আলার বিষয়ে তিনটি কথা অবশ্যই মানতে হবে। ক. তিনি এক, অদ্বিতীয় ও অতুলনীয়। তাঁর কোন শরীক নেই। সৃষ্ট জীবের সাথে তাঁর কোন তুলনা হয় না।",
  "খ. তাঁর অনেকগুলো অনাদি-অনন্ত সিফাত বা গুণ আছে, সেগুলো একমাত্র তাঁর জন্যেই নির্ধারিত। সেসব গুণের মধ্যে অন্য কেউ শরীক নেই। যেমন: তিনিই সৃষ্টিকর্তা, রিযিকদাতা, হায়াত-মওতদাতা, বিধানদাতা, গায়েব সম্পর্কে সম্পূর্ণ অবগত। তিনি চিরঞ্জীব, তাঁর মৃত্যু নেই। অন্য সবকিছুই ক্ষয়শীল ও ধ্বংসশীল, কিন্তু তাঁর ক্ষয়ও নেই, ধ্বংসও নেই। সবকিছুর ওপর তাঁর আধিপত্য প্রতিষ্ঠিত। সবকিছুর ওপরই তাঁর ক্ষমতা চলে।",
];

/** Each chapter maps to a reader page. Headings vary; body is representative. */
const MOCK_PAGES: Record<string, BookPage> = {
  "iman-akida": { id: "iman-akida", title: "আল্লাহ তা'আলার ওপর ঈমান", body: IMAN_BODY },
  ilm: {
    id: "ilm",
    title: "ইলম অর্জনের ফযীলত",
    body: [
      "ইলম অর্জন প্রত্যেক মুসলিমের ওপর ফরয। ইলম ব্যতীত সহীহ আমল সম্ভব নয়।",
      "রাসূলুল্লাহ সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম বলেছেন, যে ব্যক্তি ইলমের সন্ধানে বের হয়, আল্লাহ তার জন্য জান্নাতের পথ সহজ করে দেন।",
    ],
  },
  "sirat-itihas": {
    id: "sirat-itihas",
    title: "সীরাত ও ইতিহাসের শিক্ষা",
    body: [
      "নবীজীবনের সীরাত মুমিনের জন্য আদর্শ। ইতিহাসের পাঠ থেকে শিক্ষা গ্রহণ করা কর্তব্য।",
      "সাহাবায়ে কেরামের জীবনী থেকে আমরা ত্যাগ ও কুরবানীর শিক্ষা পাই।",
    ],
  },
  rajniti: {
    id: "rajniti",
    title: "ইসলামে রাজনীতি ও নেতৃত্ব",
    body: ["ইসলাম ন্যায়ভিত্তিক নেতৃত্বের নির্দেশনা দেয়। শাসকের ওপর জনগণের অধিকার রক্ষা করা ওয়াজিব।"],
  },
  samajik: {
    id: "samajik",
    title: "সামাজিক শিষ্টাচার, অধিকার ও আইন",
    body: [
      "প্রতিবেশীর হক, আত্মীয়ের হক ও সমাজের প্রতি দায়িত্ব ইসলামে গুরুত্বপূর্ণ।",
      "উত্তম আচরণ ও সদাচার একজন মুমিনের পরিচয়।",
    ],
  },
  taharat: {
    id: "taharat",
    title: "পবিত্রতা ও তাহারাত",
    body: [
      "পবিত্রতা ঈমানের অঙ্গ। ওযু, গোসল ও পাক-পবিত্রতার বিধান বিস্তারিত আলোচিত।",
      "নাপাকি থেকে বেঁচে থাকা ইবাদত কবুলের পূর্বশর্ত।",
    ],
  },
  namaz: {
    id: "namaz",
    title: "নামায-সালাতের বিধান",
    body: [
      "নামায ইসলামের দ্বিতীয় স্তম্ভ। পাঁচ ওয়াক্ত নামায প্রত্যেক বালেগ মুসলিমের ওপর ফরয।",
      "নামাযের শর্ত, রুকন ও ওয়াজিবসমূহ যথাযথ পালন করা আবশ্যক।",
    ],
  },
  janaza: {
    id: "janaza",
    title: "জানাযা ও মৃত্যু পরবর্তী বিধান",
    body: ["জানাযার নামায ফরযে কেফায়া। মৃতের গোসল, কাফন ও দাফনের বিধান রয়েছে।"],
  },
  roza: {
    id: "roza",
    title: "রোযা ও সিয়ামের বিধান",
    body: [
      "রমযান মাসের রোযা প্রত্যেক সামর্থ্যবান মুসলিমের ওপর ফরয।",
      "রোযা ভঙ্গের কারণ ও কাযা-কাফফারার বিধান জেনে রাখা জরুরি।",
    ],
  },
  zakat: {
    id: "zakat",
    title: "যাকাতের বিধান",
    body: [
      "যাকাত ইসলামের তৃতীয় স্তম্ভ। নিসাব পরিমাণ সম্পদের ওপর যাকাত ফরয হয়।",
      "যাকাত সঠিক খাতে ব্যয় করা সম্পদ পবিত্র করার মাধ্যম।",
    ],
  },
};

export async function fetchBookPage(
  bookId: string,
  pageId: string | null,
): Promise<BookReaderData> {
  // Find index of requested page, default to the first chapter.
  const index = pageId ? MOCK_TOC.findIndex((t) => t.id === pageId) : 0;
  const validIndex = index === -1 ? 0 : index;
  const tocItem = MOCK_TOC[validIndex];

  return mockFetch({
    bookId,
    toc: MOCK_TOC,
    pageIndex: validIndex,
    currentPage: MOCK_PAGES[tocItem.id],
    totalPages: MOCK_TOC.length,
  });
}
