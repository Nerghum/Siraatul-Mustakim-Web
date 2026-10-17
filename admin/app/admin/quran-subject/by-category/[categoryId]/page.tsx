"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  useQuranSubjectByCategory,
  useDeleteQuranSubject,
} from "@/hooks/use-quran-subject";
import { DataTable, type Column } from "@/components/shared/data-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Eye, Trash2, Loader2, Pencil } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { QuranSubject } from "@/types/quran-subject";
import { Button } from "@/components/ui/button";
import { stripHtml } from "@/lib/utils";

export default function CategorySubjectsPage() {
  const params = useParams();
  const categoryId = Number(params.categoryId);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading, isError, error, refetch } =
    useQuranSubjectByCategory(categoryId);
  const deleteMutation = useDeleteQuranSubject();

  async function handleDelete() {
    if (deleteId === null) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("Subject deleted");
      setDeleteId(null);
      refetch();
    } catch {
      toast.error("Failed to delete subject");
      setDeleteId(null);
    }
  }

  const categoryTitle =
    data && data.length > 0 ? data[0].category_title : "Category";

  const columns: Column<QuranSubject>[] = [
    {
      key: "id",
      header: "ID",
      render: (item) => <span className="font-medium">{item.id}</span>,
    },
    {
      key: "surah",
      header: "Surah",
      render: (item) => (
        <span>
          {item.surah_id}. {item.surah_title?.bn || item.surah_title?.en || ""}
        </span>
      ),
    },
    {
      key: "verse_number",
      header: "Verse",
      render: (item) => <span>{item.verse_number}</span>,
    },
    {
      key: "verse_text",
      header: "Verse Text",
      render: (item) => (
        <span className="line-clamp-1 max-w-xs">
          {stripHtml(item.verse_text.slice(0, 30))}...
        </span>
      ),
    },
    {
      key: "author",
      header: "Author",
      render: (item) => item.author || <span className="">—</span>,
    },
    {
      key: "actions",
      header: "Actions",
      render: (item) => (
        <div className="flex items-center gap-1">
          <Link
            href={`/admin/quran-subject/${item.id}`}
            className="inline-flex items-center justify-center size-8 rounded-md "
            title="View"
          >
            <Eye className="size-4" />
          </Link>
          <Link
            href={`/admin/quran-subject/${item.id}/edit`}
            className="inline-flex items-center justify-center size-8 rounded-md "
            title="Edit"
          >
            <Pencil className="size-4" />
          </Link>
          <Button
            type="button"
            onClick={() => setDeleteId(item.id)}
            className="inline-flex items-center justify-center size-8 rounded-md bg-red-500 hover:bg-destructive !text-white "
            title="Delete"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Link
        href="/admin/quran-subject"
        className="inline-flex items-center gap-1   hover:text-foreground transition-colors"
      >
        <svg
          className="size-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Categories
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{categoryTitle}</h1>
        <Link
          href="/admin/quran-subject/create"
          className="inline-flex items-center justify-center h-8 px-2.5 rounded-lg bg-primary text-primary-foreground  font-medium whitespace-nowrap hover:bg-primary/80 transition-colors"
        >
          <svg
            className="size-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Subject
        </Link>
      </div>

      <DataTable<QuranSubject>
        columns={columns}
        data={data as QuranSubject[] | undefined}
        isLoading={isLoading}
        isError={isError}
        error={error as Error | null}
        onRetry={() => refetch()}
        emptyMessage="No subjects in this category"
        emptyDescription="Add a new subject to this category."
      />

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subject</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this subject? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="size-4 mr-2 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
