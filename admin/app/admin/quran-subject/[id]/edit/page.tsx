"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  quranSubjectSchema,
  type QuranSubjectForm,
} from "@/lib/validations/quran-subject";
import {
  useQuranSubject,
  useUpdateQuranSubject,
  useQuranSubjectCategories,
} from "@/hooks/use-quran-subject";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

export default function EditQuranSubjectPage() {
  const params = useParams();
  const id = Number(params.id);
  const router = useRouter();
  const { data: subject, isLoading } = useQuranSubject(id);
  const updateMutation = useUpdateQuranSubject();
  const { data: categories } = useQuranSubjectCategories();
  const [catInput, setCatInput] = useState("");
  const [catValue, setCatValue] = useState<string | null>(null);

  const categoryMap = useMemo(() => {
    if (!categories) return new Map<number, string>();
    return new Map(categories.map((c) => [c.id, c.title]));
  }, [categories]);

  const maxCategoryId = useMemo(() => {
    if (!categories || categories.length === 0) return 1;
    return Math.max(...categories.map((c) => c.id)) + 1;
  }, [categories]);

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    if (!catInput) return categories;
    return categories.filter((c) =>
      c.title.toLowerCase().includes(catInput.toLowerCase()),
    );
  }, [categories, catInput]);

  const isNewCategory = useMemo(() => {
    if (!catInput) return false;
    return !categories?.some(
      (c) => c.title.toLowerCase() === catInput.toLowerCase(),
    );
  }, [categories, catInput]);

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

  useEffect(() => {
    if (subject) {
      form.reset({
        category_id: subject.category_id,
        category_title: subject.category_title,
        surah_title_bn: subject.surah_title?.bn || "",
        surah_title_en: subject.surah_title?.en || "",
        surah_title_ar: subject.surah_title?.ar || "",
        verse_number: subject.verse_number,
        verse_text: subject.verse_text,
        author: subject.author || "",
        bn_meaning: subject.bn_meaning || "",
        bn_pronunciation: subject.bn_pronunciation || "",
        tafsir: subject.tafsir || "",
      });
      setCatValue(String(subject.category_id));
    }
  }, [subject, form]);

  function handleCatSelect(value: string) {
    setCatValue(value);
    const catId = Number(value);
    const catTitle = categoryMap.get(catId) || "";
    form.setValue("category_id", catId);
    form.setValue("category_title", catTitle);
  }

  function handleCatCreate() {
    const title = catInput.trim();
    if (!title) return;
    form.setValue("category_id", maxCategoryId);
    form.setValue("category_title", title);
    setCatValue("__new__");
  }

  async function onSubmit(data: QuranSubjectForm) {
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
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
        },
      });
      toast.success("Subject updated successfully");
      router.push("/admin/quran-subject");
    } catch (err) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as import("axios").AxiosError<{ error: string }>).response
              ?.data?.error
          : undefined;
      toast.error(message || "Failed to update subject");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Card className="max-w-2xl">
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="text-center py-12">
        <p className="">Subject not found</p>
        <Link
          href="/admin/quran-subject"
          className="inline-flex items-center justify-center h-7 px-2.5 rounded-lg border border-border  font-medium  mt-4"
        >
          Back to Quran Subjects
        </Link>
      </div>
    );
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
      <h1 className="text-2xl font-bold">Edit Subject</h1>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Subject Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Category Selection */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Combobox
                value={catValue}
                onValueChange={(value) => {
                  if (value) handleCatSelect(value);
                }}
                onInputValueChange={(inputValue) => {
                  setCatInput(inputValue);
                }}
              >
                <ComboboxInput
                  placeholder="Search or type new category..."
                  showClear
                />
                <ComboboxContent>
                  <ComboboxList>
                    {filteredCategories.map((cat) => (
                      <ComboboxItem key={cat.id} value={String(cat.id)}>
                        {cat.title}
                      </ComboboxItem>
                    ))}
                    {isNewCategory && (
                      <ComboboxItem
                        value="__create__"
                        onClick={handleCatCreate}
                      >
                        <Plus className="size-4" />
                        Add &ldquo;{catInput}&rdquo;
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                  {!isNewCategory && filteredCategories.length === 0 && (
                    <ComboboxEmpty>No categories found</ComboboxEmpty>
                  )}
                </ComboboxContent>
              </Combobox>
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
              <Textarea
                id="verse_text"
                rows={3}
                placeholder="Verse text..."
                {...form.register("verse_text")}
              />
              {form.formState.errors.verse_text && (
                <p className=" text-destructive">
                  {form.formState.errors.verse_text.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bn_meaning">Bengali Meaning</Label>
              <Textarea
                id="bn_meaning"
                rows={2}
                placeholder="Bengali meaning..."
                {...form.register("bn_meaning")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bn_pronunciation">Bengali Pronunciation</Label>
              <Textarea
                id="bn_pronunciation"
                rows={2}
                placeholder="Bengali pronunciation..."
                {...form.register("bn_pronunciation")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tafsir">Tafsir</Label>
              <Textarea
                id="tafsir"
                rows={3}
                placeholder="Tafsir..."
                {...form.register("tafsir")}
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

            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
                <Loader2 className="size-4 mr-2 animate-spin" />
              )}
              Update Subject
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
