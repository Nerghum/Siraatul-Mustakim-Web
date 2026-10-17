"use client";

import { useParams, useRouter } from "next/navigation";
import { useBoyan, useDeleteBoyan } from "@/hooks/use-boyan";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteModal } from "@/components/shared/delete-modal";
import { ArrowLeft, Pencil, Trash2, Headphones, Video, ExternalLink } from "lucide-react";
import Link from "next/link";
import { formatDate, extractYoutubeId } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";
import type { Boyan } from "@/types/boyan";
import ReactAudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";

export default function BoyanDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data, isLoading, isError } = useBoyan(id);
  const deleteMutation = useDeleteBoyan();
  const [showDelete, setShowDelete] = useState(false);
  const boyan = data as unknown as Boyan;

  function handleDelete() {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Boyan deleted");
        router.push("/admin/boyan");
      },
      onError: () => toast.error("Failed to delete boyan"),
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

  if (isError || !boyan) {
    return (
      <div className="text-center py-12">
        <p>Boyan not found</p>
        <Link
          href="/admin/boyan"
          className="inline-flex items-center justify-center h-7 px-2.5 rounded-lg border border-border font-medium mt-4"
        >
          Back to Boyan
        </Link>
      </div>
    );
  }

  const isVideo = boyan.mediaType === "video" || Boolean(boyan.youtubeUrl);
  const youtubeId = extractYoutubeId(boyan.youtubeUrl);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/boyan"
          className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/boyan/${boyan._id}/edit`}
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
            <CardTitle>{boyan.title}</CardTitle>
            {isVideo ? (
              <Badge variant="destructive" className="gap-1 bg-red-600 hover:bg-red-700">
                <Video className="size-3" />
                Video
              </Badge>
            ) : (
              <Badge variant="default" className="gap-1">
                <Headphones className="size-3" />
                Audio
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="font-medium">{boyan.category}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">{boyan.location || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Author</p>
              <p className="font-medium">{boyan.author || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">{formatDate(boyan.createdAt)}</p>
            </div>
          </div>

          {isVideo ? (
            <div className="space-y-2 pt-2 border-t">
              <p className="text-sm font-medium text-muted-foreground">YouTube Video</p>
              {boyan.youtubeUrl && (
                <div className="mb-2">
                  <a
                    href={boyan.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {boyan.youtubeUrl}
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
              )}
              {youtubeId ? (
                <div className="relative aspect-video max-w-2xl rounded-lg overflow-hidden border bg-black shadow-sm">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title={boyan.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No valid YouTube link provided</p>
              )}
            </div>
          ) : (
            boyan.audioUrl && (
              <div className="space-y-2 pt-2 border-t">
                <p className="text-sm text-muted-foreground">Audio</p>
                <ReactAudioPlayer
                  src={boyan.audioUrl}
                  header={boyan.title}
                  className="w-full"
                />
              </div>
            )
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
