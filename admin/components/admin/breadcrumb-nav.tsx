"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";

const labelMap: Record<string, string> = {
  admin: "Dashboard",
  kitab: "Kitab",
  masail: "Masail",
  malfuzat: "Malfuzat",
  boyan: "Boyan",
  faq: "FAQ",
  quran: "Quran",
  "quran-subject": "Quran Subjects",
  "event-schedule": "Bayan Schedule",
  notice: "Notice",
  "dua-durud": "Dua & Durud",
  ads: "Advertisements",
  categories: "Categories",
  users: "Users",
  create: "Create",
  edit: "Edit",
};

export function BreadcrumbNav() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((seg, i) => {
          const href = "/" + segments.slice(0, i + 1).join("/");
          const label = labelMap[seg] || seg;
          const isLast = i === segments.length - 1;
          return (
            <Fragment key={href}>
              <BreadcrumbItem>
                {isLast ? (
                  <span className=" font-medium text-foreground">{label}</span>
                ) : (
                  <Link
                    href={href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </Link>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
