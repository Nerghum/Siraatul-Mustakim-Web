"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { noticeSchema, type NoticeForm } from "@/lib/validations/notice";
import { useCreateNotice } from "@/hooks/use-notice";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function CreateNoticePage() {
  const router = useRouter();
  const createMutation = useCreateNotice();

  const form = useForm<NoticeForm>({
    resolver: zodResolver(noticeSchema),
    defaultValues: { title: "", date: "", description: "", image: undefined },
  });

  async function onSubmit(data: NoticeForm) {
    try {
      await createMutation.mutateAsync(data as any);
      toast.success("Notice created successfully");
      router.push("/admin/notice");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create notice");
    }
  }

  return (
    <div className="space-y-4">
      <Link
        href="/admin/notice"
        className="inline-flex items-center gap-1   hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Notice
      </Link>
      <h1 className="text-2xl font-bold">Create Notice</h1>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Notice Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Notice title"
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p className=" text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...form.register("date")} />
              {form.formState.errors.date && (
                <p className=" text-destructive">
                  {form.formState.errors.date.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={5}
                placeholder="Notice description..."
                {...form.register("description")}
              />
              {form.formState.errors.description && (
                <p className=" text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
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
              Create Notice
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
