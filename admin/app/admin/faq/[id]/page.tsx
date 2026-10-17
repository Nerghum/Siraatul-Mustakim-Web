"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFaq, useAnswerFaq, useDeleteFaq } from "@/hooks/use-faq";
import { useAuthStore } from "@/store/auth-store";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { answerFaqSchema, type AnswerFaqForm } from "@/lib/validations/faq";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Loader2,
  Trash2,
  MessageSquarePlus,
  Pencil,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { formatDate, stripHtml } from "@/lib/utils";
import { toast } from "sonner";

export default function FaqDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useFaq(id);
  const answerMutation = useAnswerFaq();
  const deleteMutation = useDeleteFaq();
  const currentUser = useAuthStore((s) => s.user);
  console.log("Current User:", currentUser);
  const authorName = currentUser?.name || currentUser?.phone || currentUser?.email || "Admin";
  const faq = data;
  const [answerDialogOpen, setAnswerDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingAnswer, setEditingAnswer] = useState<{
    author: string;
    category: string;
    answer: string;
  } | null>(null);

  const form = useForm<AnswerFaqForm>({
    resolver: zodResolver(answerFaqSchema),
    defaultValues: {
      status: "answered",
      userId: "",
      author: "",
      category: "",
      answer: "",
    },
  });

  function openAnswerModal() {
    setEditingAnswer(null);
    form.reset({
      status: "answered",
      userId: currentUser?.id || "",
      author: authorName,
      category: "",
      answer: "",
    });
    setAnswerDialogOpen(true);
  }

  function openEditModal(answer: {
    author: string;
    category: string;
    answer: string;
  }) {
    setEditingAnswer(answer);
    form.reset({
      status: "answered",
      userId: currentUser?.id || "",
      author: answer.author || authorName,
      category: answer.category,
      answer: answer.answer,
    });
    setAnswerDialogOpen(true);
  }

  function onSubmit(data: AnswerFaqForm) {
    answerMutation.mutate(
      { id, data },
      {
        onSuccess: () => {
          toast.success(
            editingAnswer ? "Answer updated" : "FAQ answered successfully",
          );
          setAnswerDialogOpen(false);
          refetch();
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to answer FAQ");
        },
      },
    );
  }

  function handleDelete() {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("FAQ deleted");
        router.push("/admin/faq");
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to delete FAQ");
        setDeleteDialogOpen(false);
      },
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
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

  if (isError || !faq) {
    return (
      <div className="text-center py-12">
        <p className="">FAQ not found</p>
        <Link
          href="/admin/faq"
          className="inline-flex items-center justify-center h-7 px-2.5 rounded-lg border border-border  font-medium  mt-4"
        >
          Back to FAQ
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/faq"
          className="inline-flex items-center gap-1   hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to FAQ
        </Link>

        <div className="flex items-center gap-2">
          {/* Answer button (always visible) */}
          <Dialog open={answerDialogOpen} onOpenChange={setAnswerDialogOpen}>
            <DialogTrigger render={<Button onClick={openAnswerModal} />}>
              <MessageSquarePlus className="size-4 mr-1" />
              {faq?.answer ? "Edit Answer" : "Answer"}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <DialogHeader>
                  <DialogTitle>
                    {editingAnswer ? "Edit Answer" : "Answer Question"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingAnswer
                      ? "Update the answer details below."
                      : "Provide your answer to this question."}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Mufti (Author)</Label>
                    <Input
                      value={authorName}
                      readOnly
                      className="bg-muted cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={form.watch("category")}
                      onValueChange={(v) => form.setValue("category", v ?? "")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="namaz">Namaz</SelectItem>
                        <SelectItem value="roza">Roza</SelectItem>
                        <SelectItem value="zakat">Zakat</SelectItem>
                        <SelectItem value="hajj">Hajj</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.category && (
                      <p className=" text-destructive">
                        {form.formState.errors.category.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ansText">Answer</Label>
                    <Controller
                      name="answer"
                      control={form.control}
                      render={({ field }) => (
                        <RichTextEditor
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Write your answer..."
                        />
                      )}
                    />
                    {form.formState.errors.answer && (
                      <p className=" text-destructive">
                        {form.formState.errors.answer.message}
                      </p>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={answerMutation.isPending}>
                    {answerMutation.isPending && (
                      <Loader2 className="size-4 mr-2 animate-spin" />
                    )}
                    {editingAnswer ? "Update Answer" : "Submit Answer"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Delete button */}
          <AlertDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          >
            <AlertDialogTrigger>
              <Button variant="destructive">
                <Trash2 className="size-4 mr-1" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this question? This action
                  cannot be undone.
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

      {/* Question Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Question Details</span>
              <Badge
                variant={faq.status === "answered" ? "default" : "secondary"}
              >
                {faq.status || "pending"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className=" ">Question</p>
              <p className="mt-1">{faq.question.question}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className=" ">Author</p>
                <p className="font-medium">{faq.question.author}</p>
              </div>
              {faq.question.district && (
                <div>
                  <p className=" ">District</p>
                  <p className="font-medium">{faq.question.district}</p>
                </div>
              )}
            </div>
            <div>
              <p className=" ">Created</p>
              <p className="font-medium">{formatDate(faq.createdAt)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Answers Section */}
        <Card>
          <CardHeader>
            <CardTitle>Answer</CardTitle>
          </CardHeader>
          <CardContent>
            {!faq?.answer ? (
              <div className="text-center py-8 ">
                <MessageSquarePlus className="size-8 mx-auto mb-2 opacity-40" />
                <p>No answers yet</p>
                <p className="">
                  Click the &quot;Answer&quot; button to add one.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className=" whitespace-pre-wrap">
                        {stripHtml(faq.answer.answer)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEditModal(faq.answer!)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs ">
                    <span>
                      <strong>Author:</strong> {faq.answer.author}
                    </span>
                    {faq.answer.category && (
                      <Badge variant="outline" className="text-xs">
                        {faq.answer.category}
                      </Badge>
                    )}
                    {faq.answer.timestamp && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" />
                        {formatDate(faq.answer.timestamp)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
