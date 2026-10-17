import type { Metadata } from "next";
import ProfileForm from "@/components/profile/ProfileForm";

export const metadata: Metadata = { title: "আমার প্রোফাইল" };

export default function ProfilePage() {
  return <ProfileForm />;
}
