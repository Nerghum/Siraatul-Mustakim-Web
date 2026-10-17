"use client";

import { useParams, useRouter } from "next/navigation";
import { useNotice, useDeleteNotice } from "@/hooks/use-notice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import { ArrowLeft, Trash2, Loader2, Pencil } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
const BACKEND_URL = API_BASE.replace("/api", "");

export default function NoticeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: notice, isLoading, isError } = useNotice(id);
  const deleteMutation = useDeleteNotice();
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Notice deleted");
      router.push("/admin/notice");
    } catch {
      toast.error("Failed to delete notice");
      setDeleteOpen(false);
    }
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

  if (isError || !notice) {
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/notice"
          className="inline-flex items-center gap-1   hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Notice
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/notice/${id}/edit`}
            className="inline-flex items-center justify-center h-8 px-3 rounded-lg border border-border  font-medium "
          >
            <Pencil className="size-4 mr-1" />
            Edit
          </Link>
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <Button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="inline-flex items-center justify-center h-8 px-3 rounded-lg bg-destructive "
            >
              <Trash2 className="size-4 mr-1" />
              Delete
            </Button>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Notice</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this notice? This action
                  cannot be undone.
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
      </div>

      <h1 className="text-2xl font-bold">{notice.title}</h1>

      <div className="flex items-center gap-3  ">
        <Badge variant="secondary">{formatDate(notice.date)}</Badge>
        <span>Created {formatDate(notice.createdAt)}</span>
        {notice.updatedAt !== notice.createdAt && (
          <span>Updated {formatDate(notice.updatedAt)}</span>
        )}
      </div>

      {notice.image && (
        <div className="relative w-full max-w-lg h-64 rounded-lg overflow-hidden border">
          <img
            src={notice.image.startsWith("http") ? notice.image : `${BACKEND_URL}${notice.image}`}
            alt={notice.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className=" leading-relaxed whitespace-pre-wrap">
            {notice.description}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
