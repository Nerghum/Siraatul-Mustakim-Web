"use client";

import { useState } from "react";
import { useMasailCategories, useCreateMasailCategory, useUpdateMasailCategory, useDeleteMasailCategory } from "@/hooks/use-masail";
import { useAuthStore } from "@/store/auth-store";
import { DataTable, type Column } from "@/components/shared/data-table";
import { DeleteModal } from "@/components/shared/delete-modal";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import type { MasailCategory } from "@/types/masail";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function MasailCategoriesPage() {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<MasailCategory | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const { data, isLoading, isError, error, refetch } = useMasailCategories();
  const deleteMutation = useDeleteMasailCategory();
  const createMutation = useCreateMasailCategory();
  const updateMutation = useUpdateMasailCategory();

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
      updateMutation.mutate({ id: editItem.id || editItem._id, data: { name, slug } }, {
        onSuccess: () => {
          toast.success("Category updated");
          setEditItem(null);
        },
        onError: () => toast.error("Failed to update category"),
      });
    } else {
      createMutation.mutate({ name, slug }, {
        onSuccess: () => {
          toast.success("Category created");
          setIsAddOpen(false);
        },
        onError: () => toast.error("Failed to create category"),
      });
    }
  }

  const columns: Column<MasailCategory>[] = [
    { key: "name", header: "Name", sortable: true },
    { key: "slug", header: "Slug", sortable: true },
    { key: "count", header: "Total Masail", sortable: true },
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Masail Categories</h1>
          <Button onClick={() => {
            setName("");
            setSlug("");
            setIsAddOpen(true);
          }}>
            <Plus className="mr-2 size-4" /> Add Category
          </Button>
      </div>
      
      <DataTable<MasailCategory>
        columns={columns}
        data={data as MasailCategory[] | undefined}
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

      <Dialog open={isAddOpen || !!editItem} onOpenChange={(open) => {
        if (!open) {
          setIsAddOpen(false);
          setEditItem(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Iman" />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. iman" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddOpen(false);
              setEditItem(null);
            }}>Cancel</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
