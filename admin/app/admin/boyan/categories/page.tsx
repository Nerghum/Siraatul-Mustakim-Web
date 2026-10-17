"use client";

import { useState } from "react";
import {
  useBoyanCategories,
  useCreateBoyanCategory,
  useUpdateBoyanCategory,
  useDeleteBoyanCategory,
} from "@/hooks/use-boyan";
import { DataTable, type Column } from "@/components/shared/data-table";
import { DeleteModal } from "@/components/shared/delete-modal";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import type { BoyanCategory } from "@/types/boyan";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function BoyanCategoriesPage() {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<BoyanCategory | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const { data, isLoading, isError, error, refetch } = useBoyanCategories();
  const deleteMutation = useDeleteBoyanCategory();
  const createMutation = useCreateBoyanCategory();
  const updateMutation = useUpdateBoyanCategory();

  function handleDelete() {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Category deleted");
        setDeleteId(null);
      },
      onError: () => toast.error("Failed to delete category"),
    });
  }

  function handleSave() {
    if (!name || !slug) return toast.error("Name and slug are required");

    if (editItem) {
      updateMutation.mutate(
        { id: editItem.id || editItem._id, data: { name, slug } },
        {
          onSuccess: () => {
            toast.success("Category updated");
            setEditItem(null);
          },
          onError: () => toast.error("Failed to update category"),
        }
      );
    } else {
      createMutation.mutate(
        { name, slug },
        {
          onSuccess: () => {
            toast.success("Category created");
            setIsAddOpen(false);
          },
          onError: () => toast.error("Failed to create category"),
        }
      );
    }
  }

  const columns: Column<BoyanCategory>[] = [
    { key: "name", header: "Name", sortable: true },
    { key: "slug", header: "Slug", sortable: true },
    { key: "count", header: "Total Bayan", sortable: true },
    {
      key: "actions",
      header: "Actions",
      render: (item) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => {
              setEditItem(item);
              setName(item.name);
              setSlug(item.slug);
            }}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-destructive"
            onClick={() => setDeleteId(item.id || item._id)}
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
        href="/admin/boyan"
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors text-sm text-muted-foreground"
      >
        <ArrowLeft className="size-4 mr-1" />
        Back to All Bayan
      </Link>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bayan Categories</h1>
        <Button
          onClick={() => {
            setName("");
            setSlug("");
            setIsAddOpen(true);
          }}
        >
          <Plus className="mr-2 size-4" /> Add Category
        </Button>
      </div>

      <DataTable<BoyanCategory>
        columns={columns}
        data={data as BoyanCategory[] | undefined}
        isLoading={isLoading}
        isError={isError}
        error={error as Error | null}
        onRetry={() => refetch()}
        emptyMessage="No categories found"
        emptyDescription="Create your first category to get started."
      />

      <DeleteModal
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />

      <Dialog
        open={isAddOpen || !!editItem}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false);
            setEditItem(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editItem ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!editItem && !slug) {
                    setSlug(
                      e.target.value
                        .toLowerCase()
                        .trim()
                        .replace(/\s+/g, "-")
                        .replace(/[^a-z0-9\-]/g, "")
                    );
                  }
                }}
                placeholder="e.g. তাযকিয়া বা আত্মশুদ্ধি / Tazkiya"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. tazkiya"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddOpen(false);
                setEditItem(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
