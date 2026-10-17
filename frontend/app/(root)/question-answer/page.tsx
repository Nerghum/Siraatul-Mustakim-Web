import { Suspense } from "react";
import EssentialMasail from "@/components/EssentialMasail/EssentialMasail";
import QaListing from "@/components/qa/QaListing";
import ListingSkeleton from "@/components/shared/ListingSkeleton";

export default function QAPage() {
  return (
    <div>
      {/* QaListing suspends on useSearchParams; the fallback keeps the static
          chrome real and only shimmers the card list. */}
      <Suspense fallback={<ListingSkeleton namespace="qa" />}>
        <QaListing />
      </Suspense>

      {/* Static section — renders directly, no skeleton. */}
      <EssentialMasail />
    </div>
  );
}
