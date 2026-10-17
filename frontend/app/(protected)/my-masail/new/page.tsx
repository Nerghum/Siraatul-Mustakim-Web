import type { Metadata } from "next";
import ComposePageClient from "@/components/profile/ComposePageClient";

export const metadata: Metadata = { title: "মাসায়েল লিখুন" };

export default function NewMasailPage() {
  return <ComposePageClient mode="masail" />;
}
