"use client";

import { useParams, useRouter } from "next/navigation";
import { useMalfuzat, useDeleteMalfuzat } from "@/hooks/use-malfuzat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteModal } from "@/components/shared/delete-modal";
import { ArrowLeft, Pencil, Trash2, Headphones, FileText } from "lucide-react";
import Link from "next/link";
import { formatDate, stripHtml } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";
import type { Malfuzat } from "@/types/malfuzat";
import ReactAudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";

export default function MalfuzatDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data, isLoading, isError } = useMalfuzat(id);
  const deleteMutation = useDeleteMalfuzat();
  const [showDelete, setShowDelete] = useState(false);
  const malfuzat = data as unknown as Malfuzat;

  function handleDelete() {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Malfuzat deleted");
        router.push("/admin/malfuzat");
      },
      onError: () => toast.error("Failed to delete malfuzat"),
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !malfuzat) {
    return (
      <div className="text-center py-12">
        <p>Malfuzat not found</p>
        <Link
          href="/admin/malfuzat"
          className="inline-flex items-center justify-center h-7 px-2.5 rounded-lg border border-border font-medium mt-4"
        >
          Back to Malfuzat
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/malfuzat"
          className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/malfuzat/${malfuzat._id}/edit`}
            className="inline-flex items-center justify-center h-7 gap-1 px-2.5 rounded-lg border border-border font-medium"
          >
            <Pencil className="size-4" />
            Edit
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive gap-1"
            onClick={() => setShowDelete(true)}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>{malfuzat.title}</CardTitle>
            <Badge
              variant={malfuzat.mode === "audio" ? "default" : "secondary"}
              className="gap-1"
            >
              {malfuzat.mode === "audio" ? (
                <>
                  <Headphones className="size-3" />
                  Audio
                </>
              ) : (
                <>
                  <FileText className="size-3" />
                  Text
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="font-medium">{malfuzat.category}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Author</p>
              <p className="font-medium">{malfuzat.author || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">{formatDate(malfuzat.createdAt)}</p>
            </div>
          </div>

          {malfuzat.mode === "text" && malfuzat.description && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Description</p>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                {stripHtml(malfuzat.description)}
              </div>
            </div>
          )}

          {malfuzat.mode === "audio" && malfuzat.audioUrl && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Audio</p>
              <ReactAudioPlayer
                src={malfuzat.audioUrl}
                header={malfuzat.title}
                className="w-full"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteModal
        open={showDelete}
        onOpenChange={setShowDelete}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
