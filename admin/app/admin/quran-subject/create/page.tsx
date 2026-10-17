"use client";

import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  quranSubjectSchema,
  type QuranSubjectForm,
} from "@/lib/validations/quran-subject";
import {
  useCreateQuranSubject,
  useQuranSubjectCategories,
} from "@/hooks/use-quran-subject";
import { useRouter } from "next/navigation";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

export default function CreateQuranSubjectPage() {
  const router = useRouter();
  const createMutation = useCreateQuranSubject();
  const { data: categories } = useQuranSubjectCategories();
  const [catMode, setCatMode] = useState<"select" | "new">("select");
  const [newCatTitle, setNewCatTitle] = useState("");

  const maxCategoryId = useMemo(() => {
    if (!categories || categories.length === 0) return 1;
    return Math.max(...categories.map((c) => c.id)) + 1;
  }, [categories]);

  const categoryMap = useMemo(() => {
    if (!categories) return new Map<number, string>();
    return new Map(categories.map((c) => [c.id, c.title]));
  }, [categories]);

  const form = useForm<QuranSubjectForm>({
    resolver: zodResolver(quranSubjectSchema),
    defaultValues: {
      category_id: undefined as unknown as number,
      category_title: "",
      surah_title_bn: "",
      surah_title_en: "",
      surah_title_ar: "",
      verse_number: undefined as unknown as number,
      verse_text: "",
      author: "",
      bn_meaning: "",
      bn_pronunciation: "",
      tafsir: "",
    },
  });

  function handleCategorySelect(value: string) {
    const catId = Number(value);
    const catTitle = categoryMap.get(catId) || "";
    form.setValue("category_id", catId);
    form.setValue("category_title", catTitle);
  }

  function handleNewCategory(value: string) {
    setNewCatTitle(value);
    form.setValue("category_id", maxCategoryId);
    form.setValue("category_title", value);
  }

  function switchToNewMode() {
    setCatMode("new");
    setNewCatTitle("");
    form.setValue("category_id", maxCategoryId);
    form.setValue("category_title", "");
  }

  function switchToSelectMode() {
    setCatMode("select");
    setNewCatTitle("");
    form.setValue("category_id", undefined as unknown as number);
    form.setValue("category_title", "");
  }

  async function onSubmit(data: QuranSubjectForm) {
    try {
      const payload = {
        category_id: data.category_id,
        category_title: data.category_title,
        surah_title: {
          bn: data.surah_title_bn || "",
          en: data.surah_title_en || "",
          ar: data.surah_title_ar || "",
        },
        verse_number: data.verse_number,
        verse_text: data.verse_text,
        author: data.author || "",
        bn_meaning: data.bn_meaning || "",
        bn_pronunciation: data.bn_pronunciation || "",
        tafsir: data.tafsir || "",
      };
      await createMutation.mutateAsync(payload);
      toast.success("Subject created successfully");
      router.push("/admin/quran-subject");
    } catch (err) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as import("axios").AxiosError<{ error: string }>).response
              ?.data?.error
          : undefined;
      toast.error(message || "Failed to create subject");
    }
  }

  return (
    <div className="space-y-4">
      <Link
        href="/admin/quran-subject"
        className="inline-flex items-center gap-1   hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Quran Subjects
      </Link>
      <h1 className="text-2xl font-bold">Create Subject</h1>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Subject Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Category Selection */}
            <div className="space-y-2">
              <Label>Category</Label>
              {catMode === "select" ? (
                <Select
                  value={String(form.watch("category_id") || "")}
                  onValueChange={(val) => {
                    if (val === "__new__") {
                      switchToNewMode();
                    } else if (val) {
                      handleCategorySelect(val);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.title}
                      </SelectItem>
                    ))}
                    <div className="border-t my-1" />
                    <SelectItem value="__new__">
                      <span className="flex items-center gap-1.5 text-primary">
                        <Plus className="size-3.5" />
                        Add new category...
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Enter new category title..."
                    value={newCatTitle}
                    onChange={(e) => handleNewCategory(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={switchToSelectMode}
                    className="shrink-0"
                  >
                    Cancel
                  </Button>
                </div>
              )}
              {form.formState.errors.category_title && (
                <p className=" text-destructive">
                  {form.formState.errors.category_title.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="verse_number">Verse Number</Label>
              <Input
                id="verse_number"
                type="number"
                placeholder="1"
                {...form.register("verse_number", { valueAsNumber: true })}
              />
              {form.formState.errors.verse_number && (
                <p className=" text-destructive">
                  {form.formState.errors.verse_number.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="surah_title_bn">Surah Title (Bengali)</Label>
              <Input
                id="surah_title_bn"
                placeholder="সূরা নাম"
                {...form.register("surah_title_bn")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="surah_title_en">Surah Title (English)</Label>
                <Input
                  id="surah_title_en"
                  placeholder="Surah name"
                  {...form.register("surah_title_en")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="surah_title_ar">Surah Title (Arabic)</Label>
                <Input
                  id="surah_title_ar"
                  placeholder="اسم السورة"
                  {...form.register("surah_title_ar")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verse_text">Verse Text</Label>
              <Controller
                control={form.control}
                name="verse_text"
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="Verse text..."
                  />
                )}
              />
              {form.formState.errors.verse_text && (
                <p className=" text-destructive">
                  {form.formState.errors.verse_text.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bn_meaning">Bengali Meaning</Label>
              <Controller
                control={form.control}
                name="bn_meaning"
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="Bengali meaning..."
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bn_pronunciation">Bengali Pronunciation</Label>
              <Controller
                control={form.control}
                name="bn_pronunciation"
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="Bengali pronunciation..."
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tafsir">Tafsir</Label>
              <Controller
                control={form.control}
                name="tafsir"
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="Tafsir..."
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                placeholder="Author name"
                {...form.register("author")}
              />
            </div>

            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <Loader2 className="size-4 mr-2 animate-spin" />
              )}
              Create Subject
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
