"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateBoyan, useBoyanCategories } from "@/hooks/use-boyan";
import { boyanSchema } from "@/lib/validations/boyan";
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
import { toast } from "sonner";
import { ArrowLeft, Headphones, Video } from "lucide-react";
import Link from "next/link";
import { BD_DISTRICTS } from "@/lib/districts";
import { cn, extractYoutubeId } from "@/lib/utils";

export default function CreateBoyanPage() {
  const router = useRouter();
  const createMutation = useCreateBoyan();
  const { data: categories } = useBoyanCategories();

  const [mediaType, setMediaType] = useState<"audio" | "video">("audio");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [author, setAuthor] = useState("");
  const [location, setLocation] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [useNewCategory, setUseNewCategory] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const youtubeId = extractYoutubeId(youtubeUrl);

  function validate(): boolean {
    const finalCategory = useNewCategory ? newCategory : category;
    const base = {
      title,
      category: finalCategory,
      author,
      location,
      mediaType,
      youtubeUrl,
    };
    const result = boyanSchema.safeParse(base);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return false;
    }

    if (mediaType === "video") {
      if (!youtubeUrl.trim()) {
        setErrors({ youtubeUrl: "YouTube link is required for video bayan" });
        return false;
      }
      if (!youtubeId) {
        setErrors({ youtubeUrl: "Please provide a valid YouTube video link" });
        return false;
      }
    } else {
      if (!audioFile) {
        setErrors({ audio: "Audio file is required for audio bayan" });
        return false;
      }
    }

    setErrors({});
    return true;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const finalCategory = useNewCategory ? newCategory : category;
    createMutation.mutate(
      {
        title,
        category: finalCategory,
        author,
        location,
        mediaType,
        ...(mediaType === "video"
          ? { youtubeUrl: youtubeUrl.trim() }
          : { audio: audioFile || undefined }),
      },
      {
        onSuccess: () => {
          toast.success(
            mediaType === "video"
              ? "Video Bayan created successfully"
              : "Audio Bayan created successfully"
          );
          router.push("/admin/boyan");
        },
        onError: (error) => {
          const err = error as {
            response?: { data?: { error?: string; message?: string } };
          };
          toast.error(
            err.response?.data?.error ||
              err.response?.data?.message ||
              "Failed to create boyan",
          );
        },
      },
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href="/admin/boyan"
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4 mr-1" />
        Back to All Bayan
      </Link>
      <h1 className="text-2xl font-bold">Create Bayan</h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {mediaType === "video" ? (
              <>
                <Video className="size-5 text-red-500" />
                Video Bayan Details
              </>
            ) : (
              <>
                <Headphones className="size-5 text-primary" />
                Audio Bayan Details
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Bayan Type Toggle */}
            <div className="space-y-2">
              <Label>Bayan Type</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMediaType("audio");
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.youtubeUrl;
                      return next;
                    });
                  }}
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
                  onClick={() => {
                    setMediaType("video");
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.audio;
                      return next;
                    });
                  }}
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
                placeholder="Enter bayan title"
              />
              {errors.title && (
                <p className="text-destructive text-sm">{errors.title}</p>
              )}
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
              {errors.category && (
                <p className="text-destructive text-sm">{errors.category}</p>
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

            {/* Conditional: Video link or Audio upload */}
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
                {errors.youtubeUrl && (
                  <p className="text-destructive text-sm">{errors.youtubeUrl}</p>
                )}

                {/* Preview Thumbnail if valid YouTube ID */}
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
                <Label>Audio File</Label>
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
                      {audioFile ? audioFile.name : "Click to upload audio file"}
                    </p>
                    {audioFile && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {(audioFile.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    )}
                  </label>
                </div>
                {errors.audio && (
                  <p className="text-destructive text-sm">{errors.audio}</p>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
                Create Bayan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
