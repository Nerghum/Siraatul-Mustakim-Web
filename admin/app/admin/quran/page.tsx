"use client";

import { useState } from "react";
import { useQuranList, useDeleteQuranSurah, useSyncQuranData } from "@/hooks/use-quran";
import { useDebounce } from "@/hooks/use-debounce";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Eye,
  Trash2,
  Pencil,
  Loader2,
  Search,
  RotateCcw,
  BookOpen,
  Volume2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Compass,
  CheckCircle2,
  X,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { QuranSurah } from "@/types/quran";

function formatDuration(totalSeconds?: number | null): string {
  if (!totalSeconds || totalSeconds <= 0) return "--:--";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function QuranListPage() {
  const [search, setSearch] = useState("");
  const [selectedPara, setSelectedPara] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [pageSize, setPageSize] = useState<number>(20);
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const params: Record<string, string | number | undefined> = {
    page,
    limit: pageSize,
  };
  if (debouncedSearch) params.search = debouncedSearch;
  if (selectedPara !== "all") params.para = Number(selectedPara);
  if (selectedType !== "all") params.type = selectedType;

  const { data, isLoading, isError, error, refetch } = useQuranList(params);
  const deleteMutation = useDeleteQuranSurah();
  const syncMutation = useSyncQuranData();

  async function handleSync() {
    try {
      await syncMutation.mutateAsync();
      toast.success("Quran data & Tafsir synced successfully into storage!");
      refetch();
    } catch {
      toast.error("Failed to sync Quran data");
    }
  }

  const isFiltering =
    Boolean(debouncedSearch) || selectedPara !== "all" || selectedType !== "all";

  function resetFilters() {
    setSearch("");
    setSelectedPara("all");
    setSelectedType("all");
    setPage(1);
  }

  async function handleDelete() {
    if (deleteId === null) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("Surah deleted successfully");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete surah");
      setDeleteId(null);
    }
  }

  const surahs: QuranSurah[] = data?.data || [];
  const pagination = data?.pagination || {
    total: 0,
    page: 1,
    limit: pageSize,
    pages: 1,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight">Quran Majeed</h1>
            <Badge
              variant="outline"
              className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 flex items-center gap-1 font-medium"
            >
              <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              114 Surahs Synced
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Complete Holy Quran with authentic Arabic text (Uthmani), Bengali
            translation (Muhiuddin Khan), and synchronized audio timestamps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncMutation.isPending}
            className="h-9 gap-1.5"
          >
            {syncMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RotateCcw className="size-4" />
            )}
            Sync to Storage
          </Button>
          <Link
            href="/admin/quran/create"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-input bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Custom Surah
          </Link>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <Card className="border bg-card/60 backdrop-blur-sm shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-600 dark:text-emerald-400">
              <BookOpen className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Total Surahs
              </p>
              <p className="text-2xl font-bold tracking-tight">114</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border bg-card/60 backdrop-blur-sm shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2.5 text-blue-600 dark:text-blue-400">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Total Verses
              </p>
              <p className="text-2xl font-bold tracking-tight">6,236</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border bg-card/60 backdrop-blur-sm shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-600 dark:text-amber-400">
              <Compass className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Revelation
              </p>
              <p className="text-sm font-semibold tracking-tight">
                86 Makki / 28 Madani
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border bg-card/60 backdrop-blur-sm shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-indigo-500/10 p-2.5 text-indigo-600 dark:text-indigo-400">
              <Volume2 className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Recitation Audio
              </p>
              <p className="text-sm font-semibold tracking-tight">
                Mishary Alafasy
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border shadow-xs">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by Surah name (English, বাংলা, Arabic) or number..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 pr-8 h-9"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Para (Juz) Filter */}
            <div className="w-[160px]">
              <Select
                value={selectedPara}
                onValueChange={(val) => {
                  if (val) setSelectedPara(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Paras" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="all">All Paras (1 - 30)</SelectItem>
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={String(num)}>
                      Para {num} (পারা {num})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Revelation Type Filter */}
            <div className="w-[150px]">
              <Select
                value={selectedType}
                onValueChange={(val) => {
                  if (val) setSelectedType(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Meccan">Meccan (মাক্কী)</SelectItem>
                  <SelectItem value="Medinan">Medinan (মাদানী)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Page Size Filter */}
            <div className="w-[130px]">
              <Select
                value={String(pageSize)}
                onValueChange={(val) => {
                  if (val) setPageSize(Number(val));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20 / page</SelectItem>
                  <SelectItem value="50">50 / page</SelectItem>
                  <SelectItem value="114">All 114 Surahs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reset Filter Button */}
            {isFiltering && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-9 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="size-3.5 mr-1.5" />
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Surahs Table */}
      <div className="rounded-lg border bg-card shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-8 w-12 rounded" />
                <Skeleton className="h-8 flex-1 rounded" />
                <Skeleton className="h-8 w-24 rounded" />
                <Skeleton className="h-8 w-20 rounded" />
                <Skeleton className="h-8 w-28 rounded" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-destructive font-medium">
              {(error as Error)?.message || "Failed to load Quran surahs."}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        ) : surahs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <BookOpen className="size-10 mx-auto text-muted-foreground/50" />
            <p className="text-base font-semibold">No Surahs found</p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              No surahs match your current filters. Try resetting the search or
              filters.
            </p>
            {isFiltering && (
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-16 text-center">#</TableHead>
                <TableHead className="min-w-[200px]">Surah Name</TableHead>
                <TableHead className="w-24 text-center">Para / Juz</TableHead>
                <TableHead className="w-28 text-center">Revelation</TableHead>
                <TableHead className="w-24 text-center">Verses</TableHead>
                <TableHead className="min-w-[170px]">Recitation</TableHead>
                <TableHead className="w-36 text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {surahs.map((surah) => (
                <TableRow
                  key={surah.id}
                  className="hover:bg-muted/30 transition-colors group"
                >
                  {/* Surah Number */}
                  <TableCell className="text-center font-mono font-medium">
                    <span className="inline-flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      {String(surah.id).padStart(3, "0")}
                    </span>
                  </TableCell>

                  {/* Surah Name */}
                  <TableCell>
                    <div className="flex items-baseline justify-between gap-4">
                      <div>
                        <Link
                          href={`/admin/quran/${surah.id}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors text-base"
                        >
                          {surah.name_en}
                        </Link>
                        <p className="text-xs text-muted-foreground font-medium">
                          {surah.name_bn} {surah.meaning_bn ? `• ${surah.meaning_bn}` : ""}
                        </p>
                      </div>
                      <span
                        dir="rtl"
                        className="text-lg font-serif text-foreground/80"
                        title={surah.name_ar}
                      >
                        {surah.name_ar}
                      </span>
                    </div>
                  </TableCell>

                  {/* Para */}
                  <TableCell className="text-center">
                    <Badge variant="outline" className="font-mono text-xs">
                      Para {surah.para || 1}
                    </Badge>
                  </TableCell>

                  {/* Revelation Type */}
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        surah.type === "Meccan" ? "default" : "secondary"
                      }
                      className={
                        surah.type === "Meccan"
                          ? "bg-amber-500/10 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
                          : "bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
                      }
                    >
                      {surah.type}
                    </Badge>
                  </TableCell>

                  {/* Total Verses */}
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center font-mono text-xs bg-muted px-2 py-0.5 rounded">
                      {surah.total_verses} Ayahs
                    </span>
                  </TableCell>

                  {/* Recitation */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Volume2 className="size-3.5" />
                      </div>
                      <div className="text-xs">
                        <p className="font-medium">Mishary Alafasy</p>
                        <p className="text-muted-foreground font-mono">
                          {formatDuration(surah.audio?.duration)}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right pr-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/quran/${surah.id}`}
                        className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors shadow-xs"
                        title="View verses and play audio"
                      >
                        <Eye className="size-3.5" />
                        <span>View</span>
                      </Link>
                      <Link
                        href={`/admin/quran/${surah.id}/edit`}
                        className="inline-flex items-center justify-center size-8 rounded-md border border-input text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        title="Edit Surah"
                      >
                        <Pencil className="size-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteId(surah.id)}
                        className="inline-flex items-center justify-center size-8 rounded-md border border-input text-destructive hover:bg-destructive/10 transition-colors"
                        title="Delete Surah"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination Toolbar */}
        {!isLoading && !isError && surahs.length > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t px-4 py-3 bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-foreground">
                {Math.min(
                  pagination.page * pagination.limit,
                  pagination.total
                )}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {pagination.total}
              </span>{" "}
              Surahs
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                className="h-8 gap-1"
              >
                <ChevronLeft className="size-3.5" />
                Previous
              </Button>
              <span className="text-xs font-medium px-2">
                Page {pagination.page} of {Math.max(1, pagination.pages)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={pagination.page >= pagination.pages}
                className="h-8 gap-1"
              >
                Next
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Surah</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete Surah #{deleteId}? This will delete
              all its verses and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
