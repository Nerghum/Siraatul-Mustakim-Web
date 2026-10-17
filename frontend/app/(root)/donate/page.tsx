import { Suspense } from "react";

import DonatePage from "@/components/donate/DonatePage";
import DonateSkeleton from "@/components/donate/DonateSkeleton";

export default function DonateRoute() {
  return (
    <div>
      {/* DonatePage reads ?fund= from the URL, so it needs a Suspense boundary. */}
      <Suspense fallback={<DonateSkeleton />}>
        <DonatePage />
      </Suspense>
    </div>
  );
}
