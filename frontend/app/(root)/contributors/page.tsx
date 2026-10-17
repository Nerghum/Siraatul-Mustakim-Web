import type { Metadata } from "next";
import ContributorsView from "@/components/contributors/ContributorsView";

export const metadata: Metadata = {
  title: "কন্ট্রিবিউটরস - সিরাতুল মুস্তাকীম",
  description: "সিরাতুল মুস্তাকীম প্ল্যাটফর্মে অবদানকারী সকল ভাই ও বোনদের তালিকা ও পরিচিতি।",
};

export default function ContributorsPage() {
  return <ContributorsView />;
}
