import type { Metadata } from "next";
import ComposePageClient from "@/components/profile/ComposePageClient";

export const metadata: Metadata = { title: "প্রবন্ধ সম্পাদনা" };

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = await Promise.resolve(params);
  return <ComposePageClient mode="articles" id={resolvedParams.id} />;
}
