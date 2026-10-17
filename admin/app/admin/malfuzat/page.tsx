"use client";

import { useState } from "react";
import { useMalfuzatList, useDeleteMalfuzat } from "@/hooks/use-malfuzat";
import { DataTable, type Column } from "@/components/shared/data-table";
import { DeleteModal } from "@/components/shared/delete-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Trash2, Headphones, FileText } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { Malfuzat } from "@/types/malfuzat";

export default function MalfuzatPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const params: Record<string, string | number | undefined> = {};
  if (search) params.search = search;
  params.page = page;

  const { data, isLoading, isError, error, refetch } = useMalfuzatList(params);
  const deleteMutation = useDeleteMalfuzat();

  function handleDelete() {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Malfuzat deleted");
        setDeleteId(null);
      },
      onError: () => toast.error("Failed to delete malfuzat"),
    });
  }

  const columns: Column<Malfuzat>[] = [
    {
      key: "mode",
      header: "Mode",
      render: (item) =>
        item.mode === "audio" ? (
          <Badge variant="default" className="gap-1">
            <Headphones className="size-3" />
            Audio
          </Badge>
        ) : (
          <Badge variant="secondary" className="gap-1">
            <FileText className="size-3" />
            Text
          </Badge>
        ),
    },
    { key: "title", header: "Title", sortable: true },
    { key: "category", header: "Category", sortable: true },
    {
      key: "author",
      header: "Author",
      render: (item) => item.author || "-",
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
            href={`/admin/malfuzat/${item._id}`}
            className="inline-flex items-center justify-center size-8 rounded-md"
          >
            <Eye className="size-4" />
          </Link>
          <Link
            href={`/admin/malfuzat/${item._id}/edit`}
            className="inline-flex items-center justify-center size-8 rounded-md"
          >
            <Pencil className="size-4" />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-destructive"
            onClick={() => setDeleteId(item._id)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Malfuzat</h1>
      <DataTable<Malfuzat>
        columns={columns}
        data={data?.items as Malfuzat[] | undefined}
        isLoading={isLoading}
        isError={isError}
        error={error as Error | null}
        onRetry={() => refetch()}
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search malfuzat..."
        createHref="/admin/malfuzat/create"
        createLabel="Add Malfuzat"
        page={page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
        emptyMessage="No malfuzat found"
        emptyDescription="Create your first malfuzat to get started."
      />
      <DeleteModal
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
