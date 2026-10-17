"use client";

import { useParams, useRouter } from "next/navigation";
import { useArticle, useDeleteArticle } from "@/hooks/use-article";
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

export default function ArticleDetailPage() {
  const params = useParams();
  const id = params.articleId as string;
  const router = useRouter();
  const { data: article, isLoading, isError } = useArticle(id);
  const deleteMutation = useDeleteArticle();
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Article deleted");
      router.push("/admin/articles");
    } catch {
      toast.error("Failed to delete article");
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

  if (isError || !article) {
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/articles"
          className="inline-flex items-center gap-1   hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Articles
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/articles/${id}/edit`}
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
                <AlertDialogTitle>Delete Article</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this article? This action
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

      <h1 className="text-2xl font-bold">{article.title}</h1>

      <div className="flex items-center gap-3  ">
        <Badge variant={article.status === "published" ? "default" : "secondary"}>
          {article.status}
        </Badge>
        <span>Created {formatDate(article.createdAt)}</span>
        {article.updatedAt !== article.createdAt && (
          <span>Updated {formatDate(article.updatedAt)}</span>
        )}
      </div>

      {article.image && (
        <div className="relative w-full max-w-lg h-64 rounded-lg overflow-hidden border">
          <img
            src={article.image.startsWith("http") ? article.image : `${BACKEND_URL}${article.image}`}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent>
          <p className=" leading-relaxed whitespace-pre-wrap">
            {article.content}
          </p>
        </CardContent>
      </Card>

      {article.author && (
        <Card>
          <CardHeader>
            <CardTitle>Author Info</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Name: {article.author.name}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
