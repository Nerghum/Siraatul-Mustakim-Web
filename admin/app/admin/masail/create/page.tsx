"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { masailSchema, type MasailForm } from "@/lib/validations/masail";
import { useCreateMasail, useMasailCategories } from "@/hooks/use-masail";
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
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";


export default function CreateMasailPage() {
  const router = useRouter();
  const createMutation = useCreateMasail();
  const { data: categories = [] } = useMasailCategories();

  const form = useForm<MasailForm>({
    resolver: zodResolver(masailSchema),
    defaultValues: { title: "", description: "" },
  });

  function onSubmit(data: MasailForm) {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Masail created successfully");
        router.push("/admin/masail");
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to create masail");
      },
    });
  }

  return (
    <div className="space-y-4">
      <Link
        href="/admin/masail"
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4 mr-1" />
        Back to Masail
      </Link>
      <h1 className="text-2xl font-bold">Create Masail</h1>
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
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <Loader2 className="size-4 mr-2 animate-spin" />
              )}
              Create Masail
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
