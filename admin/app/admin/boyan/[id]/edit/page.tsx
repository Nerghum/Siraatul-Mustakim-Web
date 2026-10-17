"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  useBoyan,
  useUpdateBoyan,
  useBoyanCategories,
} from "@/hooks/use-boyan";
import type { Boyan } from "@/types/boyan";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Headphones, Video } from "lucide-react";
import Link from "next/link";
import ReactAudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { BD_DISTRICTS } from "@/lib/districts";
import { cn, extractYoutubeId } from "@/lib/utils";

export default function EditBoyanPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data, isLoading } = useBoyan(id);
  const updateMutation = useUpdateBoyan();
  const { data: categories } = useBoyanCategories();
  const boyan = data as unknown as Boyan;

  const [mediaType, setMediaType] = useState<"audio" | "video">("audio");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [author, setAuthor] = useState("");
  const [location, setLocation] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [useNewCategory, setUseNewCategory] = useState(false);
  const [formPopulated, setFormPopulated] = useState(false);

  const youtubeId = extractYoutubeId(youtubeUrl);

  if (boyan && !formPopulated) {
    setFormPopulated(true);
    setMediaType(boyan.mediaType || (boyan.youtubeUrl ? "video" : "audio"));
    setTitle(boyan.title || "");
    setCategory(boyan.category || "");
    setAuthor(boyan.author || "");
    setLocation(boyan.location || "");
    setYoutubeUrl(boyan.youtubeUrl || "");
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!category && !newCategory) {
      toast.error("Category is required");
      return;
    }

    if (mediaType === "video") {
      if (!youtubeUrl.trim()) {
        toast.error("YouTube link is required for video bayan");
        return;
      }
      if (!youtubeId) {
        toast.error("Please provide a valid YouTube video link");
        return;
      }
    }

    const finalCategory = useNewCategory ? newCategory : category;

    updateMutation.mutate(
      {
        id,
        data: {
          title,
          category: finalCategory,
          author,
          location,
          mediaType,
          ...(mediaType === "video"
            ? { youtubeUrl: youtubeUrl.trim() }
            : { audio: audioFile || undefined }),
        },
      },
      {
        onSuccess: () => {
          toast.success("Boyan updated successfully");
          router.push(`/admin/boyan/${id}`);
        },
        onError: (error) => {
          const err = error as {
            response?: { data?: { error?: string; message?: string } };
          };
          toast.error(
            err.response?.data?.error ||
              err.response?.data?.message ||
              "Failed to update boyan",
          );
        },
      },
    );
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

  if (!boyan) {
    return (
      <div className="text-center py-12">
        <p>Boyan not found</p>
        <Link
          href="/admin/boyan"
          className="inline-flex items-center justify-center h-7 px-2.5 rounded-lg border border-border font-medium mt-4"
        >
          Back to All Bayan
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href={`/admin/boyan/${id}`}
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4 mr-1" />
        Back to Bayan
      </Link>
      <h1 className="text-2xl font-bold">
        Edit Bayan
        <span className="ml-2 text-sm font-normal text-muted-foreground">
          (
          <span className="inline-flex items-center gap-1">
            {mediaType === "video" ? (
              <>
                <Video className="size-3 text-red-500" /> Video
              </>
            ) : (
              <>
                <Headphones className="size-3" /> Audio
              </>
            )}
          </span>
          )
        </span>
      </h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Bayan Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Bayan Type Toggle */}
            <div className="space-y-2">
              <Label>Bayan Type</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMediaType("audio")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all",
                    mediaType === "audio"
                      ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20"
                      : "border-border hover:bg-muted/50 text-muted-foreground"
                  )}
                >
                  <Headphones className="size-4" />
                  Audio Bayan (অডিও বয়ান)
                </button>
                <button
                  type="button"
                  onClick={() => setMediaType("video")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all",
                    mediaType === "video"
                      ? "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 ring-2 ring-red-500/20"
                      : "border-border hover:bg-muted/50 text-muted-foreground"
                  )}
                >
                  <Video className="size-4" />
                  Video Bayan (ভিডিও বয়ান)
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Category</Label>
                <Link
                  href="/admin/boyan/categories"
                  className="text-xs text-primary hover:underline"
                >
                  Manage Categories
                </Link>
              </div>
              {useNewCategory ? (
                <Input
                  placeholder="Enter new category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
              ) : (
                <Select
                  value={category}
                  onValueChange={(v) => {
                    if (v === "__new__") {
                      setUseNewCategory(true);
                      setCategory("");
                    } else {
                      setCategory(v ?? "");
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => {
                      const catName = typeof cat === "string" ? cat : cat.name;
                      const catValue =
                        typeof cat === "string" ? cat : cat.slug || cat.name;
                      return (
                        <SelectItem key={catValue} value={catValue}>
                          {catName}
                        </SelectItem>
                      );
                    })}
                    <SelectItem value="__new__">+ Add new category</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {useNewCategory && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setUseNewCategory(false);
                    setNewCategory("");
                  }}
                >
                  Select existing
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">District / Location</Label>
              <Select
                value={location || "__none__"}
                onValueChange={(v) => setLocation(v === "__none__" || !v ? "" : v)}
              >
                <SelectTrigger id="location">
                  <SelectValue placeholder="Select district (optional)" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="__none__">None / All</SelectItem>
                  {BD_DISTRICTS.map((d) => (
                    <SelectItem key={d.id} value={d.name.bn}>
                      {d.name.bn} ({d.name.en})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Speaker / Author</Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Author name (optional)"
              />
            </div>

            {/* Video vs Audio Fields */}
            {mediaType === "video" ? (
              <div className="space-y-3">
                <Label htmlFor="youtubeUrl" className="flex items-center gap-1.5">
                  <Video className="size-4 text-red-500" />
                  YouTube Video Link
                </Label>
                <Input
                  id="youtubeUrl"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                />
                <p className="text-xs text-muted-foreground">
                  Paste the YouTube video link. Only YouTube link is required for video bayan.
                </p>

                {youtubeId && (
                  <div className="mt-2 rounded-lg border p-3 bg-muted/20">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Video Preview:
                    </p>
                    <div className="relative aspect-video max-w-sm rounded overflow-hidden border bg-black">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                        alt="YouTube Thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Current Audio</Label>
                {boyan.audioUrl && (
                  <ReactAudioPlayer
                    src={boyan.audioUrl}
                    header={boyan.title}
                    className="w-full"
                  />
                )}
                <Label className="mt-2">Replace Audio</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
                    className="hidden"
                    id="audio-upload"
                  />
                  <label htmlFor="audio-upload" className="cursor-pointer">
                    <Headphones className="size-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {audioFile
                        ? audioFile.name
                        : "Click to upload new audio file"}
                    </p>
                    {audioFile && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {(audioFile.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    )}
                  </label>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && (
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
                Update Bayan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
