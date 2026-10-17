import type { Metadata } from "next";
import ProfileQuestionsView from "@/components/profile/ProfileQuestionsView";

export const metadata: Metadata = { title: "আমার প্রশ্নসমূহের উত্তর" };

export default function MyQuestionsPage() {
  return <ProfileQuestionsView mode="user" />;
}
