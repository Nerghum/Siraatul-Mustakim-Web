import type { Metadata } from "next";
import AnswerPanelClient from "@/components/profile/AnswerPanelClient";

export const metadata: Metadata = { title: "উত্তর দিন" };

export default async function AnswerPanelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AnswerPanelClient id={id} />;
}
