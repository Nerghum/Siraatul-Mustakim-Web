import { Suspense } from "react";
import EssentialMasail from "@/components/EssentialMasail/EssentialMasail";
import ListingPage from "@/components/shared/ListingPage";
import ListingSkeleton from "@/components/shared/ListingSkeleton";

export default function MasailPage() {
  return (
    <div>
      {/* ListingPage reads ?q/?category/?page from the URL, so it suspends on
          useSearchParams during prerender. The fallback keeps the static chrome
          real and only shimmers the card list; on the client the component
          fetches its data and shimmers the same card area while it loads. */}
      <Suspense fallback={<ListingSkeleton namespace="masail" />}>
        <ListingPage basePath="/masail" namespace="masail" />
      </Suspense>

      {/* Static section — renders directly, no skeleton. */}
      <EssentialMasail />
    </div>
  );
}
