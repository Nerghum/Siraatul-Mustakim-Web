/**
 * TODO: replace with the real production domain once it is registered.
 * Used by metadataBase, sitemap.ts and robots.ts.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://siraatulmustaqim.com";

export const SITE_NAME = "সিরাতুল মুস্তাকীম";

export const SITE_DESCRIPTION =
  "কুরআন ও সুন্নাহর আলোকে মাসায়েল, প্রশ্ন-উত্তর, আর্টিকেল ও বয়ানের নির্ভরযোগ্য প্ল্যাটফর্ম।";

/** Routes that exist today. Keep in sync with components/header/nav-items.ts. */
export const STATIC_ROUTES = [
  "/",
  "/books",
  "/masail",
  "/question-answer",
  "/articles",
  "/bayan",
  "/videos",
  "/donate",
] as const;
