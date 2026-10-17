"use client";

import React from "react";
import { SkeletonBar as Skeleton } from "@/components/ui/skeleton-bar";
import parts from "./profile-parts.module.css";

type Props = {
  count?: number;
  withTopRow?: boolean;
};

export const ProfileCardSkeleton: React.FC<Props> = ({ count = 3, withTopRow = true }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <article key={i} className={parts.pqCard} aria-hidden="true">
          {withTopRow && (
            <div className={parts.pqTop}>
              <Skeleton className="h-[28px] w-[90px] rounded-full" />
              <Skeleton className="h-[16px] w-[80px] rounded-md" />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Skeleton className="h-[1.25rem] w-11/12" />
            <Skeleton className="h-[1.25rem] w-2/3" />
          </div>

          <div className="flex flex-col gap-2 mt-3.5">
            <Skeleton className="h-[0.9375rem] w-full" />
            <Skeleton className="h-[0.9375rem] w-4/5" />
          </div>

          <div className="mt-4">
            <Skeleton className="h-[0.875rem] w-[110px]" />
          </div>
        </article>
      ))}
    </>
  );
};

export default ProfileCardSkeleton;
