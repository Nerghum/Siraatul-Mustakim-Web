"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  useMalfuzat,
  useUpdateMalfuzat,
  useMalfuzatCategories,
} from "@/hooks/use-malfuzat";
import type { Malfuzat } from "@/types/malfuzat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
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
import { Loader2, ArrowLeft, Headphones, FileText } from "lucide-react";
import Link from "next/link";
import ReactAudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";

export default function EditMalfuzatPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data, isLoading } = useMalfuzat(id);
  const updateMutation = useUpdateMalfuzat();
  const { data: categories } = useMalfuzatCategories();
  const malfuzat = data as unknown as Malfuzat;

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [useNewCategory, setUseNewCategory] = useState(false);

  useEffect(() => {
    if (malfuzat) {
      setTitle(malfuzat.title);
      setCategory(malfuzat.category);
      setAuthor(malfuzat.author || "");
      setDescription(malfuzat.description || "");
    }
  }, [malfuzat]);

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

    const finalCategory = useNewCategory ? newCategory : category;

    updateMutation.mutate(
      {
        id,
        data: {
          title,
          category: finalCategory,
          author,
          ...(malfuzat?.mode === "text" ? { description } : {}),
          ...(audioFile ? { audio: audioFile } : {}),
        },
      },
      {
        onSuccess: () => {
          toast.success("Malfuzat updated successfully");
          router.push(`/admin/malfuzat/${id}`);
        },
        onError: (err: any) => {
          toast.error(
            err.response?.data?.error ||
              err.response?.data?.message ||
              "Failed to update malfuzat",
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

  if (!malfuzat) {
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
      <Link
        href={`/admin/malfuzat/${id}`}
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4 mr-1" />
        Back to Malfuzat
      </Link>
      <h1 className="text-2xl font-bold">
        Edit Malfuzat
        <span className="ml-2 text-sm font-normal text-muted-foreground">
          (
          {malfuzat.mode === "audio" ? (
            <span className="inline-flex items-center gap-1">
              <Headphones className="size-3" /> Audio
            </span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <FileText className="size-3" /> Text
            </span>
          )}
          )
        </span>
      </h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Malfuzat Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
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
                    {categories?.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
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
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Author name (optional)"
              />
            </div>

            {malfuzat.mode === "text" && (
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <RichTextEditor
                  id="description"
                  value={description}
                  onChange={setDescription}
                  placeholder="Write malfuzat description..."
                />
              </div>
            )}

            {malfuzat.mode === "audio" && (
              <div className="space-y-2">
                <Label>Current Audio</Label>
                {malfuzat.audioUrl && (
                  <ReactAudioPlayer
                    src={malfuzat.audioUrl}
                    header={malfuzat.title}
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

            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
                <Loader2 className="size-4 mr-2 animate-spin" />
              )}
              Update Malfuzat
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
