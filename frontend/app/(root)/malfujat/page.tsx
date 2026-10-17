import { Suspense } from "react";
import MalfujatListing from "@/components/malfujat/MalfujatListing";
import styles from "@/styles/malfujat.module.css";

export const metadata = {
  title: "Malfujat | Siraatul Mustaqim",
};

export default async function MalfujatPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  // Parse query params safely
  const query = typeof params.q === "string" ? params.q : undefined;
  const category = typeof params.category === "string" ? params.category : undefined;
  const page = typeof params.page === "string" ? parseInt(params.page, 10) : 1;
  const tab = typeof params.tab === "string" ? params.tab : "text"; // text or audio

  return (
    <div>
      <Suspense>
        <MalfujatListing query={query} category={category} page={page} tab={tab} />
      </Suspense>
    </div>
  );
}
