"use client";

import { useMemo, useState } from "react";
import {
  useFaqList,
  useFaqFilters,
  useAnswerFaq,
  useDeleteFaq,
} from "@/hooks/use-faq";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { useAuthStore } from "@/store/auth-store";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { answerFaqSchema, type AnswerFaqForm } from "@/lib/validations/faq";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
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
} from "@/components/ui/alert-dialog";
import {
  Eye,
  MessageSquarePlus,
  Trash2,
  Loader2,
  Filter,
  X,
} from "lucide-react";
import Link from "next/link";
import { formatDate, stripHtml } from "@/lib/utils";
import { toast } from "sonner";
import type { Faq } from "@/types/faq";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useDebounce } from "@/hooks/useDebounce";

export default function FaqListPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [authorFilter, setAuthorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");

  const params = useMemo(() => {
    const p: Record<string, string | number> = {};
    if (debouncedSearch.trim()) p.search = debouncedSearch;
    if (authorFilter) p.author = authorFilter;
    if (statusFilter) p.status = statusFilter;
    if (districtFilter) p.district = districtFilter;
    p.page = page;

    return p;
  }, [debouncedSearch, authorFilter, statusFilter, districtFilter, page]);
  const { data, isLoading, isError, error, refetch } = useFaqList(params);
  const { data: filters } = useFaqFilters();
  const answerMutation = useAnswerFaq();
  const deleteMutation = useDeleteFaq();
  const currentUser = useAuthStore((s) => s.user);
  const authorName = currentUser?.name || currentUser?.phone || currentUser?.email || "Admin";
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const updateSettingsMutation = useUpdateSettings();

  // Per-row dialog state
  const [answerFaqId, setAnswerFaqId] = useState<string | null>(null);
  const [isEditingAnswer, setIsEditingAnswer] = useState(false);
  const [deleteFaqId, setDeleteFaqId] = useState<string | null>(null);

  const answerForm = useForm<AnswerFaqForm>({
    resolver: zodResolver(answerFaqSchema),
    defaultValues: {
      status: "answered",
      userId: "",
      author: "",
      category: "",
      answer: "",
    },
  });

  function openAnswerModal(item: Faq) {
    const ans = item.answer;
    if (ans) {
      answerForm.reset({
        status: "answered",
        userId: currentUser?.id || "",
        author: ans.author || authorName,
        category: ans.category,
        answer: stripHtml(ans.answer),
      });
      setIsEditingAnswer(true);
    } else {
      answerForm.reset({
        status: "answered",
        userId: currentUser?.id || "",
        author: authorName,
        category: "",
        answer: "",
      });
      setIsEditingAnswer(false);
    }
    setAnswerFaqId(item._id);
  }

  async function onAnswerSubmit(data: AnswerFaqForm) {
    if (!answerFaqId) return;
    try {
      await answerMutation.mutateAsync({ id: answerFaqId, data });
      toast.success("FAQ answered successfully");
      setAnswerFaqId(null);
      answerForm.reset();
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Failed to answer FAQ");
    }
  }

  async function handleDelete() {
    if (!deleteFaqId) return;
    try {
      await deleteMutation.mutateAsync(deleteFaqId);
      toast.success("FAQ deleted");
      setDeleteFaqId(null);
    } catch {
      toast.error("Failed to delete FAQ");
      setDeleteFaqId(null);
    }
  }

  const columns: Column<Faq>[] = [
    {
      key: "question",
      header: "Question",
      render: (item) => (
        <span className="line-clamp-1">{item.question.question}</span>
      ),
    },
    {
      key: "author",
      header: "Author",
      render: (item) => item.question.author,
    },
    {
      key: "status",
      header: "Status",
      render: (item) =>
        item.status === "answered" && item?.answer ? (
          <TooltipProvider delay={0}>
            <Tooltip>
              <TooltipTrigger
                render={<Badge variant="default">answered</Badge>}
              />
              <TooltipContent className="max-w-sm" side="right">
                <p className="text-xs leading-relaxed whitespace-pre-wrap">
                  {stripHtml(item?.answer?.answer)}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Badge variant="secondary">pending</Badge>
        ),
    },
    {
      key: "district",
      header: "District",
      render: (item) => item.question.district,
    },
    {
      key: "createdAt",
      header: "Created",
      render: (item) => formatDate(item.createdAt),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item) => (
        <div className="flex items-center gap-1">
          {/* View */}
          <Link
            href={`/admin/faq/${item._id}`}
            className="inline-flex items-center justify-center size-8 rounded-md "
          >
            <Eye className="size-4" />
          </Link>
          {/* Answer */}
          <Button
            type="button"
            onClick={() => openAnswerModal(item)}
            className="inline-flex items-center justify-center size-8 rounded-md "
            title={item.answer ? "Edit Answer" : "Add Answer"}
          >
            <MessageSquarePlus className="size-4" />
          </Button>
          {/* Delete */}
          <Button
            type="button"
            onClick={() => setDeleteFaqId(item._id)}
            className="inline-flex items-center justify-center size-8 rounded-md "
            title="Delete"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  const hasActiveFilters = authorFilter || statusFilter || districtFilter;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Question Answer</h1>
        <div className="flex items-center space-x-2">
          <Label htmlFor="question-toggle" className="text-sm font-medium">
            Allow New Questions
          </Label>
          <Switch
            id="question-toggle"
            checked={settings?.isQuestionsEnabled ?? true}
            disabled={settingsLoading || updateSettingsMutation.isPending}
            onCheckedChange={(checked) => {
              updateSettingsMutation.mutate({ isQuestionsEnabled: checked }, {
                onSuccess: () => toast.success(`Questions are now ${checked ? 'enabled' : 'disabled'}`),
                onError: () => toast.error("Failed to update settings")
              });
            }}
          />
        </div>
      </div>

      {/* Filter Dropdowns */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Filter className="size-4" />
          <span>Filters:</span>
        </div>

        {/* Author Filter */}
        <Select
          value={authorFilter}
          onValueChange={(v) => {
            setAuthorFilter(v === "__all__" ? "" : (v ?? ""));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Authors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Authors</SelectItem>
            {filters?.authors?.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v === "__all__" ? "" : (v ?? ""));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Statuses</SelectItem>
            {filters?.statuses?.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* District Filter */}
        <Select
          value={districtFilter}
          onValueChange={(v) => {
            setDistrictFilter(v === "__all__" ? "" : (v ?? ""));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Districts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Districts</SelectItem>
            {filters?.districts?.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setAuthorFilter("");
              setStatusFilter("");
              setDistrictFilter("");
              setPage(1);
            }}
          >
            <X className="size-3.5 mr-1" />
            Clear filters
          </Button>
        )}
      </div>

      <DataTable<Faq>
        columns={columns}
        data={data as Faq[] | undefined}
        isLoading={isLoading}
        isError={isError}
        error={error as Error | null}
        onRetry={() => refetch()}
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search Questions..."
        createHref=""
        createLabel="Add FAQ"
        page={page}
        totalPages={1}
        emptyMessage="No FAQ found"
        emptyDescription="Create your first FAQ to get started."
      />

      {/* Answer Dialog */}
      <Dialog
        open={!!answerFaqId}
        onOpenChange={(o) => {
          if (!o) setAnswerFaqId(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={answerForm.handleSubmit(onAnswerSubmit)}>
            <DialogHeader>
              <DialogTitle>
                {isEditingAnswer ? "Edit Answer" : "Answer Question"}
              </DialogTitle>
              <DialogDescription>
                {isEditingAnswer
                  ? "Update the existing answer."
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
                  value={answerForm.watch("category")}
                  onValueChange={(v) =>
                    answerForm.setValue("category", v ?? "")
                  }
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
                {answerForm.formState.errors.category && (
                  <p className=" text-destructive">
                    {answerForm.formState.errors.category.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Answer</Label>
                <Controller
                  name="answer"
                  control={answerForm.control}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Write your answer..."
                    />
                  )}
                />
                {answerForm.formState.errors.answer && (
                  <p className=" text-destructive">
                    {answerForm.formState.errors.answer.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={answerMutation.isPending}>
                {answerMutation.isPending && (
                  <Loader2 className="size-4 mr-2 animate-spin" />
                )}
                Submit Answer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteFaqId}
        onOpenChange={(o) => {
          if (!o) setDeleteFaqId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this question? This action cannot
              be undone.
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
  );
}
