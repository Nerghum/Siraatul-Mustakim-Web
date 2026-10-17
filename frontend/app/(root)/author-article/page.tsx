import { Suspense } from "react";

import AuthorArticleListing from "@/components/author-article/AuthorArticleListing";
import AuthorArticleSkeleton from "@/components/author-article/AuthorArticleSkeleton";
import EssentialMasail from "@/components/EssentialMasail/EssentialMasail";

export default function AuthorArticlePage() {
  return (
    <div>
      <Suspense fallback={<AuthorArticleSkeleton />}>
        <AuthorArticleListing />
      </Suspense>

      <EssentialMasail />
    </div>
  );
}
