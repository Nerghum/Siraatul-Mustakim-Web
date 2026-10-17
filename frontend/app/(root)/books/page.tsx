import { Suspense } from "react";
import BooksGridSkeleton from "@/components/books/BooksGridSkeleton";
import BooksListing from "@/components/books/BooksListing";
import EssentialMasail from "@/components/EssentialMasail/EssentialMasail";
import styles from "@/styles/books.module.css";

export default function BooksPage() {
  return (
    <div>
      {/* BooksListing reads ?q/?category/?page from the URL, so it suspends on
          useSearchParams during prerender. The fallback keeps the static chrome
          real and shimmers only the cover grid; on the client the component
          fetches its data and shimmers the same grid while it loads. */}
      <Suspense fallback={<BooksGridSkeleton />}>
        <BooksListing />
      </Suspense>

      {/* Static section — renders directly, no skeleton. */}
      <EssentialMasail />
    </div>
  );
}
