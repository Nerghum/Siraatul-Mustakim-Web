"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adSchema, type AdForm } from "@/lib/validations/ad";
import { useAd, useUpdateAd } from "@/hooks/use-ad";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Upload, CheckSquare, Square } from "lucide-react";
import Link from "next/link";
import {
  FileUploader,
  FileUploaderDropzone,
  FileUploaderList,
  FileUploaderItem,
  FileUploaderItemPreview,
  FileUploaderItemMetadata,
  FileUploaderItemDelete,
} from "@/components/ui/file-uploader";
import { AD_PLACEMENTS } from "@/types/ad";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
const BACKEND_URL = API_BASE.replace("/api", "");

export default function EditAdPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: ad, isLoading } = useAd(id);
  const updateMutation = useUpdateAd();
  const [newImage, setNewImage] = useState<File | null>(null);

  const form = useForm<AdForm>({
    resolver: zodResolver(adSchema),
    defaultValues: {
      title: "",
      description: "",
      link: "/contact",
      buttonText: "যোগাযোগ করুন",
      placements: ["all"],
      isActive: true,
      priority: 0,
      image: undefined,
    },
  });

  useEffect(() => {
    if (ad) {
      form.reset({
        title: ad.title || "",
        description: ad.description || "",
        link: ad.link || "",
        buttonText: ad.buttonText || "যোগাযোগ করুন",
        placements: ad.placements || ["all"],
        isActive: ad.isActive,
        priority: ad.priority || 0,
        image: undefined,
      });
    }
  }, [ad, form]);

  const selectedPlacements = form.watch("placements") || [];

  function handlePlacementToggle(targetId: string) {
    let updated: string[];

    if (targetId === "all") {
      if (selectedPlacements.includes("all")) {
        updated = [];
      } else {
        updated = AD_PLACEMENTS.map((p) => p.id);
      }
    } else {
      if (selectedPlacements.includes(targetId)) {
        updated = selectedPlacements.filter((p) => p !== targetId && p !== "all");
      } else {
        const withoutAll = selectedPlacements.filter((p) => p !== "all");
        updated = [...withoutAll, targetId];
        const nonAllPlacements = AD_PLACEMENTS.filter((p) => p.id !== "all");
        if (updated.length === nonAllPlacements.length) {
          updated = AD_PLACEMENTS.map((p) => p.id);
        }
      }
    }

    form.setValue("placements", updated, { shouldValidate: true });
  }

  function handleSelectAll() {
    form.setValue(
      "placements",
      AD_PLACEMENTS.map((p) => p.id),
      { shouldValidate: true }
    );
  }

  function handleClearAll() {
    form.setValue("placements", [], { shouldValidate: true });
  }

  async function onSubmit(data: AdForm) {
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          title: data.title,
          description: data.description,
          link: data.link,
          buttonText: data.buttonText,
          placements: data.placements,
          isActive: data.isActive,
          priority: data.priority,
          image: newImage,
        },
      });
      toast.success("Advertisement updated successfully");
      router.push("/admin/ads");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update advertisement");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Advertisement not found</p>
        <Link
          href="/admin/ads"
          className="inline-flex items-center justify-center h-8 px-3 rounded-lg border border-border font-medium mt-4"
        >
          Back to Advertisements
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <Link
        href="/admin/ads"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Advertisements
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Advertisement</h1>
        <p className="text-sm text-muted-foreground">
          Update ad details, banner image, and placement checkboxes.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Ad Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Ad Title / Headline *</Label>
              <Input
                id="title"
                placeholder="Notice / Ad title"
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Ad Description / Body (Optional)</Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Ad description text..."
                {...form.register("description")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="link">Target Link / URL (Optional)</Label>
                <Input id="link" placeholder="/contact or https://..." {...form.register("link")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buttonText">Button CTA Text</Label>
                <Input id="buttonText" placeholder="যোগাযোগ করুন" {...form.register("buttonText")} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="priority">Display Priority (Higher shows first)</Label>
                <Input id="priority" type="number" {...form.register("priority")} />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3 shadow-xs">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive" className="text-sm font-medium">Status Active</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable or disable this ad instantly
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={form.watch("isActive")}
                  onCheckedChange={(checked) => form.setValue("isActive", checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Image & Replace Image */}
        <Card>
          <CardHeader>
            <CardTitle>Banner Image</CardTitle>
            <CardDescription>
              View current banner or upload a replacement.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {ad.image && !newImage && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Current Banner:</p>
                <div className="relative max-w-sm h-36 rounded-xl overflow-hidden border bg-muted">
                  <img
                    src={ad.image.startsWith("http") ? ad.image : `${BACKEND_URL}${ad.image}`}
                    alt={ad.title}
                    className="size-full object-cover"
                  />
                </div>
              </div>
            )}

            <FileUploader
              value={newImage ? [newImage] : []}
              onValueChange={(files) => setNewImage(files[0] ?? null)}
              accept="image/*"
              maxFiles={1}
            >
              <FileUploaderDropzone>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center justify-center rounded-full border p-2.5">
                    <Upload className="size-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">
                    {ad.image ? "Upload a new banner to replace current" : "Upload banner image"}
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, WebP up to 10MB</p>
                </div>
              </FileUploaderDropzone>
              <FileUploaderList>
                {newImage && (
                  <FileUploaderItem file={newImage}>
                    <FileUploaderItemPreview file={newImage} />
                    <FileUploaderItemMetadata file={newImage} />
                    <FileUploaderItemDelete file={newImage} />
                  </FileUploaderItem>
                )}
              </FileUploaderList>
            </FileUploader>
          </CardContent>
        </Card>

        {/* Placements checkboxes */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle>বিজ্ঞাপন প্রদর্শনের স্থান (Ad Placement Locations) *</CardTitle>
                <CardDescription>
                  Select the checkboxes where this advertisement should appear on the website.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="h-8 text-xs"
                >
                  <CheckSquare className="size-3.5 mr-1" />
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  className="h-8 text-xs"
                >
                  <Square className="size-3.5 mr-1" />
                  Clear All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {form.formState.errors.placements && (
              <p className="text-xs text-destructive">
                {form.formState.errors.placements.message}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {AD_PLACEMENTS.map((item) => {
                const isChecked =
                  selectedPlacements.includes("all") || selectedPlacements.includes(item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => handlePlacementToggle(item.id)}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                      isChecked
                        ? "bg-primary/5 border-primary/50 shadow-xs"
                        : "bg-card border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => handlePlacementToggle(item.id)}
                      className="mt-0.5"
                    />
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold leading-tight">{item.label}</p>
                      <p className="text-xs text-muted-foreground leading-normal">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={updateMutation.isPending} size="lg">
            {updateMutation.isPending && (
              <Loader2 className="size-4 mr-2 animate-spin" />
            )}
            Save Changes
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
