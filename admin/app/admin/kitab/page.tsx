"use client";

import { useState } from "react";
import { useKitabList, useDeleteKitab } from "@/hooks/use-kitab";
import { DataTable, type Column } from "@/components/shared/data-table";
import { DeleteModal } from "@/components/shared/delete-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { Kitab } from "@/types/kitab";

export default function KitabListPage() {
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const params: Record<string, string | number | undefined> = {};
  if (search) params.search = search;
  if (sortBy) params.sort = sortBy;
  if (sortOrder) params.order = sortOrder;

  const { data, isLoading, isError, error, refetch } = useKitabList(params);
  
  const deleteMutation = useDeleteKitab();
  function handleSort(key: string) {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  }

  function handleDelete() {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Kitab deleted");
        setDeleteId(null);
      },
      onError: () => toast.error("Failed to delete kitab"),
    });
  }

  const columns: Column<Kitab>[] = [
    { key: "title", header: "Title", sortable: true },
    { key: "author", header: "Author", sortable: true },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <Badge variant={item.status === "published" ? "default" : "secondary"}>
          {item.status}
        </Badge>
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
            href={`/admin/kitab/${item._id}`}
            className="inline-flex items-center justify-center size-8 rounded-md "
          >
            <Eye className="size-4" />
          </Link>
          <Link
            href={`/admin/kitab/${item._id}/edit`}
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
      <h1 className="text-2xl font-bold">Kitab (Books)</h1>
      <DataTable<Kitab>
        columns={columns}
        data={(data ?? []) as Kitab[]}
        isLoading={isLoading}
        isError={isError}
        error={error as Error | null}
        onRetry={() => refetch()}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search kitab..."
        createHref="/admin/kitab/create"
        createLabel="Add Kitab"
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyMessage="No kitab found"
        emptyDescription="Create your first kitab to get started."
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
