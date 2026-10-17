import type { Metadata } from "next";
import ComposePageClient from "@/components/profile/ComposePageClient";

export const metadata: Metadata = { title: "প্রবন্ধ লিখুন" };

export default function NewArticlePage() {
  return <ComposePageClient mode="articles" />;
}
