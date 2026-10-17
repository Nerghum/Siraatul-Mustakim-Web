"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { adminNavGroups, adminNavItems } from "./nav-items";

export function Sidebar() {
  const pathname = usePathname();
  const userRole = useAuthStore((s) => s.user?.role) as string | undefined;

  return (
    <aside className="relative flex h-screen flex-col border-r border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white w-72 px-4 py-5">
      <div className="mb-8 flex items-center justify-between px-3">
        <div className="min-w-0 flex-1">
          <Link
            href="/admin"
            className="block truncate text-xl font-bold text-slate-950 dark:text-white"
          >
            Siraatul Mustakim
          </Link>
          <p className="truncate text-sm text-slate-500">
            Admin Console
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {adminNavGroups.map((group) => {
          const groupItems = adminNavItems
            .filter((item) => item.group === group)
            .filter((item) => !item.roles || (userRole && item.roles.includes(userRole)));

          if (groupItems.length === 0) return null;

          return (
            <div key={group} className="space-y-1">
              <div className="px-3 pt-4 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                {group}
              </div>
              {groupItems.map((item) => {
                const isAnySubActive = item.subItems?.some(
                  (sub) => pathname === sub.href || pathname.startsWith(sub.href + "/")
                );
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/") ||
                  Boolean(isAnySubActive);
                return (
                  <div key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                        isActive
                          ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-100"
                          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      )}
                    >
                      <item.icon className="size-[18px] shrink-0" />
                      <span className="min-w-0 flex-1 truncate">
                        {item.label}
                      </span>
                    </Link>
                    {item.subItems && (
                      <div className="ml-8 mt-1 space-y-1">
                        {item.subItems.map((subItem) => {
                          const isSubActive =
                            pathname === subItem.href ||
                            (subItem.href !== item.href &&
                              pathname.startsWith(subItem.href + "/"));
                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className={cn(
                                "block rounded-lg px-3 py-2 text-sm font-medium transition",
                                isSubActive
                                  ? "bg-slate-100 text-brand-700 dark:bg-slate-800 dark:text-brand-100"
                                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-300"
                              )}
                            >
                              {subItem.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
