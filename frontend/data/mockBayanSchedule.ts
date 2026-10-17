/**
 * Placeholder mock data for Bayan Schedule.
 * To be replaced by a real API endpoint in the future.
 */

import { mockFetch } from "@/lib/mock-api";
import {
  fetchBayanEvents,
  fetchBayanEventById,
  type BayanEvent,
} from "@/lib/api/bayan-schedule";

export type { BayanEvent };

/** Default contact used to flesh out the mock detail drawer. */
const DEFAULT_CONTACT = "মাসুদ ভাই (০১৭১৩৪৫৪৫৪৫)";

function getRelativeDateStr(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const MOCK_BAYAN_EVENTS: BayanEvent[] = [
  {
    id: "evt-1",
    date: getRelativeDateStr(0),
    title: "শবগুজারী",
    time: "মাগরিব বাদ (১১:৩০)",
    location: "ঢালকানগর খানকা",
    type: "amber",
  },
  {
    id: "evt-2",
    date: getRelativeDateStr(0),
    title: "মাসিক ইজতেমা",
    time: "বাদ আসর (০৫:২৫)",
    location: "জামেআ মারকাযুল ইহসান ঢাকা",
    type: "green",
  },
  {
    id: "evt-1b",
    date: getRelativeDateStr(0),
    title: "তারবিয়াতি জোড়",
    time: "সকাল ১০:০০",
    location: "ঢালকানগর খানকা",
    type: "amber",
  },
  {
    id: "evt-2b",
    date: getRelativeDateStr(0),
    title: "জুমুআর খুতবা ও বয়ান",
    time: "দুপুর ১২:৩০",
    location: "বায়তুল মুকাররম জাতীয় মসজিদ",
    type: "green",
  },
  {
    id: "evt-3b",
    date: getRelativeDateStr(0),
    title: "বিশেষ নসীহত ও দোয়া",
    time: "বাদ এশা (০৮:৩০)",
    location: "মারকাজ মসজিদ কাকরাইল",
    type: "amber",
  },

  {
    id: "evt-3",
    date: getRelativeDateStr(2),
    title: "সাপ্তাহিক তালিম",
    time: "বাদ মাগরিব (০৬:৪৫)",
    location: "বায়তুল মুকাররম জাতীয় মসজিদ",
    type: "amber",
  },

  {
    id: "evt-4",
    date: getRelativeDateStr(5),
    title: "তারবিয়াতি জোড়",
    time: "সকাল ১০:০০",
    location: "ঢালকানগর খানকা",
    type: "green",
  },
  {
    id: "evt-5",
    date: getRelativeDateStr(5),
    title: "ইসলাহি মজলিস",
    time: "বাদ আসর (০৪:৪৫)",
    location: "মারকাজ মসজিদ কাকরাইল",
    type: "amber",
  },
  {
    id: "evt-6",
    date: getRelativeDateStr(5),
    title: "জুমুআর খুতবা ও বয়ান",
    time: "দুপুর ১২:৩০",
    location: "জামেআ মারকাযুল ইহসান ঢাকা",
    type: "green",
  },
  {
    id: "evt-7",
    date: getRelativeDateStr(5),
    title: "শবগুজারী আলোচনা",
    time: "রাত ০৯:০০",
    location: "ঢালকানগর খানকা",
    type: "amber",
  },

  {
    id: "evt-8",
    date: getRelativeDateStr(8),
    title: "তাফসীরুল কুরআন মাহফিল",
    time: "বাদ মাগরিব (০৬:৫০)",
    location: "মহাখালী কেন্দ্রীয় মসজিদ",
    type: "green",
  },
  {
    id: "evt-9",
    date: getRelativeDateStr(8),
    title: "বিশেষ দোয়া ও বয়ান",
    time: "বাদ এশা (০৮:৩০)",
    location: "মিরপুর ১ নম্বর ঈদগাহ ময়দান",
    type: "amber",
  },
  {
    id: "evt-10",
    date: getRelativeDateStr(8),
    title: "যুবাদের বিশেষ নসীহত",
    time: "বিকাল ০৪:০০",
    location: "উত্তরা ৫ নম্বর সেক্টর মসজিদ",
    type: "green",
  },
  {
    id: "evt-11",
    date: getRelativeDateStr(8),
    title: "ইসলাহি আলোচনা",
    time: "রাত ০৯:৩০",
    location: "ঢালকানগর খানকা",
    type: "amber",
  },

  {
    id: "evt-12",
    date: getRelativeDateStr(12),
    title: "মাসিক ইজতেমা",
    time: "বাদ আসর (০৫:১৫)",
    location: "জামেআ মারকাযুল ইহসান ঢাকা",
    type: "green",
  },
  {
    id: "evt-13",
    date: getRelativeDateStr(12),
    title: "শবগুজারী",
    time: "মাগরিব বাদ (১১:৩০)",
    location: "ঢালকানগর খানকা",
    type: "amber",
  },

  {
    id: "evt-14",
    date: getRelativeDateStr(16),
    title: "সাপ্তাহিক তালিম",
    time: "বাদ মাগরিব (০৬:৪০)",
    location: "লালবাগ কেল্লা জামে মসজিদ",
    type: "amber",
  },

  {
    id: "evt-15",
    date: getRelativeDateStr(21),
    title: "তারবিয়াতি জোড়",
    time: "সকাল ০৯:৩০",
    location: "ঢালকানগর খানকা",
    type: "green",
  },
  {
    id: "evt-16",
    date: getRelativeDateStr(21),
    title: "ইসলাহি মজলিস",
    time: "বাদ আসর (০৫:০০)",
    location: "চৌধুরীপাড়া জামে মসজিদ",
    type: "amber",
  },
  {
    id: "evt-17",
    date: getRelativeDateStr(21),
    title: "বিশেষ নসীহত",
    time: "বাদ এশা (০৮:৪৫)",
    location: "ধানমন্ডি শাহী মসজিদ",
    type: "green",
  },

  {
    id: "evt-18",
    date: getRelativeDateStr(28),
    title: "শবগুজারী",
    time: "মাগরিব বাদ (১১:৩০)",
    location: "ঢালকানগর খানকা",
    type: "amber",
  },
  {
    id: "evt-19",
    date: getRelativeDateStr(28),
    title: "মাসিক তাফসীর সভা",
    time: "বাদ আসর (০৪:৩০)",
    location: "জামেআ মারকাযুল ইহসান ঢাকা",
    type: "green",
  },

  {
    id: "evt-20",
    date: getRelativeDateStr(-4),
    title: "সাপ্তাহিক বায়ান",
    time: "বাদ মাগরিব (০৬:৩০)",
    location: "ঢালকানগর খানকা",
    type: "green",
  },
];

/** Fills in the detail-drawer fields (highlight/contact/mapsUrl) the mock omits. */
function enrich(event: BayanEvent): BayanEvent {
  return {
    ...event,
    districtName: event.districtName ?? "ঢাকা",
    highlight: event.highlight ?? `${event.title} — বিশেষ আলোচনা ও দোয়া`,
    contact: event.contact ?? DEFAULT_CONTACT,
    mapsUrl: event.mapsUrl ?? `https://maps.google.com/?q=${encodeURIComponent(event.location)}`,
  };
}

/** Real bayan-schedule endpoint with mock fallback if backend server is unreachable. */
export async function getBayanEvents(): Promise<BayanEvent[]> {
  try {
    const liveEvents = await fetchBayanEvents();
    return liveEvents;
  } catch (error) {
    console.warn("Could not reach backend API, using local fallback:", error);
    return mockFetch(MOCK_BAYAN_EVENTS.map(enrich));
  }
}

/**
 * Single event lookup for `/bayan-schedule/[id]` and `/bayan/[id]` deep links.
 * Checks live API first, falls back to local data.
 */
export async function getBayanEventById(id: string): Promise<BayanEvent | undefined> {
  try {
    const liveEvent = await fetchBayanEventById(id);
    if (liveEvent) return liveEvent;
  } catch {
    // fallback below
  }
  const fallback = MOCK_BAYAN_EVENTS.find((e) => e.id === id);
  return fallback ? enrich(fallback) : undefined;
}
