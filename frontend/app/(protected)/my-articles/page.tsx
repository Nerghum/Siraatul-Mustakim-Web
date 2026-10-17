import type { Metadata } from "next";
import AuthorContentView from "@/components/profile/AuthorContentView";

export const metadata: Metadata = { title: "আর্টিকেলসমূহ" };

export default function MyArticlesPage() {
  return <AuthorContentView mode="articles" />;
}
