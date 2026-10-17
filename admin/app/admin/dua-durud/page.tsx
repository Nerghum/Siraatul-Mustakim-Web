"use client";

import React, { useState, useMemo } from "react";
import {
  useChapters,
  useAllDuaItems,
  useCreateDua,
  useUpdateDua,
  useDeleteDua,
} from "@/hooks/use-dua";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { allDuaItemSchema, type AllDuaItemForm } from "@/lib/validations/dua";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
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
import {
  Trash2,
  Loader2,
  Pencil,
  Plus,
  BookHeart,
  X,
  CheckSquare,
  Square,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { DuaItem, DuaChapter } from "@/types/dua";

export default function AllDuaDurudPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const { data: chapters } = useChapters();
  const {
    data: items,
    isLoading,
    isError,
    error,
    refetch,
  } = useAllDuaItems({
    chapterId: selectedCategory === "all" ? undefined : selectedCategory,
    q: search || undefined,
  });

  const createMutation = useCreateDua();
  const updateMutation = useUpdateDua();
  const deleteMutation = useDeleteDua();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<DuaItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const form = useForm<AllDuaItemForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(allDuaItemSchema) as any,
    defaultValues: {
      chapterId: "",
      duaId: "",
      title: "",
      sourceLabel: "",
      sourceLabelBangla: "",
      sourceLabelArabic: "",
      ayahLabel: "",
      arabic: "",
      pronunciation: "",
      translation: "",
      tafsir: "",
      audioUrl: "",
    },
  });

  // Map chapterId to chapter title
  const chapterMap = useMemo(() => {
    const map = new Map<string, string>();
    if (chapters) {
      chapters.forEach((c: DuaChapter) => {
        map.set(c.chapterId, c.title);
      });
    }
    return map;
  }, [chapters]);

  // All current item IDs
  const allCurrentIds = useMemo(() => {
    return items?.map((item) => item.duaId || item._id) || [];
  }, [items]);

  const isAllSelected =
    allCurrentIds.length > 0 &&
    allCurrentIds.every((id) => selectedIds.includes(id));
  const isSomeSelected =
    selectedIds.length > 0 && !isAllSelected;

  function toggleSelectAll() {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allCurrentIds);
    }
  }

  function toggleSelectItem(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  function openCreateModal() {
    setEditItem(null);
    form.reset({
      chapterId:
        selectedCategory !== "all"
          ? selectedCategory
          : chapters?.[0]?.chapterId || "",
      duaId: "",
      title: "",
      sourceLabel: "",
      sourceLabelBangla: "",
      sourceLabelArabic: "",
      ayahLabel: "",
      arabic: "",
      pronunciation: "",
      translation: "",
      tafsir: "",
      audioUrl: "",
    });
    setDialogOpen(true);
  }

  function openEditModal(item: DuaItem) {
    setEditItem(item);
    form.reset({
      chapterId: item.chapterId,
      duaId: item.duaId,
      title: item.title,
      sourceLabel: item.sourceLabel || "",
      sourceLabelBangla: item.sourceLabelBangla || "",
      sourceLabelArabic: item.sourceLabelArabic || "",
      ayahLabel: item.ayahLabel || "",
      arabic: item.arabic,
      pronunciation: item.pronunciation || "",
      translation: item.translation,
      tafsir: item.tafsir || "",
      audioUrl: item.audioUrl || "",
    });
    setDialogOpen(true);
  }

  async function onSubmit(data: AllDuaItemForm) {
    try {
      if (editItem) {
        await updateMutation.mutateAsync({
          id: editItem.duaId || editItem._id,
          data: { ...data },
          chapterId: data.chapterId,
        });
        toast.success("Dua updated successfully");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Dua created successfully");
      }
      setDialogOpen(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to save dua");
    }
  }

  async function handleDeleteSingle() {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync({ id: deleteId });
      toast.success("Dua deleted successfully");
      setSelectedIds((prev) => prev.filter((id) => id !== deleteId));
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete dua");
      setDeleteId(null);
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);
    try {
      await Promise.all(
        selectedIds.map((id) => deleteMutation.mutateAsync({ id }))
      );
      toast.success(`${selectedIds.length} dua(s) deleted successfully`);
      setSelectedIds([]);
      setBulkDeleteOpen(false);
    } catch {
      toast.error("Failed to delete selected duas");
    } finally {
      setIsBulkDeleting(false);
    }
  }

  function clearAllFilters() {
    setSelectedCategory("all");
    setSearch("");
    setSelectedIds([]);
  }

  const hasActiveFilters = selectedCategory !== "all" || search !== "";

  // Columns: Clean, compact, NO Arabic, Pronunciation, Translation, Audio, Serial
  const columns: Column<DuaItem>[] = [
    {
      key: "select",
      header: (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={isAllSelected}
            ref={(input) => {
              if (input) input.indeterminate = isSomeSelected;
            }}
            onChange={toggleSelectAll}
            className="size-4 rounded border-gray-300 text-primary cursor-pointer accent-primary"
            aria-label="Select all"
          />
        </div>
      ),
      className: "w-12 text-center",
      render: (item) => {
        const id = item.duaId || item._id;
        const isChecked = selectedIds.includes(id);
        return (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => toggleSelectItem(id)}
              className="size-4 rounded border-gray-300 text-primary cursor-pointer accent-primary"
              aria-label={`Select ${item.title}`}
            />
          </div>
        );
      },
    },
    {
      key: "title",
      header: "Title",
      sortable: true,
      render: (item) => (
        <div className="py-1">
          <div className="font-medium text-foreground text-sm leading-snug">
            {item.title}
          </div>
          {(item.sourceLabelBangla || item.sourceLabel) && (
            <div className="text-xs text-muted-foreground mt-0.5">
              উৎস: {item.sourceLabelBangla || item.sourceLabel}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "chapterId",
      header: "Category",
      className: "w-48",
      render: (item) => {
        const title = chapterMap.get(item.chapterId) || item.chapterId;
        return (
          <span className="inline-flex items-center text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 px-2.5 py-1 rounded-md">
            {title}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-24 text-right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => openEditModal(item)}
            className="size-8 text-muted-foreground hover:text-foreground"
            title="Edit Dua"
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setDeleteId(item.duaId || item._id)}
            className="size-8 text-destructive hover:bg-destructive/10"
            title="Delete Dua"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">All Dua & Durud</h1>
          <p className="text-sm text-muted-foreground">
            Manage, filter, edit, and delete dua items easily
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/dua-durud/categories">
            <Button variant="outline" size="sm">
              <BookHeart className="size-4 mr-2" />
              Categories
            </Button>
          </Link>
          <Button onClick={openCreateModal} size="sm">
            <Plus className="size-4 mr-2" />
            Add Dua
          </Button>
        </div>
      </div>

      {/* Filter Toolbar matching Boyan / Kitab admin layout */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <BookHeart className="size-4" />
          <span>Category:</span>
        </div>

        {/* Category Select Filter */}
        <Select
          value={selectedCategory}
          onValueChange={(val) => {
            setSelectedCategory(val === "__all__" ? "all" : (val || "all"));
            setSelectedIds([]);
          }}
        >
          <SelectTrigger className="w-56 h-9">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">
              All Categories ({chapters?.length || 0})
            </SelectItem>
            {chapters?.map((ch: DuaChapter) => (
              <SelectItem key={ch.chapterId} value={ch.chapterId}>
                {ch.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-9 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5 mr-1" />
            Clear filter
          </Button>
        )}

        {/* Multi-select / Bulk Delete Option */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 bg-destructive/10 text-destructive px-3 py-1 rounded-md border border-destructive/20 ml-auto">
            <span className="text-xs font-medium">
              {selectedIds.length} selected
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteOpen(true)}
              className="h-7 px-2.5 text-xs"
            >
              <Trash2 className="size-3.5 mr-1" />
              Delete Selected
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds([])}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Deselect
            </Button>
          </div>
        )}
      </div>

      {/* Clean DataTable with Only Checkbox, Title, Category, Actions */}
      <DataTable<DuaItem>
        columns={columns}
        data={items as DuaItem[] | undefined}
        isLoading={isLoading}
        isError={isError}
        error={error as Error | null}
        onRetry={() => refetch()}
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setSelectedIds([]);
        }}
        searchPlaceholder="Search dua by title, keyword..."
        emptyMessage="No duas found"
        emptyDescription="Create your first dua or change your filter selection."
        createHref=""
        createLabel=""
      />

      {/* Create / Edit Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{editItem ? "Edit Dua" : "Add New Dua"}</DialogTitle>
              <DialogDescription>
                {editItem
                  ? "Update dua details, category, pronunciation, and translation."
                  : "Fill in the details to add a new dua."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Category selector */}
              <div className="space-y-2">
                <Label htmlFor="categorySelect">
                  Category / Chapter <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="chapterId"
                  control={form.control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(val) => field.onChange(val || "")}
                    >
                      <SelectTrigger id="categorySelect">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {chapters?.map((ch: DuaChapter) => (
                          <SelectItem key={ch.chapterId} value={ch.chapterId}>
                            {ch.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.chapterId && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.chapterId.message}
                  </p>
                )}
              </div>

              {/* Dua Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. সকালের দুআ"
                  {...form.register("title")}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              {/* Source Labels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sourceLabelBangla">
                    Source / Reference (বাংলা)
                  </Label>
                  <Input
                    id="sourceLabelBangla"
                    placeholder="e.g. সহীহ বুখারী"
                    {...form.register("sourceLabelBangla")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sourceLabel">Source Label (English)</Label>
                  <Input
                    id="sourceLabel"
                    placeholder="e.g. Sahih Bukhari"
                    {...form.register("sourceLabel")}
                  />
                </div>
              </div>

              {/* Arabic text */}
              <div className="space-y-2">
                <Label htmlFor="arabic">
                  Arabic Text <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="arabic"
                  control={form.control}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="আরবী টেক্সট..."
                      dir="rtl"
                    />
                  )}
                />
                {form.formState.errors.arabic && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.arabic.message}
                  </p>
                )}
              </div>

              {/* Pronunciation */}
              <div className="space-y-2">
                <Label htmlFor="pronunciation">
                  Pronunciation (বাংলা উচ্চারণ - optional)
                </Label>
                <Controller
                  name="pronunciation"
                  control={form.control}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="উচ্চারণ বাংলায়..."
                    />
                  )}
                />
              </div>

              {/* Translation */}
              <div className="space-y-2">
                <Label htmlFor="translation">
                  Translation (অর্থ) <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="translation"
                  control={form.control}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="অনুবাদ ও অর্থ বাংলায়..."
                    />
                  )}
                />
                {form.formState.errors.translation && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.translation.message}
                  </p>
                )}
              </div>

              {/* Tafsir */}
              <div className="space-y-2">
                <Label htmlFor="tafsir">
                  Tafsir / Note (ফযিলত বা ব্যাখ্যা - optional)
                </Label>
                <Controller
                  name="tafsir"
                  control={form.control}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="ফযিলত বা বিস্তারিত ব্যাখ্যা..."
                    />
                  )}
                />
              </div>

              {/* Audio URL */}
              <div className="space-y-2">
                <Label htmlFor="audioUrl">
                  Audio URL (অডিও লিঙ্ক - optional)
                </Label>
                <Input
                  id="audioUrl"
                  placeholder="https://... or /files/..."
                  {...form.register("audioUrl")}
                />
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
                {editItem ? "Update Dua" : "Create Dua"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Single Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => {
          if (!o) setDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Dua</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this dua? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteSingle}
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

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Duas</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.length} selected
              dua(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
            >
              {isBulkDeleting && (
                <Loader2 className="size-4 mr-2 animate-spin" />
              )}
              Delete {selectedIds.length} Items
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
