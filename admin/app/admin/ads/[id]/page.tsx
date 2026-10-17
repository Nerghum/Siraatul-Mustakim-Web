"use client";

import { useParams, useRouter } from "next/navigation";
import { useAd, useDeleteAd } from "@/hooks/use-ad";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { ArrowLeft, Trash2, Loader2, Pencil, ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { useState } from "react";
import { AD_PLACEMENTS } from "@/types/ad";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
const BACKEND_URL = API_BASE.replace("/api", "");

function getPlacementLabel(id: string): string {
  const item = AD_PLACEMENTS.find((p) => p.id === id);
  return item ? item.label : id;
}

export default function AdDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: ad, isLoading, isError } = useAd(id);
  const deleteMutation = useDeleteAd();
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Advertisement deleted successfully");
      router.push("/admin/ads");
    } catch {
      toast.error("Failed to delete advertisement");
      setDeleteOpen(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl">
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

  if (isError || !ad) {
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
      <div className="flex items-center justify-between">
        <Link
          href="/admin/ads"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Advertisements
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/ads/${id}/edit`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Pencil className="size-4 mr-1.5" />
            Edit
          </Link>
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-4 mr-1.5" />
              Delete
            </Button>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Advertisement</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this advertisement? This action cannot be undone.
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

      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{ad.title}</h1>
        <div className="flex items-center gap-3 pt-1">
          <Badge variant={ad.isActive ? "default" : "secondary"}>
            {ad.isActive ? "Active" : "Inactive"}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Created: {formatDate(ad.createdAt)}
          </span>
          <span className="text-xs text-muted-foreground">
            Clicks: {ad.clicks || 0}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Ad Live Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                Live Card Preview
              </CardTitle>
              <CardDescription>
                How this ad appears to visitors on the frontend:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-sm mx-auto p-6 rounded-2xl bg-[#1f9c5e0a] border border-[#1f9c5e1a] text-center flex flex-col items-center">
                <span className="bg-[#27a85d] text-white text-xs font-semibold px-6 py-1.5 rounded-full mb-4">
                  বিজ্ঞাপন
                </span>

                {ad.image && (
                  <div className="w-full h-36 rounded-xl overflow-hidden mb-4 border bg-muted">
                    <img
                      src={ad.image.startsWith("http") ? ad.image : `${BACKEND_URL}${ad.image}`}
                      alt={ad.title}
                      className="size-full object-cover"
                    />
                  </div>
                )}

                <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug">
                  {ad.title}
                </h3>

                {ad.description && (
                  <p className="text-xs text-gray-600 mb-5 leading-relaxed">
                    {ad.description}
                  </p>
                )}

                {ad.link && (
                  <a
                    href={ad.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-4/5 py-2.5 rounded-full bg-white text-[#1f4a31] text-sm font-bold shadow-xs border border-gray-100 hover:bg-gray-50 transition-colors inline-block"
                  >
                    {ad.buttonText || "যোগাযোগ করুন"}
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Target Link &amp; Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b">
                <span className="text-muted-foreground font-medium">Destination URL:</span>
                <span className="font-mono text-xs flex items-center gap-1 text-primary">
                  {ad.link || "None"}
                  {ad.link && <ExternalLink className="size-3" />}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b">
                <span className="text-muted-foreground font-medium">Button Text:</span>
                <span>{ad.buttonText || "Default"}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b">
                <span className="text-muted-foreground font-medium">Priority:</span>
                <span>{ad.priority || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Target Placements */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Selected Placements</CardTitle>
              <CardDescription>
                Pages where this advertisement is currently allowed to display:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {ad.placements?.includes("all") ? (
                  <Badge variant="default" className="py-1 px-3 text-sm justify-center bg-emerald-600">
                    সব পেজে (All Pages)
                  </Badge>
                ) : (
                  ad.placements?.map((p) => (
                    <div
                      key={p}
                      className="p-2.5 rounded-lg border bg-muted/40 text-xs font-medium"
                    >
                      {getPlacementLabel(p)}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
