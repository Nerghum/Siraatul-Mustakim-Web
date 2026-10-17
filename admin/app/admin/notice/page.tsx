"use client";

import { useState } from "react";
import { useNoticeList, useDeleteNotice } from "@/hooks/use-notice";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
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
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { Notice } from "@/types/notice";

export default function NoticeListPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const params: Record<string, string | number | undefined> = {};
  if (search) params.search = search;

  const { data, isLoading, isError, error, refetch } = useNoticeList(params);
  const deleteMutation = useDeleteNotice();

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("Notice deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete notice");
      setDeleteId(null);
    }
  }

  const columns: Column<Notice>[] = [
    {
      key: "title",
      header: "Title",
      render: (item) => (
        <span className="line-clamp-1 font-medium">{item.title}</span>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (item) => formatDate(item.date),
    },
    {
      key: "image",
      header: "Image",
      render: (item) =>
        item.image ? (
          <Badge variant="default">Has Image</Badge>
        ) : (
          <Badge variant="secondary">No Image</Badge>
        ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (item) => formatDate(item.createdAt),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item) => (
        <div className="flex items-center gap-1">
          <Link
            href={`/admin/notice/${item._id}`}
            className="inline-flex items-center justify-center size-8 rounded-md "
            title="View"
          >
            <Eye className="size-4" />
          </Link>
          <Link
            href={`/admin/notice/${item._id}/edit`}
            className="inline-flex items-center justify-center size-8 rounded-md "
            title="Edit"
          >
            <Pencil className="size-4" />
          </Link>
          <button
            type="button"
            onClick={() => setDeleteId(item._id)}
            className="inline-flex items-center justify-center size-8 rounded-md "
            title="Delete"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Notice</h1>
      <DataTable<Notice>
        columns={columns}
        data={data as Notice[] | undefined}
        isLoading={isLoading}
        isError={isError}
        error={error as Error | null}
        onRetry={() => refetch()}
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search notices..."
        createHref="/admin/notice/create"
        createLabel="Add Notice"
        page={page}
        totalPages={1}
        emptyMessage="No notices found"
        emptyDescription="Create your first notice to get started."
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => {
          if (!o) setDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this notice? This action cannot be
              undone.
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
