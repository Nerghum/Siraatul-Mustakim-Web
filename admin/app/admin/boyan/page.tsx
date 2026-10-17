"use client";

import { useState } from "react";
import {
  useBoyanList,
  useBoyanCategories,
  useBoyanAuthors,
  useDeleteBoyan,
} from "@/hooks/use-boyan";
import { useDebounce } from "@/hooks/use-debounce";
import { DataTable, type Column } from "@/components/shared/data-table";
import { DeleteModal } from "@/components/shared/delete-modal";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, Filter, X, CalendarIcon, Plus, Headphones, Video } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { Boyan } from "@/types/boyan";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { BD_DISTRICTS } from "@/lib/districts";

export default function BoyanPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [mediaTypeFilter, setMediaTypeFilter] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [dateOpen, setDateOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const params: Record<string, string | number | undefined> = {};
  if (debouncedSearch) params.q = debouncedSearch;
  if (mediaTypeFilter) params.mediaType = mediaTypeFilter;
  if (authorFilter) params.author = authorFilter;
  if (categoryFilter) params.category = categoryFilter;
  if (locationFilter) params.location = locationFilter;
  if (dateFrom) params.dateFrom = format(dateFrom, "yyyy-MM-dd");
  if (dateTo) params.dateTo = format(dateTo, "yyyy-MM-dd");
  params.page = page;

  const { data, isLoading, isError, error, refetch } = useBoyanList(params);
  const { data: categories } = useBoyanCategories();
  const { data: authors } = useBoyanAuthors();
  const deleteMutation = useDeleteBoyan();

  function handleDelete() {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Bayan deleted");
        setDeleteId(null);
      },
      onError: () => toast.error("Failed to delete bayan"),
    });
  }

  function clearFilters() {
    setMediaTypeFilter("");
    setAuthorFilter("");
    setCategoryFilter("");
    setLocationFilter("");
    setDateFrom(undefined);
    setDateTo(undefined);
    setPage(1);
  }

  const hasActiveFilters =
    mediaTypeFilter || authorFilter || categoryFilter || locationFilter || dateFrom || dateTo;

  const columns: Column<Boyan>[] = [
    { key: "title", header: "Title", sortable: true },
    {
      key: "mediaType",
      header: "Type",
      render: (item) =>
        item.mediaType === "video" || item.youtubeUrl ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-500/10 dark:text-red-400 px-2 py-0.5 rounded-full">
            <Video className="size-3" /> Video
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            <Headphones className="size-3" /> Audio
          </span>
        ),
    },
    { key: "category", header: "Category", sortable: true },
    {
      key: "location",
      header: "Location",
      render: (item) => item.location || "-",
    },
    {
      key: "author",
      header: "Author / Speaker",
      render: (item) => item.author || "-",
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
          <Link
            href={`/admin/boyan/${item._id}`}
            className="inline-flex items-center justify-center size-8 rounded-md hover:bg-accent"
          >
            <Eye className="size-4" />
          </Link>
          <Link
            href={`/admin/boyan/${item._id}/edit`}
            className="inline-flex items-center justify-center size-8 rounded-md hover:bg-accent"
          >
            <Pencil className="size-4" />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-destructive"
            onClick={() => setDeleteId(item._id)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">All Bayan</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/boyan/categories"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
          >
            Categories
          </Link>
          <Link
            href="/admin/boyan/create"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
          >
            <Plus className="mr-2 size-4" /> Add Bayan
          </Link>
        </div>
      </div>

      {/* Filter Dropdowns + Date Range */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Filter className="size-4" />
          <span>Filters:</span>
        </div>

        {/* Type Filter (Audio / Video) */}
        <Select
          value={mediaTypeFilter}
          onValueChange={(v) => {
            setMediaTypeFilter(v === "__all__" ? "" : (v ?? ""));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Types</SelectItem>
            <SelectItem value="audio">Audio Bayan</SelectItem>
            <SelectItem value="video">Video Bayan</SelectItem>
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select
          value={categoryFilter}
          onValueChange={(v) => {
            setCategoryFilter(v === "__all__" ? "" : (v ?? ""));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-45">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            <SelectItem value="__all__">All Categories</SelectItem>
            {categories?.map((c) => {
              const name = typeof c === "string" ? c : c.name;
              const value = typeof c === "string" ? c : c.slug || c.name;
              return (
                <SelectItem key={value} value={value}>
                  {name}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {/* Location / District Filter */}
        <Select
          value={locationFilter}
          onValueChange={(v) => {
            setLocationFilter(v === "__all__" ? "" : (v ?? ""));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-45">
            <SelectValue placeholder="All Districts" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            <SelectItem value="__all__">All Districts</SelectItem>
            {BD_DISTRICTS.map((d) => (
              <SelectItem key={d.id} value={d.name.bn}>
                {d.name.bn} ({d.name.en})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Author Filter */}
        <Select
          value={authorFilter}
          onValueChange={(v) => {
            setAuthorFilter(v === "__all__" ? "" : (v ?? ""));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-45">
            <SelectValue placeholder="All Authors" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            <SelectItem value="__all__">All Authors</SelectItem>
            {authors?.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Range Picker */}
        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger className="inline-flex items-center justify-center gap-2 h-9 px-3 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors shrink-0">
            <CalendarIcon className="size-4" />
            {dateFrom || dateTo ? (
              <span>
                {dateFrom ? format(dateFrom, "MMM d, yyyy") : "Start"} &ndash;{" "}
                {dateTo ? format(dateTo, "MMM d, yyyy") : "End"}
              </span>
            ) : (
              <span className="text-muted-foreground">Date Range</span>
            )}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex flex-col sm:flex-row gap-0">
              <div className="border-b sm:border-b-0 sm:border-r p-2">
                <p className="text-xs font-medium text-center mb-1">From</p>
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={(day) => {
                    setDateFrom(day);
                    if (day && dateTo && day > dateTo) {
                      setDateTo(undefined);
                    }
                  }}
                  numberOfMonths={1}
                />
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-center mb-1">To</p>
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={(day) => {
                    setDateTo(day);
                    if (day && dateFrom && day < dateFrom) {
                      setDateFrom(undefined);
                    }
                  }}
                  numberOfMonths={1}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-2 border-t">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDateFrom(undefined);
                  setDateTo(undefined);
                }}
              >
                Clear
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setPage(1);
                  setDateOpen(false);
                }}
              >
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearFilters}
          >
            <X className="size-3.5 mr-1" />
            Clear filters
          </Button>
        )}
      </div>

      <DataTable<Boyan>
        columns={columns}
        data={data?.items as Boyan[] | undefined}
        isLoading={isLoading}
        isError={isError}
        error={error as Error | null}
        onRetry={() => refetch()}
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search bayan..."
        createHref="/admin/boyan/create"
        createLabel="Add Bayan"
        page={page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
        emptyMessage="No bayan found"
        emptyDescription="Create your first bayan to get started."
      />
      <DeleteModal
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
