"use client";

import React, { useState } from "react";
import {
  useChapters,
  useCreateChapter,
  useUpdateChapter,
  useDeleteChapter,
} from "@/hooks/use-dua";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { chapterSchema, type ChapterForm } from "@/lib/validations/dua";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Eye, Trash2, Loader2, Pencil, BookHeart } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { DuaChapter } from "@/types/dua";

const ICON_OPTIONS = [
  { value: "BookHeart", label: "BookHeart" },
  { value: "BookOpen", label: "BookOpen" },
  { value: "Book", label: "Book" },
  { value: "Heart", label: "Heart" },
  { value: "Star", label: "Star" },
  { value: "Sun", label: "Sun" },
  { value: "Moon", label: "Moon" },
  { value: "Hand", label: "Hand" },
  { value: "Feather", label: "Feather" },
  { value: "Scroll", label: "Scroll" },
  { value: "Bookmark", label: "Bookmark" },
  { value: "Sparkles", label: "Sparkles" },
  { value: "Diamond", label: "Diamond" },
  { value: "Crown", label: "Crown" },
  { value: "Shield", label: "Shield" },
  { value: "Leaf", label: "Leaf" },
];

export default function DuaCategoriesPage() {
  const [search, setSearch] = useState("");
  const {
    data: chapters,
    isLoading,
    isError,
    error,
    refetch,
  } = useChapters(search || undefined);
  const createMutation = useCreateChapter();
  const updateMutation = useUpdateChapter();
  const deleteMutation = useDeleteChapter();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editChapter, setEditChapter] = useState<DuaChapter | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = useState("BookHeart");

  const form = useForm<ChapterForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(chapterSchema) as any,
    defaultValues: {
      chapterId: "",
      title: "",
      icon: "BookHeart",
    },
  });

  function openCreateModal() {
    setEditChapter(null);
    setSelectedIcon("BookHeart");
    form.reset({
      chapterId: "",
      title: "",
      icon: "BookHeart",
    });
    setDialogOpen(true);
  }

  function openEditModal(chapter: DuaChapter) {
    setEditChapter(chapter);
    setSelectedIcon(chapter.icon);
    form.reset({
      chapterId: chapter.chapterId,
      title: chapter.title,
      icon: chapter.icon,
    });
    setDialogOpen(true);
  }

  async function onSubmit(data: ChapterForm) {
    try {
      if (editChapter) {
        await updateMutation.mutateAsync({
          chapterId: editChapter.chapterId,
          data: { title: data.title, icon: data.icon },
        });
        toast.success("Category updated");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Category created");
      }
      setDialogOpen(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Operation failed");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("Category deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete category");
      setDeleteId(null);
    }
  }

  const columns: Column<DuaChapter>[] = [
    {
      key: "title",
      header: "Category Name",
      render: (item) => (
        <Link
          href={`/admin/dua-durud/${item.chapterId}`}
          className="font-medium hover:text-primary transition-colors"
        >
          {item.title}
        </Link>
      ),
    },
    {
      key: "chapterId",
      header: "Slug / ID",
      render: (item) => (
        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
          {item.chapterId}
        </code>
      ),
    },
    {
      key: "icon",
      header: "Icon",
      render: (item) => (
        <span className="text-xs text-muted-foreground">{item.icon}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item) => (
        <div className="flex items-center gap-1">
          <Link
            href={`/admin/dua-durud/${item.chapterId}`}
            className="inline-flex items-center justify-center size-8 rounded-md hover:bg-muted"
            title="View Items"
          >
            <Eye className="size-4" />
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => openEditModal(item)}
            className="size-8"
            title="Edit"
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setDeleteId(item.chapterId)}
            className="size-8 text-destructive"
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dua Categories</h1>
          <p className="text-sm text-muted-foreground">
            Manage chapters and categories for Dua & Durud
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <BookHeart className="size-4 mr-2" />
          Add Category
        </Button>
      </div>
      <DataTable<DuaChapter>
        columns={columns}
        data={chapters as DuaChapter[] | undefined}
        isLoading={isLoading}
        isError={isError}
        error={error as Error | null}
        onRetry={() => refetch()}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by title or slug..."
        emptyMessage="No categories found"
        emptyDescription="Create your first category to get started."
        createHref=""
        createLabel=""
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                {editChapter ? "Edit Category" : "Create Category"}
              </DialogTitle>
              <DialogDescription>
                {editChapter
                  ? "Update the category details."
                  : "Add a new dua category/chapter."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="chTitle">Category Name</Label>
                <Input
                  id="chTitle"
                  placeholder="e.g. সকাল-সন্ধ্যার দুআ"
                  {...form.register("title")}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>
              {!editChapter && (
                <div className="space-y-2">
                  <Label htmlFor="chapterId">Category Slug / ID</Label>
                  <Input
                    id="chapterId"
                    placeholder="e.g. morning-evening"
                    value={form.watch("chapterId")}
                    onChange={(e) => {
                      const slug = e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                        .replace(/[^a-z0-9-]/g, "")
                        .replace(/-+/g, "-");
                      form.setValue("chapterId", slug);
                    }}
                  />
                  {form.formState.errors.chapterId && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.chapterId.message}
                    </p>
                  )}
                </div>
              )}
              <div className="space-y-2">
                <Label>Icon</Label>
                <Select
                  value={selectedIcon}
                  onValueChange={(v) => {
                    if (v) {
                      setSelectedIcon(v);
                      form.setValue("icon", v);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.icon && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.icon.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="size-4 mr-2 animate-spin" />
                )}
                {editChapter ? "Update Category" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => {
          if (!o) setDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This will also delete all duas in this category. This
              action cannot be undone.
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
