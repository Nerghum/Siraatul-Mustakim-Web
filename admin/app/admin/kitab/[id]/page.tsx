"use client";

import { useParams } from "next/navigation";
import { useKitab, useDeleteKitab } from "@/hooks/use-kitab";
import type { Kitab } from "@/types/kitab";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteModal } from "@/components/shared/delete-modal";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function KitabDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data, isLoading, isError } = useKitab(id);
  const deleteMutation = useDeleteKitab();
  const [showDelete, setShowDelete] = useState(false);
  const kitab = data as unknown as Kitab;

  function handleDelete() {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Kitab deleted");
        router.push("/admin/kitab");
      },
      onError: () => toast.error("Failed to delete kitab"),
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !kitab) {
    return (
      <div className="text-center py-12">
        <p className="">Kitab not found</p>
        <Link
          href="/admin/kitab"
          className="inline-flex items-center justify-center h-7 px-2.5 rounded-lg border border-border  font-medium  mt-4"
        >
          Back to Kitab
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/admin/kitab"
            className="inline-flex items-center gap-1   hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/kitab/${kitab._id}/edit`}
            className="inline-flex items-center justify-center h-7 gap-1 px-2.5 rounded-lg border border-border  font-medium "
          >
            <Pencil className="size-4" />
            Edit
          </Link>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDelete(true)}
          >
            <Trash2 className="size-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className=" ">Title</p>
              <p className="font-medium">{kitab.title}</p>
            </div>
            <div>
              <p className=" ">Author</p>
              <p className="font-medium">{kitab.author}</p>
            </div>
            <div>
              <p className=" ">Status</p>
              <Badge
                variant={kitab.status === "published" ? "default" : "secondary"}
              >
                {kitab.status}
              </Badge>
            </div>
            <div>
              <p className=" ">Book Type</p>
              <Badge
                variant={kitab.bookType === "text" ? "default" : "secondary"}
              >
                <BookOpen className="size-3 mr-1" />
                {kitab.bookType === "text" ? "Text" : "PDF"}
              </Badge>
            </div>
            <div>
              <p className=" ">Created</p>
              <p className="font-medium">{formatDate(kitab.createdAt)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {kitab.pdf && (
              <div>
                <p className="  mb-1">PDF</p>
                <Link
                  href={kitab.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-7 gap-1 px-2.5 rounded-lg border border-border  font-medium "
                >
                  <ExternalLink className="size-4" />
                  View PDF
                </Link>
              </div>
            )}
            {kitab?.coverImages && (
              <div>
                <p className="mb-2">Cover Image</p>
                <div className="flex gap-2 flex-wrap">
                  <Link
                    href={kitab.coverImages}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={kitab.coverImages}
                      alt="Cover"
                      className="w-24 h-32 object-cover rounded-md border"
                    />
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {kitab.content && (
        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: kitab.content }}
            />
          </CardContent>
        </Card>
      )}

      {kitab.bookType === "text" &&
        kitab.chapters &&
        kitab.chapters.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Chapters ({kitab.chapters.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {kitab.chapters
                .sort((a, b) => a.order - b.order)
                .map((chapter, idx) => (
                  <div key={chapter._id || idx} className="space-y-2">
                    <h3 className="text-lg font-semibold">
                      {idx + 1}. {chapter.title}
                    </h3>
                    {chapter.content && (
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: chapter.content }}
                      />
                    )}
                    {idx < (kitab.chapters?.length ?? 0) - 1 && (
                      <hr className="my-4" />
                    )}
                  </div>
                ))}
            </CardContent>
          </Card>
        )}

      <DeleteModal
        open={showDelete}
        onOpenChange={setShowDelete}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
