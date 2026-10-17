import { fetchNoticeById, fetchNoticeList } from "@/lib/api/notice";
import type { NoticeItem } from "@/types/notice";

export const MOCK_NOTICES: NoticeItem[] = [
  {
    id: "notice-1",
    title: "মাসিক ইজতেমা",
    timeLabel: "বাদ আসর (০৫:২৫)",
    excerpt:
      "খানকাহ্ এমদাদিয়া আশরাফিয়া, ঢালকানগর খানকাহ শরীফের মাসিক ইজতেমা এবং শবগুজারী আগামী ৩০শে জুলাই, ২০২৩ ঈসায়ী, রোজ বৃহস্পতিবার অনুষ্ঠিত হবে। হযরতওয়ালা দামাত বারাকাতুহুম বাদ এশা বয়ান রাখবেন।",
    description:
      "খানকাহ্ এমদাদিয়া আশরাফিয়া, ঢালকানগর খানকাহ শরীফের মাসিক ইজতেমা এবং শবগুজারী আগামী ৩০শে জুলাই, ২০২৩ ঈসায়ী, রোজ বৃহস্পতিবার অনুষ্ঠিত হবে। হযরতওয়ালা দামাত বারাকাতুহুম বাদ এশা বয়ান রাখবেন।",
    date: "2023-07-25",
    category: "islahi-majlis",
    styleType: "green",
  },
  {
    id: "notice-2",
    title: "মাসিক ইজতেমা এবং শবগুজারী",
    timeLabel: "বাদ আসর (০৫:২৫)",
    excerpt:
      "খানকাহ্ এমদাদিয়া আশরাফিয়া, ঢালকানগর খানকাহ শরীফের মাসিক ইজতেমা এবং শবগুজারী আগামী ৩০শে জুলাই, ২০২৩ ঈসায়ী, রোজ বৃহস্পতিবার অনুষ্ঠিত হবে। হযরতওয়ালা দামাত বারাকাতুহুম বাদ এশা বয়ান রাখবেন।",
    description:
      "খানকাহ্ এমদাদিয়া আশরাফিয়া, ঢালকানগর খানকাহ শরীফের মাসিক ইজতেমা এবং শবগুজারী আগামী ৩০শে জুলাই, ২০২৩ ঈসায়ী, রোজ বৃহস্পতিবার অনুষ্ঠিত হবে। হযরতওয়ালা দামাত বারাকাতুহুম বাদ এশা বয়ান রাখবেন।",
    date: "2023-07-25",
    category: "islahi-majlis",
    styleType: "amber",
  },
  {
    id: "notice-3",
    title: "মাসিক ইজতেমা এবং শবগুজারী",
    timeLabel: "বাদ আসর (০৫:২৫)",
    excerpt:
      "খানকাহ্ এমদাদিয়া আশরাফিয়া, ঢালকানগর খানকাহ শরীফের মাসিক ইজতেমা এবং শবগুজারী আগামী ৩০শে জুলাই, ২০২৩ ঈসায়ী, রোজ বৃহস্পতিবার অনুষ্ঠিত হবে। হযরতওয়ালা দামাত বারাকাতুহুম বাদ এশা বয়ান রাখবেন।",
    description:
      "খানকাহ্ এমদাদিয়া আশরাফিয়া, ঢালকানগর খানকাহ শরীফের মাসিক ইজতেমা এবং শবগুজারী আগামী ৩০শে জুলাই, ২০২৩ ঈসায়ী, রোজ বৃহস্পতিবার অনুষ্ঠিত হবে। হযরতওয়ালা দামাত বারাকাতুহুম বাদ এশা বয়ান রাখবেন।",
    date: "2023-07-25",
    category: "madrasa",
    styleType: "green",
  },
];

export const MOCK_NOTICES_TOTAL_PAGES = 1;

export type NoticeListingParams = {
  category?: string | null;
  page?: number;
  q?: string;
};

export type NoticeListingResult = {
  items: NoticeItem[];
  totalPages: number;
};

export async function getNotices(params: NoticeListingParams = {}): Promise<NoticeListingResult> {
  try {
    const res = await fetchNoticeList({
      page: params.page ?? 1,
      q: params.q,
      limit: 10,
    });
    if (res.items.length > 0) {
      return {
        items: res.items,
        totalPages: res.totalPages,
      };
    }
  } catch (err) {
    console.warn("Notice fetch error, falling back to mock data if empty:", err);
  }

  return { items: [], totalPages: 1 };
}

export async function getNoticeDetail(id: string): Promise<NoticeItem | null> {
  try {
    const item = await fetchNoticeById(id);
    if (item) return item;
  } catch (err) {
    console.warn("Notice detail fetch error:", err);
  }

  return null;
}
