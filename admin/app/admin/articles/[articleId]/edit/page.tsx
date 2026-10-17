"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { articleSchema, type ArticleFormValues } from "@/lib/validations/article";
import { useArticle, useUpdateArticle } from "@/hooks/use-article";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";
import {
  FileUploader,
  FileUploaderDropzone,
  FileUploaderList,
  FileUploaderItem,
  FileUploaderItemPreview,
  FileUploaderItemMetadata,
  FileUploaderItemDelete,
} from "@/components/ui/file-uploader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
const BACKEND_URL = API_BASE.replace("/api", "");

export default function EditArticlePage() {
  const params = useParams();
  const id = params.articleId as string;
  const router = useRouter();
  const { data: article, isLoading } = useArticle(id);
  const updateMutation = useUpdateArticle();
  const [newImage, setNewImage] = useState<File | null>(null);

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: { title: "", content: "", status: "draft", tags: "", image: undefined },
  });

  useEffect(() => {
    if (article) {
      form.reset({
        title: article.title,
        content: article.content,
        status: article.status,
        tags: article.tags?.join(", ") || "",
        image: undefined,
      });
    }
  }, [article, form]);

  async function onSubmit(data: ArticleFormValues) {
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          title: data.title,
          content: data.content,
          status: data.status,
          tags: data.tags,
          image: newImage,
        } as any,
      });
      toast.success("Article updated successfully");
      router.push("/admin/articles");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update article");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Card className="max-w-2xl">
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <p className="">Article not found</p>
        <Link
          href="/admin/articles"
          className="inline-flex items-center justify-center h-7 px-2.5 rounded-lg border border-border  font-medium  mt-4"
        >
          Back to Articles
        </Link>
      </div>
    );
  }

  const existingImageUrl = article.image
    ? article.image.startsWith("http")
      ? article.image
      : `${BACKEND_URL}${article.image}`
    : null;

  return (
    <div className="space-y-4">
      <Link
        href="/admin/articles"
        className="inline-flex items-center gap-1   hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Articles
      </Link>
      <h1 className="text-2xl font-bold">Edit Article</h1>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Article Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Article title"
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p className=" text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <RichTextEditor
                id="content"
                placeholder="Article content..."
                value={form.watch("content")}
                onChange={(val) => form.setValue("content", val, { shouldValidate: true })}
              />
              {form.formState.errors.content && (
                <p className=" text-destructive">
                  {form.formState.errors.content.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                onValueChange={(val) => form.setValue("status", val as any)}
                defaultValue={form.watch("status")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (Comma Separated)</Label>
              <Input
                id="tags"
                placeholder="e.g. Islam, Faith, Prayer"
                {...form.register("tags")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image (optional)</Label>
              <FileUploader
                value={newImage ? [newImage] : []}
                onValueChange={(files) => setNewImage(files[0] ?? null)}
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
                      Or click to browse
                    </p>
                  </div>
                </FileUploaderDropzone>
                <FileUploaderList>
                  {newImage && (
                    <FileUploaderItem file={newImage}>
                      <FileUploaderItemPreview file={newImage} />
                      <FileUploaderItemMetadata file={newImage} />
                      <FileUploaderItemDelete file={newImage} />
                    </FileUploaderItem>
                  )}
                </FileUploaderList>
              </FileUploader>
              {!newImage && existingImageUrl && (
                <div className="mt-2 relative w-48 h-32 rounded-md overflow-hidden border">
                  <img
                    src={existingImageUrl}
                    alt="Current Image"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
                <Loader2 className="size-4 mr-2 animate-spin" />
              )}
              Update Article
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
