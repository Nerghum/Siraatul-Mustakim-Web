"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { faqSchema, type FaqForm } from "@/lib/validations/faq";
import { useCreateFaq } from "@/hooks/use-faq";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateFaqPage() {
  const router = useRouter();
  const createMutation = useCreateFaq();

  const form = useForm<FaqForm>({
    resolver: zodResolver(faqSchema),
    defaultValues: { author: "", district: "", question: "" },
  });

  function onSubmit(data: FaqForm) {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast.success("FAQ created successfully");
        router.push("/admin/faq");
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to create FAQ");
      },
    });
  }

  return (
    <div className="space-y-4">
      <Link
        href="/admin/faq"
        className="inline-flex items-center gap-1   hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to FAQ
      </Link>
      <h1 className="text-2xl font-bold">Create FAQ</h1>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>FAQ Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input id="author" {...form.register("author")} />
              {form.formState.errors.author && (
                <p className=" text-destructive">
                  {form.formState.errors.author.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">District (optional)</Label>
              <Input id="district" {...form.register("district")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Textarea id="question" rows={4} {...form.register("question")} />
              {form.formState.errors.question && (
                <p className=" text-destructive">
                  {form.formState.errors.question.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <Loader2 className="size-4 mr-2 animate-spin" />
              )}
              Create FAQ
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
