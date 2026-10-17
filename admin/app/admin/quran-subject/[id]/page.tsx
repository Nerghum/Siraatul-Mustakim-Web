"use client";

import { useParams, useRouter } from "next/navigation";
import {
  useQuranSubject,
  useDeleteQuranSubject,
} from "@/hooks/use-quran-subject";
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
import { useState } from "react";
import { stripHtml } from "@/lib/utils";

export default function QuranSubjectDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const router = useRouter();
  const { data: subject, isLoading, isError } = useQuranSubject(id);
  const deleteMutation = useDeleteQuranSubject();
  const [deleteOpen, setDeleteOpen] = useState(false);
  console.log(subject);
  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Subject deleted");
      router.push("/admin/quran-subject");
    } catch {
      toast.error("Failed to delete subject");
      setDeleteOpen(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !subject) {
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
      <div className="flex items-center justify-between">
        <Link
          href="/admin/quran-subject"
          className="inline-flex items-center gap-1   hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Quran Subjects
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/quran-subject/${id}/edit`}
            className="inline-flex items-center justify-center h-8 px-3 rounded-lg border border-border  font-medium "
          >
            <Pencil className="size-4 mr-1" />
            Edit
          </Link>
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <Button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="inline-flex items-center !text-white justify-center h-8 px-3 rounded-lg bg-destructive text-destructive-foreground  font-medium hover:bg-destructive/80 transition-colors"
            >
              <Trash2 className="size-4 mr-1 " />
              Delete
            </Button>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Subject</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this subject? This action
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

      <div className="flex items-center gap-2">
        <Badge variant="default">ID: {subject.id}</Badge>
        <Badge variant="secondary">Category: {subject.category_title}</Badge>
        {subject.author && <Badge variant="outline">{subject.author}</Badge>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {subject.surah_id}.{" "}
            {subject.surah_title?.bn || subject.surah_title?.en || ""} — Verse{" "}
            {subject.verse_number}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {subject.surah_title?.ar && (
            <p className="text-xl text-right font-arabic" dir="rtl">
              {subject.surah_title.ar}
            </p>
          )}
          <div>
            <h3 className=" font-medium  mb-1">Verse Text</h3>
            <p className="text-base leading-relaxed">{stripHtml(subject.verse_text)}</p>
          </div>
          {subject.bn_meaning && (
            <div>
              <h3 className=" font-medium  mb-1">Bengali Meaning</h3>
              <p className=" leading-relaxed">{stripHtml(subject.bn_meaning)}</p>
            </div>
          )}
          {subject.bn_pronunciation && (
            <div>
              <h3 className=" font-medium  mb-1">Bengali Pronunciation</h3>
              <p className=" leading-relaxed">{stripHtml(subject.bn_pronunciation)}</p>
            </div>
          )}
          {subject.tafsir && (
            <div>
              <h3 className=" font-medium  mb-1">Tafsir</h3>
              <p className=" leading-relaxed">{stripHtml(subject.tafsir)}</p>
            </div>
          )}
          {subject.author && (
            <div>
              <h3 className=" font-medium  mb-1">Author</h3>
              <p className="">{subject.author}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
