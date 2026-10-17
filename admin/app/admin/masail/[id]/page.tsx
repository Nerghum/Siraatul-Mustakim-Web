"use client";

import { useParams, useRouter } from "next/navigation";
import { useMasail, useDeleteMasail } from "@/hooks/use-masail";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteModal } from "@/components/shared/delete-modal";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { formatDate, stripHtml } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";
import { Masail } from "@/types/masail";
import { useAuthStore } from "@/store/auth-store";
import parse from "html-react-parser";

const ALLOWED_ROLES = ["admin", "moderator", "mufti"];

export default function MasailDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const hasAccess =
    currentUser && ALLOWED_ROLES.includes(currentUser.role || "");
  const { data, isLoading, isError } = useMasail(id);
  const deleteMutation = useDeleteMasail();
  const [showDelete, setShowDelete] = useState(false);
  const masail = data as unknown as Masail;

  function handleDelete() {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Masail deleted");
        router.push("/admin/masail");
      },
      onError: () => toast.error("Failed to delete masail"),
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

  if (isError || !masail) {
    return (
      <div className="text-center py-12">
        <p className="">Masail not found</p>
        <Link
          href="/admin/masail"
          className="inline-flex items-center justify-center h-7 px-2.5 rounded-lg border border-border  font-medium  mt-4"
        >
          Back to Masail
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/masail"
          className="inline-flex items-center gap-1   hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
        {hasAccess && (
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/masail/${masail._id}/edit`}
              className="inline-flex items-center justify-center h-7 gap-1 px-2.5 rounded-lg border border-border  font-medium "
            >
              <Pencil className="size-4" />
              Edit
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDelete(true)}
            >
              <Trash2 className="size-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{masail.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-bold">Description</p>
            <div className="mt-1">{parse(masail.description)}</div>
          </div>
          <div>
            <p className="font-medium">Created</p>
            <p className="font-medium">{formatDate(masail.createdAt)}</p>
          </div>
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
