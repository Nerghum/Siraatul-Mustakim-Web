import type { Metadata } from "next";
import ProfileQuestionsView from "@/components/profile/ProfileQuestionsView";

export const metadata: Metadata = { title: "প্রশ্নসমূহ" };

export default function AnswerQueuePage() {
  return <ProfileQuestionsView mode="author" />;
}
