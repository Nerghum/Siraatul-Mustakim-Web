"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  useChapterItems,
  useCreateDua,
  useUpdateDua,
  useDeleteDua,
} from "@/hooks/use-dua";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { duaItemSchema, type DuaItemForm } from "@/lib/validations/dua";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
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
import { ArrowLeft, Trash2, Loader2, Pencil, Plus, Headphones } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import type { DuaItem } from "@/types/dua";
import { stripHtml } from "@/lib/utils";

export default function ChapterItemsPage() {
  const params = useParams();
  const chapterId = params.chapterId as string;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<DuaItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<{
    id: string;
    chapterId: string;
  } | null>(null);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useChapterItems(
    chapterId,
    search || undefined,
  );
  const createMutation = useCreateDua();
  const updateMutation = useUpdateDua();
  const deleteMutation = useDeleteDua();

  const form = useForm<DuaItemForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(duaItemSchema) as any,
    defaultValues: {
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

  const chapter = data?.chapter;
  const items = data?.items;

  function openCreateModal() {
    setEditItem(null);
    form.reset({
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

  async function onSubmit(data: DuaItemForm) {
    try {
      if (editItem) {
        await updateMutation.mutateAsync({
          id: editItem.duaId,
          chapterId: chapterId,
          data: {
            title: data.title,
            sourceLabel: data.sourceLabel || undefined,
            sourceLabelBangla: data.sourceLabelBangla || undefined,
            sourceLabelArabic: data.sourceLabelArabic || undefined,
            ayahLabel: data.ayahLabel || undefined,
            arabic: data.arabic,
            pronunciation: data.pronunciation || undefined,
            translation: data.translation,
            tafsir: data.tafsir || undefined,
            audioUrl: data.audioUrl || undefined,
          },
        });
        toast.success("Dua updated");
      } else {
        await createMutation.mutateAsync({
          duaId: data.duaId,
          chapterId: chapterId,
          title: data.title,
          sourceLabel: data.sourceLabel || "",
          sourceLabelBangla: data.sourceLabelBangla || undefined,
          sourceLabelArabic: data.sourceLabelArabic || undefined,
          ayahLabel: data.ayahLabel || undefined,
          arabic: data.arabic,
          pronunciation: data.pronunciation || undefined,
          translation: data.translation,
          tafsir: data.tafsir || undefined,
          audioUrl: data.audioUrl || undefined,
        });
        toast.success("Dua created");
      }
      setDialogOpen(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Operation failed");
    }
  }

  async function handleDelete() {
    if (!deleteItem) return;
    try {
      await deleteMutation.mutateAsync({
        id: deleteItem.id,
        chapterId: deleteItem.chapterId,
      });
      toast.success("Dua deleted");
      setDeleteItem(null);
    } catch {
      toast.error("Failed to delete dua");
      setDeleteItem(null);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !chapter) {
    return (
      <div className="text-center py-12">
        <p className="">Chapter not found</p>
        <Link
          href="/admin/dua-durud"
          className="inline-flex items-center justify-center h-7 px-2.5 rounded-lg border border-border  font-medium  mt-4"
        >
          Back to Chapters
        </Link>
      </div>
    );
  }

  const columns: Column<DuaItem>[] = [
    {
      key: "serial",
      header: "#",
      render: (item) => <span className=" ">{item.serial}</span>,
    },
    {
      key: "title",
      header: "Title",
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-medium">{item.title}</span>
          {item.sourceLabelBangla && (
            <span className="text-xs text-muted-foreground">{item.sourceLabelBangla}</span>
          )}
        </div>
      ),
    },
    {
      key: "arabic",
      header: "Arabic",
      render: (item) => (
        <span dir="rtl" className="text-base line-clamp-1 font-arabic">
          {stripHtml(item.arabic).slice(0, 30)}
        </span>
      ),
    },
    {
      key: "pronunciation",
      header: "Pronunciation",
      render: (item) => (
        <span className="line-clamp-1 text-xs text-muted-foreground">
          {item.pronunciation ? stripHtml(item.pronunciation).slice(0, 30) : "-"}
        </span>
      ),
    },
    {
      key: "translation",
      header: "Translation",
      render: (item) => (
        <span className="line-clamp-1 text-xs">
          {stripHtml(item.translation).slice(0, 30)}
        </span>
      ),
    },
    {
      key: "audioUrl",
      header: "Audio",
      render: (item) =>
        item.audioUrl ? (
          <span className="inline-flex items-center gap-1 text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">
            <Headphones className="size-3" /> Yes
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item) => (
        <div className="flex items-center gap-1">
          <Button
            type="button"
            onClick={() => openEditModal(item)}
            className="inline-flex items-center justify-center size-8 rounded-md "
            title="Edit"
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            onClick={() => setDeleteItem({ id: item.duaId, chapterId })}
            className="inline-flex items-center justify-center size-8 rounded-md  transition-colors"
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
        <Link
          href="/admin/dua-durud/categories"
          className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Categories
        </Link>
        <Button onClick={openCreateModal}>
          <Plus className="size-4 mr-2" />
          Add Dua
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">{chapter.title}</h1>
        <p className=" ">Chapter Slug: {chapter.chapterId}</p>
      </div>

      <DataTable<DuaItem>
        columns={columns}
        data={items as DuaItem[] | undefined}
        isLoading={false}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by title..."
        emptyMessage="No duas in this chapter"
        emptyDescription="Add your first dua to this chapter."
        createHref=""
        createLabel=""
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{editItem ? "Edit Dua" : "Create Dua"}</DialogTitle>
              <DialogDescription>
                {editItem
                  ? "Update the dua details."
                  : "Add a new dua to this chapter."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {editItem ? (
                <div className="space-y-2">
                  <Label htmlFor="duaId">Dua ID</Label>
                  <Input id="duaId" value={form.watch("duaId")} readOnly />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="duaId">Dua ID (auto-generated)</Label>
                  <Input
                    id="duaId"
                    placeholder="auto-generated from source label"
                    value={form.watch("duaId")}
                    readOnly
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="duaTitle">Title</Label>
                <Input
                  id="duaTitle"
                  placeholder="Dua title"
                  {...form.register("title")}
                />
                {form.formState.errors.title && (
                  <p className=" text-destructive">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sourceLabel">Source Label (English)</Label>
                  <Input
                    id="sourceLabel"
                    placeholder="e.g. Sahih Bukhari"
                    {...form.register("sourceLabel", {
                      onChange: (e) => {
                        if (!editItem) {
                          const slug = e.target.value
                            .toLowerCase()
                            .trim()
                            .replace(/\s+/g, "-")
                            .replace(/[^a-z0-9-]/g, "")
                            .replace(/-+/g, "-")
                            .replace(/^-|-$/g, "");
                          form.setValue("duaId", slug);
                        }
                      },
                    })}
                  />
                  {form.formState.errors.sourceLabel && (
                    <p className=" text-destructive">
                      {form.formState.errors.sourceLabel.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sourceLabelBangla">
                    Source Label (Bangla)
                  </Label>
                  <Input
                    id="sourceLabelBangla"
                    placeholder="e.g. সহীহ বুখারী"
                    {...form.register("sourceLabelBangla")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sourceLabelArabic">
                    Source Label (Arabic)
                  </Label>
                  <Input
                    id="sourceLabelArabic"
                    dir="rtl"
                    placeholder="e.g. صحيح البخاري"
                    {...form.register("sourceLabelArabic")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ayahLabel">Ayah Label (optional)</Label>
                  <Input
                    id="ayahLabel"
                    placeholder="e.g. 2:255"
                    {...form.register("ayahLabel")}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="arabic">Arabic Text</Label>
                <Controller
                  name="arabic"
                  control={form.control}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Arabic text..."
                      dir="rtl"
                    />
                  )}
                />
                {form.formState.errors.arabic && (
                  <p className=" text-destructive">
                    {form.formState.errors.arabic.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Pronunciation (বাংলা উচ্চারণ - optional)</Label>
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
              <div className="space-y-2">
                <Label>Translation (অর্থ)</Label>
                <Controller
                  name="translation"
                  control={form.control}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Translation in Bengali/English..."
                    />
                  )}
                />
                {form.formState.errors.translation && (
                  <p className=" text-destructive">
                    {form.formState.errors.translation.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Tafsir / Note (ফযিলত বা ব্যাখ্যা - optional)</Label>
                <Controller
                  name="tafsir"
                  control={form.control}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Explanation or commentary..."
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="audioUrl">Audio URL (অডিও লিঙ্ক - optional)</Label>
                <Input
                  id="audioUrl"
                  placeholder="https://... or /files/..."
                  {...form.register("audioUrl")}
                />
                <p className="text-xs text-muted-foreground">
                  Provide an audio file URL if available for listening on web and app.
                </p>
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

      <AlertDialog
        open={!!deleteItem}
        onOpenChange={(o) => {
          if (!o) setDeleteItem(null);
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
