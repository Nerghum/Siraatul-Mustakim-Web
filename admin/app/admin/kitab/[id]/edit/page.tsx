"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  kitabSchema,
  type KitabForm,
  type KitabChapterForm,
} from "@/lib/validations/kitab";
import { useKitab, useUpdateKitab } from "@/hooks/use-kitab";
import type { UpdateKitabPayload, Kitab } from "@/types/kitab";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  FileUploader,
  FileUploaderDropzone,
  FileUploaderList,
  FileUploaderItem,
  FileUploaderItemPreview,
  FileUploaderItemMetadata,
  FileUploaderItemDelete,
} from "@/components/ui/file-uploader";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Upload, Plus, Trash2, GripVertical } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

function createEmptyChapter(order: number): KitabChapterForm {
  return { title: `Chapter ${order}`, order, content: "" };
}

export default function EditKitabPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data, isLoading } = useKitab(id);
  const updateMutation = useUpdateKitab();
  const [pdfFile, setPdfFile] = useState<File[]>([]);
  const [coverImages, setCoverImages] = useState<File[]>([]);
  const [formPopulated, setFormPopulated] = useState(false);

  const kitab = data as Kitab | undefined;

  const form = useForm<KitabForm>({
    resolver: zodResolver(kitabSchema),
    defaultValues: {
      title: "",
      author: "",
      status: "draft",
      bookType: "pdf",
      content: "",
      chapters: [],
    },
  });

  const bookType = form.watch("bookType");

  const {
    fields: chapterFields,
    append: appendChapter,
    remove: removeChapter,
    move: moveChapter,
  } = useFieldArray({
    control: form.control,
    name: "chapters",
    keyName: "fieldId",
  });

  // Populate form from fetched kitab data
  useEffect(() => {
    if (kitab && !formPopulated) {
      setFormPopulated(true);
      const existingBookType = kitab.bookType || "pdf";
      form.reset({
        title: kitab.title ?? "",
        author: kitab.author ?? "",
        status: kitab.status ?? "draft",
        bookType: existingBookType,
        content: kitab.content ?? "",
        chapters: (kitab.chapters || []).map((ch) => ({
          _id: ch._id,
          title: ch.title,
          order: ch.order,
          content: ch.content || "",
        })),
      });
    }
  }, [kitab, formPopulated, form]);

  const handleAddChapter = useCallback(() => {
    const nextOrder = chapterFields.length + 1;
    appendChapter(createEmptyChapter(nextOrder));
  }, [chapterFields.length, appendChapter]);

  const handleReorder = useCallback(
    (fromIndex: number, direction: "up" | "down") => {
      const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
      if (toIndex < 0 || toIndex >= chapterFields.length) return;
      moveChapter(fromIndex, toIndex);
      const chapters = form.getValues("chapters");
      if (chapters) {
        const reordered = chapters.map((ch, i) => ({ ...ch, order: i + 1 }));
        form.setValue("chapters", reordered, { shouldValidate: true });
      }
    },
    [chapterFields.length, moveChapter, form],
  );

  function onInvalid(errors: Record<string, unknown>) {
    const fieldNames = Object.keys(errors);
    toast.error(
      `Please fix ${fieldNames.length} validation error${fieldNames.length > 1 ? "s" : ""}. Scroll up to see details.`,
    );
    const firstErrorField = document.querySelector("[data-invalid='true']");
    if (firstErrorField) {
      firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function onSubmit(data: KitabForm) {
    const payload: UpdateKitabPayload = {
      title: data.title,
      author: data.author,
      status: data.status,
      bookType: data.bookType as "pdf" | "text",
      content: data.content || "",
    };

    if (data.bookType === "pdf" && pdfFile.length > 0) {
      payload.pdf = pdfFile[0];
    }

    if (coverImages.length > 0) {
      payload.coverImages = coverImages[0];
    }

    if (data.bookType === "text") {
      payload.chapters = (data.chapters || []).map((ch, i) => ({
        ...ch,
        order: i + 1,
      }));
    }

    updateMutation.mutate(
      { id, data: payload },
      {
        onSuccess: () => {
          toast.success("Kitab updated");
          router.push(`/admin/kitab/${id}`);
        },
        onError: (
          err: Error & { response?: { data?: { message?: string } } },
        ) => {
          toast.error(err.response?.data?.message || "Failed to update kitab");
        },
      },
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!kitab) {
    return (
      <div className="text-center py-12">
        <p className="">Kitab not found</p>
        <Link
          href="/admin/kitab"
          className="inline-flex items-center justify-center h-7 px-2.5 rounded-lg border border-border font-medium mt-4"
        >
          Back to Kitab
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href={`/admin/kitab/${id}`}
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back
      </Link>
      <h1 className="text-2xl font-bold">Edit Kitab</h1>

      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-4">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Kitab Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...form.register("title")} />
              {form.formState.errors.title && (
                <p className="text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input id="author" {...form.register("author")} />
              {form.formState.errors.author && (
                <p className="text-destructive">
                  {form.formState.errors.author.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(v) =>
                  form.setValue("status", v as "published" | "draft")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Book Type</Label>
              <Select
                value={bookType}
                onValueChange={(v) => {
                  form.setValue("bookType", v as "pdf" | "text", {
                    shouldValidate: true,
                  });
                  if (v === "pdf") {
                    setPdfFile([]);
                    form.setValue("chapters", []);
                  } else {
                    setPdfFile([]);
                    form.setValue("content", "");
                    if ((form.getValues("chapters") || []).length === 0) {
                      appendChapter(createEmptyChapter(1));
                    }
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Cover Images</CardTitle>
          </CardHeader>
          <CardContent>
            <Label className="text-muted-foreground text-xs mb-2 block">
              {kitab.coverImages
                ? "Leave empty to keep current cover image"
                : "New image will replace current one"}
            </Label>
            <FileUploader
              value={coverImages}
              onValueChange={(files) => setCoverImages(files.slice(0, 1))}
              accept="image/*"
              maxFiles={1}
            >
              <FileUploaderDropzone>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center justify-center rounded-full border p-2.5">
                    <Upload className="size-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">
                    Drag &amp; drop image here
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Or click to browse (max 1 file)
                  </p>
                </div>
              </FileUploaderDropzone>
              <FileUploaderList>
                {coverImages.map((file) => (
                  <FileUploaderItem
                    key={`${file.name}-${file.size}`}
                    file={file}
                  >
                    <FileUploaderItemPreview file={file} />
                    <FileUploaderItemMetadata file={file} />
                    <FileUploaderItemDelete file={file} />
                  </FileUploaderItem>
                ))}
              </FileUploaderList>
            </FileUploader>
          </CardContent>
        </Card>

        {/* PDF Upload — only for bookType === "pdf" */}
        {bookType === "pdf" && (
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>PDF File</CardTitle>
            </CardHeader>
            <CardContent>
              <Label className="text-muted-foreground text-xs mb-2 block">
                {kitab.pdf
                  ? "Leave empty to keep current PDF"
                  : "Upload a PDF file"}
              </Label>
              <FileUploader
                value={pdfFile}
                onValueChange={(files) => setPdfFile(files.slice(0, 1))}
                accept=".pdf"
                maxFiles={1}
              >
                <FileUploaderDropzone>
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center justify-center rounded-full border p-2.5">
                      <Upload className="size-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">
                      Drag &amp; drop PDF here
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Or click to browse
                    </p>
                  </div>
                </FileUploaderDropzone>
                <FileUploaderList>
                  {pdfFile.map((file) => (
                    <FileUploaderItem
                      key={`${file.name}-${file.size}`}
                      file={file}
                    >
                      <FileUploaderItemPreview file={file} />
                      <FileUploaderItemMetadata file={file} />
                      <FileUploaderItemDelete file={file} />
                    </FileUploaderItem>
                  ))}
                </FileUploaderList>
              </FileUploader>
            </CardContent>
          </Card>
        )}

        {/* Chapters — only for bookType === "text" */}
        {bookType === "text" && (
          <Card className="max-w-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Chapters ({chapterFields.length})</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddChapter}
              >
                <Plus className="size-4 mr-1.5" />
                Add Chapter
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {chapterFields.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No chapters yet. Click &quot;Add Chapter&quot; to start.
                </p>
              )}

              {chapterFields.map((field, index) => (
                <div
                  key={field.fieldId}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-0.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        disabled={index === 0}
                        onClick={() => handleReorder(index, "up")}
                      >
                        <GripVertical className="size-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        disabled={index === chapterFields.length - 1}
                        onClick={() => handleReorder(index, "down")}
                      >
                        <GripVertical className="size-3 rotate-180" />
                      </Button>
                    </div>

                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                        #{index + 1}
                      </span>
                      <Controller
                        name={`chapters.${index}.title`}
                        control={form.control}
                        render={({ field: inputField }) => (
                          <Input
                            {...inputField}
                            placeholder="Chapter title"
                            className="flex-1"
                          />
                        )}
                      />
                      {chapterFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:text-destructive shrink-0"
                          onClick={() => removeChapter(index)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {form.formState.errors.chapters?.[index]?.title && (
                    <p className="text-destructive text-sm">
                      {form.formState.errors.chapters[index]!.title!.message}
                    </p>
                  )}

                  <Controller
                    name={`chapters.${index}.content`}
                    control={form.control}
                    render={({ field: editorField }) => (
                      <RichTextEditor
                        value={editorField.value || ""}
                        onChange={editorField.onChange}
                        placeholder="Write chapter content here..."
                      />
                    )}
                  />
                </div>
              ))}

              {chapterFields.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddChapter}
                >
                  <Plus className="size-4 mr-1.5" />
                  Add Chapter
                </Button>
              )}

              {form.formState.errors.chapters?.message && (
                <p className="text-destructive">
                  {form.formState.errors.chapters.message as string}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex items-center gap-3 max-w-2xl">
          <Button type="submit" disabled={updateMutation.isPending} size="lg">
            {updateMutation.isPending && (
              <Loader2 className="size-4 mr-2 animate-spin" />
            )}
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
          <Link href={`/admin/kitab/${id}`}>
            <Button type="button" variant="outline" size="lg">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
