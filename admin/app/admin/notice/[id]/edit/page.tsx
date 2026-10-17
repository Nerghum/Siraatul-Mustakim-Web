"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { noticeSchema, type NoticeForm } from "@/lib/validations/notice";
import { useNotice, useUpdateNotice } from "@/hooks/use-notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
const BACKEND_URL = API_BASE.replace("/api", "");

export default function EditNoticePage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: notice, isLoading } = useNotice(id);
  const updateMutation = useUpdateNotice();
  const [newImage, setNewImage] = useState<File | null>(null);

  const form = useForm<NoticeForm>({
    resolver: zodResolver(noticeSchema),
    defaultValues: { title: "", date: "", description: "", image: undefined },
  });

  useEffect(() => {
    if (notice) {
      form.reset({
        title: notice.title,
        date: notice.date ? notice.date.slice(0, 10) : "",
        description: notice.description,
        image: undefined,
      });
    }
  }, [notice, form]);

  async function onSubmit(data: NoticeForm) {
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          title: data.title,
          date: data.date,
          description: data.description,
          image: newImage,
        },
      });
      toast.success("Notice updated successfully");
      router.push("/admin/notice");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update notice");
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

  if (!notice) {
    return (
      <div className="text-center py-12">
        <p className="">Notice not found</p>
        <Link
          href="/admin/notice"
          className="inline-flex items-center justify-center h-7 px-2.5 rounded-lg border border-border  font-medium  mt-4"
        >
          Back to Notice
        </Link>
      </div>
    );
  }

  const existingImageUrl = notice.image
    ? notice.image.startsWith("http")
      ? notice.image
      : `${BACKEND_URL}${notice.image}`
    : null;

  return (
    <div className="space-y-4">
      <Link
        href="/admin/notice"
        className="inline-flex items-center gap-1   hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Notice
      </Link>
      <h1 className="text-2xl font-bold">Edit Notice</h1>
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
              Update Notice
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
