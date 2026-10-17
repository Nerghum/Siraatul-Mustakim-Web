"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { masailSchema, type MasailForm } from "@/lib/validations/masail";
import { useMasail, useUpdateMasail, useMasailCategories } from "@/hooks/use-masail";
import type { Masail } from "@/types/masail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";


interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export default function EditMasailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data, isLoading } = useMasail(id);
  const { data: categories = [] } = useMasailCategories();
  const updateMutation = useUpdateMasail();
  const masail = data as unknown as Masail;
  const form = useForm<MasailForm>({
    resolver: zodResolver(masailSchema),
    defaultValues: { title: "", description: "" },
  });

  useEffect(() => {
    if (masail) {
      form.reset({ 
        title: masail?.title, 
        description: masail?.description,
        category: masail?.category || undefined,
      });
    }
  }, [masail, form]);

  function onSubmit(data: MasailForm) {
    updateMutation.mutate(
      { id, data },
      {
        onSuccess: () => {
          toast.success("Masail updated");
          router.push(`/admin/masail/${id}`);
        },
        onError: (err: ApiError) => {
          toast.error(err.response?.data?.message || "Failed to update masail");
        },
      },
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!masail) {
    return (
      <div className="text-center py-12">
        <p className="">Masail not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href={`/admin/masail/${id}`}
        className="inline-flex items-center gap-1   hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back
      </Link>
      <h1 className="text-2xl font-bold">Edit Masail</h1>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Masail Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...form.register("title")} />
              {form.formState.errors.title && (
                <p className=" text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Controller
                name="category"
                control={form.control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c: any) => (
                        <SelectItem key={c.slug} value={c.slug}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Controller
                name="description"
                control={form.control}
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Write masail description..."
                  />
                )}
              />
              {form.formState.errors.description && (
                <p className=" text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
                <Loader2 className="size-4 mr-2 animate-spin" />
              )}
              Update Masail
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
