"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { articleSchema, type ArticleFormValues } from "@/lib/validations/article";
import { useCreateArticle } from "@/hooks/use-article";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function CreateArticlePage() {
  const router = useRouter();
  const createMutation = useCreateArticle();

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: { title: "", content: "", status: "draft", tags: "", image: undefined },
  });

  async function onSubmit(data: ArticleFormValues) {
    try {
      await createMutation.mutateAsync(data as any);
      toast.success("Article created successfully");
      router.push("/admin/articles");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create article");
    }
  }

  return (
    <div className="space-y-4">
      <Link
        href="/admin/articles"
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Articles
      </Link>
      <h1 className="text-2xl font-bold">Create Article</h1>
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
                value={form.watch("image") ? [form.watch("image") as File] : []}
                onValueChange={(files) => form.setValue("image", files[0] ?? undefined)}
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
                  {form.watch("image") && (
                    <FileUploaderItem file={form.watch("image") as File}>
                      <FileUploaderItemPreview file={form.watch("image") as File} />
                      <FileUploaderItemMetadata file={form.watch("image") as File} />
                      <FileUploaderItemDelete file={form.watch("image") as File} />
                    </FileUploaderItem>
                  )}
                </FileUploaderList>
              </FileUploader>
            </div>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <Loader2 className="size-4 mr-2 animate-spin" />
              )}
              Create Article
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
