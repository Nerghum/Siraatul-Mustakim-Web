/**
 * Placeholder mock data for the donate page.
 * To be replaced by a real campaign endpoint + payment gateway in the future.
 */

import { mockFetch } from "@/lib/mock-api";

export type DonationFundSlug = "madrasa" | "app";

/** Keys under `donate.features.*`; the icon name is resolved by FeatureGrid. */
export type FeatureId =
  | "masjid"
  | "research"
  | "dataCenter"
  | "maktab"
  | "hifz"
  | "education"
  | "adult"
  | "training";

export type DonationFund = {
  slug: DonationFundSlug;
  /** Key under `donate.funds.*`. */
  translationKey: DonationFundSlug;
  /**
   * The mockup draws ৳১০০ four times with ৳৩০ active — placeholder text rather
   * than a spec, so these are distinct values. Change this array to use others.
   */
  presetAmounts: number[];
  /** Index of the pill selected on first paint, matching the drawn active state. */
  defaultAmountIndex: number;
  /** TODO: swap for the real upload id. */
  videoId: string;
  features: FeatureId[];
  /** Keys under `donate.why.item*`. */
  checklist: string[];
};

const ALL_FEATURES: FeatureId[] = [
  "masjid",
  "research",
  "dataCenter",
  "maktab",
  "hifz",
  "education",
  "adult",
  "training",
];

const CHECKLIST = ["item1", "item2", "item3"];

export const MOCK_DONATION_FUNDS: DonationFund[] = [
  {
    slug: "app",
    translationKey: "app",
    presetAmounts: [200, 500, 1000, 3000, 5000],
    defaultAmountIndex: 2,
    videoId: "eTpJvH8rGCc",
    features: ALL_FEATURES,
    checklist: CHECKLIST,
  },
  {
    slug: "madrasa",
    translationKey: "madrasa",
    presetAmounts: [200, 500, 1000, 3000, 5000],
    defaultAmountIndex: 2,
    videoId: "eTpJvH8rGCc",
    features: ALL_FEATURES,
    checklist: CHECKLIST,
  },
];

export const DEFAULT_FUND = MOCK_DONATION_FUNDS[0];

export function getFund(slug: string | null): DonationFund {
  return MOCK_DONATION_FUNDS.find((fund) => fund.slug === slug) ?? DEFAULT_FUND;
}

/** Simulated fund-details endpoint — drives the donate page's loading state. */
export async function fetchFund(slug: string | null): Promise<DonationFund> {
  return mockFetch(getFund(slug));
}
