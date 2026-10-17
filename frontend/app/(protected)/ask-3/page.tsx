import type { Metadata } from "next";
import AskForm from "@/components/profile/AskForm";

export const metadata: Metadata = { title: "প্রশ্ন করুন" };

export default function AskPage() {
  return <AskForm />;
}
