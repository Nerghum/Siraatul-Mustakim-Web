import { toEnglishDigits } from "@/lib/banglaFormat";

export type DonationFrequency = "oneTime" | "monthly";
export type DonationType = "general" | "zakat";
export type PaymentMethod = "card" | "bkash" | "sslcommerz";

export type DonationValues = {
  amount: string;
  frequency: DonationFrequency;
  type: DonationType;
  name: string;
  mobile: string;
  email?: string;
  paymentMethod: PaymentMethod;
};

export type DonationField = "amount" | "name" | "mobile" | "email" | "paymentMethod";

/** Field -> key under `donate.errors.*`; empty object = valid. */
export type DonationErrors = Partial<Record<DonationField, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^01[3-9]\d{8}$/;

export function validateDonation(values: DonationValues): DonationErrors {
  const errors: DonationErrors = {};

  const num = Number(values.amount);
  if (!values.amount || Number.isNaN(num) || num <= 0) {
    errors.amount = !values.amount ? "amountRequired" : "amountInvalid";
  }

  const mobileClean = toEnglishDigits(values.mobile?.trim() || "").replace(/[\s-]/g, "");
  if (!mobileClean) {
    errors.mobile = "mobileRequired";
  } else if (!PHONE_PATTERN.test(mobileClean)) {
    errors.mobile = "mobileInvalid";
  }

  if (values.email?.trim()) {
    if (!EMAIL_PATTERN.test(values.email.trim())) {
      errors.email = "emailInvalid";
    }
  }

  return errors;
}
