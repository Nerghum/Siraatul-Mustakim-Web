import type { ListingItem } from "./listing";

/** One typed paragraph in a detail body — the renderer picks an element per type. */
export type ContentBlockType =
  | "bismillah"
  | "paragraph"
  | "arabic"
  | "translation"
  | "quote"
  | "html"
  | "reference";

export type ContentBlockItem = {
  type: ContentBlockType;
  text: string;
};

export type Tag = {
  label: string;
  /** Pill styling from the mockup: filled green, near-black, or light grey. */
  variant: "primary" | "dark" | "muted";
};

export type DetailItem = ListingItem & {
  /** Full body — the listing only shows a clamped excerpt. */
  body: ContentBlockItem[];
  /** Category pills beside the folder icon. */
  tags: Tag[];
  /** Light grey topic pills — bottom of the card on desktop, top on mobile. */
  topics: Tag[];
  /** Optional avatar URL; falls back to the icon disc when absent. */
  avatar?: string;
};
