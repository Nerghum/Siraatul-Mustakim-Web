"use client";

import { useState } from "react";
import { useMasailList, useDeleteMasail } from "@/hooks/use-masail";
import { useAuthStore } from "@/store/auth-store";
import { DataTable, type Column } from "@/components/shared/data-table";
import { DeleteModal } from "@/components/shared/delete-modal";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { formatDate, stripHtml } from "@/lib/utils";
import { toast } from "sonner";
import type { Masail } from "@/types/masail";

export default function MasailListPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const params: Record<string, string | number | undefined> = {};
  if (search) params.search = search;

  const { data, isLoading, isError, error, refetch } = useMasailList(params);
  const deleteMutation = useDeleteMasail();
  function handleDelete() {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Masail deleted");
        setDeleteId(null);
      },
      onError: () => toast.error("Failed to delete masail"),
    });
  }

  const columns: Column<Masail>[] = [
    { key: "title", header: "Title", sortable: true },
    {
      key: "description",
      header: "Description",
      render: (item) => (
        <span className="line-clamp-1">
          {stripHtml(item.description).slice(0, 20)}
        </span>
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
            href={`/admin/masail/${item._id}`}
            className="inline-flex items-center justify-center size-8 rounded-md "
          >
            <Eye className="size-4" />
          </Link>
          <Link
            href={`/admin/masail/${item._id}/edit`}
            className="inline-flex items-center justify-center size-8 rounded-md "
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
      <h1 className="text-2xl font-bold">Masail</h1>
      <DataTable<Masail>
        columns={columns}
        data={data as Masail[] | undefined}
        isLoading={isLoading}
        isError={isError}
        error={error as Error | null}
        onRetry={() => refetch()}
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search masail..."
        createHref="/admin/masail/create"
        createLabel="Add Masail"
        page={page}
        totalPages={1}
        emptyMessage="No masail found"
        emptyDescription="Create your first masail to get started."
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
