"use client";

import { useMemo } from "react";
import { useQuranSubjectList } from "@/hooks/use-quran-subject";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookText, Plus, Search } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";

export default function QuranSubjectListPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, error, refetch } = useQuranSubjectList();

  const grouped = useMemo(() => {
    if (!data) return [];
    const map = new Map<number, { id: number; title: string; count: number }>();
    const filtered = search
      ? data.filter((s) =>
          s.category_title.toLowerCase().includes(search.toLowerCase()),
        )
      : data;
    filtered.forEach((s) => {
      const existing = map.get(s.category_id);
      if (existing) {
        existing.count++;
      } else {
        map.set(s.category_id, {
          id: s.category_id,
          title: s.category_title,
          count: 1,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.id - b.id);
  }, [data, search]);

  if (isError) {
    return (
      <ErrorState
        message={error?.message || "Something went wrong"}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quran Subjects</h1>
        <Link
          href="/admin/quran-subject/create"
          className="inline-flex items-center justify-center h-8 px-2.5 rounded-lg bg-primary text-primary-foreground  font-medium whitespace-nowrap hover:bg-primary/80 transition-colors"
        >
          <Plus className="size-4 mr-2" />
          Add Subject
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 " />
        <Input
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <EmptyState
          message="No categories found"
          description={
            search
              ? "Try a different search term."
              : "Create your first subject to get started."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {grouped.map((cat) => (
            <Link
              key={cat.id}
              href={`/admin/quran-subject/by-category/${cat.id}`}
            >
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookText className="size-4  shrink-0" />
                    <span className="line-clamp-1">{cat.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary">{cat.count}</p>
                  <p className="text-xs  mt-1">
                    {cat.count === 1 ? "subject" : "subjects"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
