import type { Metadata } from "next";
import React from "react";
import AskSuccessView from "@/components/qa/AskSuccessView";

export const metadata: Metadata = {
  title: "প্রশ্ন জমা সফল - সিরাতুল মুস্তাকীম",
};

export default function AskSuccessPage() {
  return <AskSuccessView />;
}
