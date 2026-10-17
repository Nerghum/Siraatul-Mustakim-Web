import type { Metadata } from "next";
import BookmarksView from "@/components/profile/BookmarksView";

export const metadata: Metadata = { title: "আমার বুকমার্ক" };

export default function BookmarksPage() {
  return <BookmarksView />;
}
