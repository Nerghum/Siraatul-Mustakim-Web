"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateMalfuzat, useMalfuzatCategories } from "@/hooks/use-malfuzat";
import { malfuzatSchema } from "@/lib/validations/malfuzat";
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
import { toast } from "sonner";
import { Loader2, ArrowLeft, Headphones, FileText } from "lucide-react";
import Link from "next/link";

export default function CreateMalfuzatPage() {
  const router = useRouter();
  const createMutation = useCreateMalfuzat();
  const { data: categories } = useMalfuzatCategories();

  const [mode, setMode] = useState<"text" | "audio">("text");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [useNewCategory, setUseNewCategory] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const base = { title, category: useNewCategory ? newCategory : category };
    const data =
      mode === "text"
        ? { ...base, mode: "text" as const, description }
        : { ...base, mode: "audio" as const };
    const result = malfuzatSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    if (mode === "audio" && !audioFile) {
      setErrors({ audio: "Audio file is required" });
      return false;
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
        mode,
        title,
        category: finalCategory,
        author,
        ...(mode === "text" ? { description } : {}),
        ...(mode === "audio" && audioFile ? { audio: audioFile } : {}),
      },
      {
        onSuccess: () => {
          toast.success("Malfuzat created successfully");
          router.push("/admin/malfuzat");
        },
        onError: (error) => {
          const err = error as {
            response?: { data?: { error?: string; message?: string } };
          };
          toast.error(
            err.response?.data?.error ||
              err.response?.data?.message ||
              "Failed to create malfuzat",
          );
        },
      },
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href="/admin/malfuzat"
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4 mr-1" />
        Back to Malfuzat
      </Link>
      <h1 className="text-2xl font-bold">Create Malfuzat</h1>

      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === "text" ? "default" : "outline"}
          onClick={() => setMode("text")}
          className="gap-2"
        >
          <FileText className="size-4" />
          Text Mode
        </Button>
        <Button
          type="button"
          variant={mode === "audio" ? "default" : "outline"}
          onClick={() => setMode("audio")}
          className="gap-2"
        >
          <Headphones className="size-4" />
          Audio Mode
        </Button>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>
            {mode === "text"
              ? "Text Malfuzat Details"
              : "Audio Malfuzat Details"}
          </CardTitle>
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
              {errors.title && (
                <p className="text-destructive">{errors.title}</p>
              )}
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
              {errors.category && (
                <p className="text-destructive">{errors.category}</p>
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

            {mode === "text" && (
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <RichTextEditor
                  id="description"
                  value={description}
                  onChange={setDescription}
                  placeholder="Write malfuzat description..."
                />
                {errors.description && (
                  <p className="text-destructive">{errors.description}</p>
                )}
              </div>
            )}

            {mode === "audio" && (
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
                      {audioFile
                        ? audioFile.name
                        : "Click to upload audio file"}
                    </p>
                    {audioFile && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {(audioFile.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    )}
                  </label>
                </div>
                {errors.audio && (
                  <p className="text-destructive">{errors.audio}</p>
                )}
              </div>
            )}

            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <Loader2 className="size-4 mr-2 animate-spin" />
              )}
              Create Malfuzat
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
