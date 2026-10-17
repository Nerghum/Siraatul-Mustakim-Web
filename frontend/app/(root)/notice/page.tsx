import React from "react";
import EssentialMasail from "@/components/EssentialMasail/EssentialMasail";
import NoticeListing from "@/components/notice/NoticeListing";

export const metadata = {
  title: "Notice",
};

export default function NoticePage() {
  return (
    <div>
      <NoticeListing />
      <EssentialMasail />
    </div>
  );
}
