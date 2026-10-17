"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adSchema, type AdForm } from "@/lib/validations/ad";
import { useCreateAd } from "@/hooks/use-ad";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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

export default function CreateAdPage() {
  const router = useRouter();
  const createMutation = useCreateAd();

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

  const selectedPlacements = form.watch("placements") || [];

  function handlePlacementToggle(id: string) {
    let updated: string[];

    if (id === "all") {
      if (selectedPlacements.includes("all")) {
        updated = [];
      } else {
        updated = AD_PLACEMENTS.map((p) => p.id);
      }
    } else {
      if (selectedPlacements.includes(id)) {
        updated = selectedPlacements.filter((p) => p !== id && p !== "all");
      } else {
        const withoutAll = selectedPlacements.filter((p) => p !== "all");
        updated = [...withoutAll, id];
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
      await createMutation.mutateAsync({
        title: data.title,
        description: data.description,
        link: data.link,
        buttonText: data.buttonText,
        placements: data.placements,
        isActive: data.isActive,
        priority: data.priority,
        image: data.image,
      });
      toast.success("Advertisement created successfully");
      router.push("/admin/ads");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create advertisement");
    }
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
        <h1 className="text-2xl font-bold tracking-tight">Create Advertisement</h1>
        <p className="text-sm text-muted-foreground">
          Create an ad and choose the exact locations/pages across the website where it should appear.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Details */}
        <Card>
          <CardHeader>
            <CardTitle>Ad Details</CardTitle>
            <CardDescription>
              Basic information, headline, and destination link for this advertisement.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Ad Title / Headline *</Label>
              <Input
                id="title"
                placeholder="e.g. এখানে আপনার হালাল বিজ্ঞাপন দিন"
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
                placeholder="e.g. আপনার বিজ্ঞাপনের অর্থ সিরাতুল মুস্তাকিম অ্যাপের মেইনট্যানেন্স এর জন্য ব্যয় করা হবে।"
                {...form.register("description")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="link">Target Link / URL (Optional)</Label>
                <Input
                  id="link"
                  placeholder="e.g. /contact or https://your-website.com"
                  {...form.register("link")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buttonText">Button CTA Text</Label>
                <Input
                  id="buttonText"
                  placeholder="e.g. যোগাযোগ করুন or ভিজিট করুন"
                  {...form.register("buttonText")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="priority">Display Priority (Higher shows first)</Label>
                <Input
                  id="priority"
                  type="number"
                  placeholder="0"
                  {...form.register("priority")}
                />
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

        {/* Banner Image */}
        <Card>
          <CardHeader>
            <CardTitle>Banner Image (Optional)</CardTitle>
            <CardDescription>
              Upload a visual ad banner. If uploaded, it will be displayed directly in the selected ad slots.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploader
              value={form.watch("image") ? [form.watch("image") as File] : []}
              onValueChange={(files) => form.setValue("image", files[0] ?? undefined)}
              accept="image/*"
              maxFiles={1}
            >
              <FileUploaderDropzone>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center justify-center rounded-full border p-2.5">
                    <Upload className="size-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">Drag &amp; drop banner image here</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, WebP up to 10MB</p>
                </div>
              </FileUploaderDropzone>
              <FileUploaderList>
                {form.watch("image") && (
                  <FileUploaderItem file={form.watch("image") as File}>
                    <FileUploaderItemPreview file={form.watch("image") as File} />
                    <FileUploaderItemMetadata file={form.watch("image") as File} />
                    <FileUploaderItemDelete file={form.watch("image") as File} />
                  </FileUploaderItem>
                )}
              </FileUploaderList>
            </FileUploader>
          </CardContent>
        </Card>

        {/* Placements - The core requirement */}
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
          <Button type="submit" disabled={createMutation.isPending} size="lg">
            {createMutation.isPending && (
              <Loader2 className="size-4 mr-2 animate-spin" />
            )}
            Publish Advertisement
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
