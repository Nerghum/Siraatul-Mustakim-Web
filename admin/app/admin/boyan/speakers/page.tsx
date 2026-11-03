"use client";

import { useState } from "react";
import {
  useBoyanAuthors,
  useCreateBoyanAuthor,
  useUpdateBoyanAuthor,
  useDeleteBoyanAuthor,
} from "@/hooks/use-boyan";
import { DataTable, type Column } from "@/components/shared/data-table";
import { DeleteModal } from "@/components/shared/delete-modal";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import type { BoyanAuthor } from "@/types/boyan";
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

export default function BoyanSpeakersPage() {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<BoyanAuthor | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [bio, setBio] = useState("");

  const { data, isLoading, isError, error, refetch } = useBoyanAuthors();
  const deleteMutation = useDeleteBoyanAuthor();
  const createMutation = useCreateBoyanAuthor();
  const updateMutation = useUpdateBoyanAuthor();

  function handleDelete() {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Speaker deleted");
        setDeleteId(null);
      },
      onError: () => toast.error("Failed to delete speaker"),
    });
  }

  function handleSave() {
    if (!name.trim()) return toast.error("Speaker name is required");

    if (editItem) {
      updateMutation.mutate(
        { id: editItem.id || editItem._id, data: { name: name.trim(), slug: slug.trim(), bio: bio.trim() } },
        {
          onSuccess: () => {
            toast.success("Speaker updated");
            setEditItem(null);
          },
          onError: () => toast.error("Failed to update speaker"),
        }
      );
    } else {
      createMutation.mutate(
        { name: name.trim(), slug: slug.trim(), bio: bio.trim() },
        {
          onSuccess: () => {
            toast.success("Speaker created");
            setIsAddOpen(false);
          },
          onError: () => toast.error("Failed to create speaker"),
        }
      );
    }
  }

  const columns: Column<BoyanAuthor>[] = [
    { key: "name", header: "Speaker / Author Name", sortable: true },
    {
      key: "count",
      header: "Total Bayan",
      sortable: true,
      render: (item) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
          {item.count ?? 0}
        </span>
      ),
    },
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
              setSlug(item.slug || "");
              setBio(item.bio || "");
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
        <div>
          <h1 className="text-2xl font-bold">Speakers / Authors (বক্তা / আলোচক)</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage bayan speakers and authors so you can select them when adding bayans.
          </p>
        </div>
        <Button
          onClick={() => {
            setName("");
            setSlug("");
            setBio("");
            setIsAddOpen(true);
          }}
        >
          <Plus className="mr-2 size-4" /> Add Speaker
        </Button>
      </div>

      <DataTable<BoyanAuthor>
        columns={columns}
        data={data as BoyanAuthor[] | undefined}
        isLoading={isLoading}
        isError={isError}
        error={error as Error | null}
        onRetry={() => refetch()}
        emptyMessage="No speakers found"
        emptyDescription="Create your first speaker to get started."
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
              {editItem ? "Edit Speaker" : "Add Speaker"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Speaker / Author Name</Label>
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
                placeholder="e.g. হযরত মাওলানা মুহাম্মদ যুবায়ের আহমদ"
              />
            </div>
            <div className="space-y-2">
              <Label>Short Bio / Note (Optional)</Label>
              <Input
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. খতীব, বাইতুল মুকাররম"
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
