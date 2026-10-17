"use client";

import { useState } from "react";
import { useAdList, useDeleteAd, useUpdateAd } from "@/hooks/use-ad";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { toast } from "sonner";
import { Eye, Pencil, Trash2, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { AD_PLACEMENTS, type Ad } from "@/types/ad";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
const BACKEND_URL = API_BASE.replace("/api", "");

function placementLabel(key: string): string {
  const found = AD_PLACEMENTS.find((p) => p.id === key);
  return found ? found.label.split("(")[0].trim() : key;
}

export default function AdListPage() {
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useAdList(
    search ? { q: search } : undefined
  );
  const deleteMutation = useDeleteAd();
  const updateMutation = useUpdateAd();

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("Advertisement deleted successfully");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete advertisement");
    }
  }

  async function handleToggleStatus(ad: Ad) {
    try {
      await updateMutation.mutateAsync({
        id: ad._id,
        data: { isActive: !ad.isActive },
      });
      toast.success(`Ad ${!ad.isActive ? "activated" : "deactivated"}`);
    } catch {
      toast.error("Failed to update status");
    }
  }

  const columns: Column<Ad>[] = [
    {
      key: "image",
      header: "Banner",
      render: (item) => (
        <div className="relative size-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center border shrink-0">
          {item.image ? (
            <img
              src={item.image.startsWith("http") ? item.image : `${BACKEND_URL}${item.image}`}
              alt={item.title}
              className="size-full object-cover"
            />
          ) : (
            <Sparkles className="size-5 text-muted-foreground" />
          )}
        </div>
      ),
    },
    {
      key: "title",
      header: "Ad Details",
      render: (item) => (
        <div className="max-w-[260px] space-y-1">
          <p className="font-semibold text-sm line-clamp-1">{item.title}</p>
          {item.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
          )}
          {item.link && (
            <p className="text-xs text-primary truncate max-w-[220px]">
              {item.link}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "placements",
      header: "Target Placements",
      render: (item) => (
        <div className="flex flex-wrap gap-1 max-w-[280px]">
          {item.placements?.includes("all") ? (
            <Badge variant="default" className="text-xs bg-emerald-600">
              সব পেজে (All Pages)
            </Badge>
          ) : (
            item.placements?.map((p) => (
              <Badge key={p} variant="secondary" className="text-xs">
                {placementLabel(p)}
              </Badge>
            ))
          )}
        </div>
      ),
    },
    {
      key: "clicks",
      header: "Clicks",
      render: (item) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted">
          {item.clicks || 0}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={item.isActive}
            onCheckedChange={() => handleToggleStatus(item)}
            disabled={updateMutation.isPending}
          />
          <span className="text-xs text-muted-foreground">
            {item.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/admin/ads/${item._id}`}
            className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            <Eye className="size-4" />
          </Link>
          <Link
            href={`/admin/ads/${item._id}/edit`}
            className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            <Pencil className="size-4" />
          </Link>
          <button
            type="button"
            className="p-1.5 hover:bg-muted rounded-md text-destructive transition-colors cursor-pointer"
            onClick={() => setDeleteId(item._id)}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Advertisements</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage ads, and select target placement locations where they should show.
          </p>
        </div>
        <Link
          href="/admin/ads/create"
          className={buttonVariants({ variant: "default" })}
        >
          <Sparkles className="size-4 mr-2" />
          Add Advertisement
        </Link>
      </div>

      <DataTable<Ad>
        columns={columns}
        data={data as Ad[] | undefined}
        isLoading={isLoading}
        isError={isError}
        error={error as Error | null}
        onRetry={() => refetch()}
        searchValue={search}
        onSearchChange={(v) => setSearch(v)}
        searchPlaceholder="Search ads by title or link..."
        createHref="/admin/ads/create"
        createLabel="Add Advertisement"
        emptyMessage="No advertisements found"
        emptyDescription="Create your first advertisement and select where to display it."
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => {
          if (!o) setDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Advertisement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this advertisement? This action cannot be undone.
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
