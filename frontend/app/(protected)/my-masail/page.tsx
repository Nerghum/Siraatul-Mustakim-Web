import type { Metadata } from "next";
import AuthorContentView from "@/components/profile/AuthorContentView";

export const metadata: Metadata = { title: "মাসায়েলসমূহ" };

export default function MyMasailPage() {
  return <AuthorContentView mode="masail" />;
}
