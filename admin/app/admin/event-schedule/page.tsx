"use client";

import { useMemo, useState } from "react";
import { BD_DISTRICTS } from "@/lib/districts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  ExternalLink,
  Loader2,
  MapPinned,
  Pencil,
  Plus,
  Trash2,
  X,
  User,
  Phone,
  Upload,
  ImageIcon,
} from "lucide-react";
import {
  FileUploader,
  FileUploaderDropzone,
  FileUploaderList,
  FileUploaderItem,
  FileUploaderItemPreview,
  FileUploaderItemMetadata,
  FileUploaderItemDelete,
} from "@/components/ui/file-uploader";
import Link from "next/link";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import {
  eventsScheduleSchema,
  type EventsScheduleForm,
} from "@/lib/validations/event-schedule";
import {
  useCreateEventsSchedule,
  useDeleteEventsSchedule,
  useEventsSchedules,
  useUpdateEventsSchedule,
} from "@/hooks/use-events-schedule";
import type { EventsSchedule } from "@/types/event-schedule";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
const BACKEND_URL = API_BASE.replace("/api", "");

function getImageUrl(imgPath?: string) {
  if (!imgPath) return null;
  if (imgPath.startsWith("http")) return imgPath;
  return `${BACKEND_URL}${imgPath.startsWith("/") ? "" : "/"}${imgPath}`;
}

function getSearchableText(item: EventsSchedule) {
  return [item.title, item.districtName, item.date, item.location, item.path]
    .join(" ")
    .toLowerCase();
}

export default function EventSchedulePage() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<EventsSchedule | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useEventsSchedules();
  const createMutation = useCreateEventsSchedule();
  const updateMutation = useUpdateEventsSchedule();
  const deleteMutation = useDeleteEventsSchedule();

  const form = useForm<EventsScheduleForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(eventsScheduleSchema) as any,
    defaultValues: {
      districtName: "",
      date: "",
      time: "",
      location: "",
      path: "",
      googleMapsUrl: "",
      title: "",
      timeText: "",
      contacts: [],
      image: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "contacts",
  });

  const filteredEvents = useMemo(() => {
    const items = data ?? [];
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) => getSearchableText(item).includes(query));
  }, [data, search]);

  function openCreateModal() {
    setEditItem(null);
    setSelectedDistrict("");
    setSelectedImageFile(null);
    setExistingImageUrl(null);
    form.reset({
      districtName: "",
      date: "",
      time: "",
      location: "",
      path: "",
      googleMapsUrl: "",
      title: "",
      timeText: "",
      contacts: [],
      type: "green",
      image: undefined,
    });
    setDialogOpen(true);
  }

  function openEditModal(item: EventsSchedule) {
    setEditItem(item);
    const matched = BD_DISTRICTS.find(
      (d) =>
        d.name.bn === item.districtName ||
        d.name.en.toLowerCase() === (item.districtName || "").toLowerCase()
    );
    const districtVal = matched ? matched.name.bn : item.districtName;
    setSelectedDistrict(districtVal);
    setSelectedImageFile(null);
    setExistingImageUrl(item.image ? getImageUrl(item.image) : null);
    form.reset({
      districtName: districtVal,
      date: item.date,
      time: item.time,
      location: item.location,
      path: item.path,
      googleMapsUrl: item.googleMapsUrl,
      title: item.title ?? "",
      timeText: item.timeText ?? "",
      contacts: item.contacts ?? [],
      type: item.type ?? "green",
      image: item.image,
    });
    setDialogOpen(true);
  }

  async function onSubmit(data: EventsScheduleForm) {
    try {
      const payload = {
        ...data,
        image: selectedImageFile || data.image || "",
      };
      if (editItem) {
        await updateMutation.mutateAsync({
          id: editItem._id,
          data: payload,
        });
        toast.success("Event updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Event created");
      }
      setDialogOpen(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Operation failed");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("Event deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete event");
      setDeleteId(null);
    }
  }

  const columns: Column<EventsSchedule>[] = [
    {
      key: "title",
      header: "Title",
      render: (item) => (
        <div className="flex items-center gap-2.5">
          {item.image ? (
            <img
              src={getImageUrl(item.image) || ""}
              alt=""
              className="size-8 rounded object-cover border shrink-0"
            />
          ) : (
            <div className="size-8 rounded bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
              <ImageIcon className="size-4" />
            </div>
          )}
          <span className="font-medium line-clamp-1">
            {item.title || item.districtName}
          </span>
        </div>
      ),
    },
    {
      key: "districtName",
      header: "Zilla",
      render: (item) => (
        <span className="line-clamp-1">{item.districtName}</span>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (item) => <span>{item.date}</span>,
    },
    {
      key: "time",
      header: "Time",
      render: (item) => (
        <span className="line-clamp-1">
          {item.timeText ? `${item.timeText} (${item.time})` : item.time}
        </span>
      ),
    },
    {
      key: "location",
      header: "Location",
      render: (item) => (
        <span className="line-clamp-1">{item.location.slice(0, 20)}</span>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (item) => (
        <span className="line-clamp-1">
          {item.contacts && item.contacts.length > 0
            ? item.contacts
                .map((c) => `${c.name} (${c.phone})`)
                .join(", ")
                .slice(0, 20)
            : "—"}
        </span>
      ),
    },
    {
      key: "type",
      header: "Style",
      render: (item) => (
        <Badge
          variant="outline"
          className={
            item.type === "amber"
              ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200"
              : "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200"
          }
        >
          {item.type === "amber" ? "Amber" : "Green"}
        </Badge>
      ),
    },

    {
      key: "actions",
      header: "Actions",
      render: (item) => (
        <div className="flex items-center gap-1">
          <Link
            href={item.googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center size-8 rounded-md "
            title="Open Maps"
          >
            <MapPinned className="size-4" />
          </Link>
          <Button
            type="button"
            onClick={() => openEditModal(item)}
            className="inline-flex items-center justify-center size-8 rounded-md "
            title="Edit"
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            onClick={() => setDeleteId(item._id)}
            className="inline-flex items-center justify-center size-8 rounded-md "
            title="Delete"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Bayan Schedule</h1>
          <p className=" ">
            Manage bayan schedule entries, locations, and map links.
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="size-4 mr-2" />
          Add Bayan Schedule
        </Button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-50 max-w-sm">
          <Input
            placeholder="Search by title, zilla, or date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-3"
          />
        </div>
      </div>

      <DataTable<EventsSchedule>
        columns={columns}
        data={filteredEvents}
        isLoading={isLoading}
        isError={isError}
        error={error as Error | null}
        onRetry={() => refetch()}
        emptyMessage="No events found"
        emptyDescription="Create your first event schedule to get started."
        createHref=""
        createLabel=""
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                {editItem ? "Edit Event" : "Create Event"}
              </DialogTitle>
              <DialogDescription>
                {editItem
                  ? "Update the event schedule details."
                  : "Add a new event schedule entry."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Event title"
                  {...form.register("title")}
                />
              </div>

              <div className="space-y-2">
                <Label>Zilla</Label>
                <Select
                  value={selectedDistrict}
                  onValueChange={(value) => {
                    if (value) {
                      setSelectedDistrict(value);
                      form.setValue("districtName", value, { shouldValidate: true });
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Bangladesh district" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {BD_DISTRICTS.map((d) => (
                      <SelectItem key={d.id} value={d.name.bn}>
                        {d.name.bn} ({d.name.en})
                      </SelectItem>
                    ))}
                    {selectedDistrict &&
                      !BD_DISTRICTS.some((d) => d.name.bn === selectedDistrict) && (
                        <SelectItem value={selectedDistrict}>
                          {selectedDistrict}
                        </SelectItem>
                      )}
                  </SelectContent>
                </Select>
                {form.formState.errors.districtName && (
                  <p className=" text-destructive">
                    {form.formState.errors.districtName.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" {...form.register("date")} />
                  {form.formState.errors.date && (
                    <p className=" text-destructive">
                      {form.formState.errors.date.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timePicker">Time</Label>
                  <Input
                    id="timePicker"
                    type="time"
                    {...form.register("time")}
                  />
                  {form.formState.errors.time && (
                    <p className=" text-destructive">
                      {form.formState.errors.time.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeText">Time Text (optional)</Label>
                <Input
                  id="timeText"
                  placeholder="e.g. After Maghrib, Before Jummah"
                  {...form.register("timeText")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Event location"
                  {...form.register("location")}
                />
                {form.formState.errors.location && (
                  <p className=" text-destructive">
                    {form.formState.errors.location.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Card Style / Badge</Label>
                <Select
                  value={form.watch("type") ?? "green"}
                  onValueChange={(val) => {
                    if (val === "amber" || val === "green") {
                      form.setValue("type", val);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select card style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="green">Green (সবুজ)</SelectItem>
                    <SelectItem value="amber">Amber (হলুদ / অ্যাম্বার)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Multiple Contacts</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ name: "", phone: "" })}
                  >
                    <Plus className="size-3.5 mr-1" />
                    Add Contact
                  </Button>
                </div>
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-start gap-2 rounded-lg border p-3"
                  >
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label
                          className="text-xs"
                          htmlFor={`contacts.${index}.name`}
                        >
                          Name
                        </Label>
                        <div className="relative">
                          <User className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 " />
                          <Input
                            id={`contacts.${index}.name`}
                            placeholder="Name"
                            className="pl-8"
                            {...form.register(`contacts.${index}.name`)}
                          />
                        </div>
                        {form.formState.errors.contacts?.[index]?.name && (
                          <p className="text-xs text-destructive">
                            {
                              form.formState.errors.contacts[index]?.name
                                ?.message
                            }
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label
                          className="text-xs"
                          htmlFor={`contacts.${index}.phone`}
                        >
                          Phone
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 " />
                          <Input
                            id={`contacts.${index}.phone`}
                            placeholder="Phone number"
                            className="pl-8"
                            {...form.register(`contacts.${index}.phone`)}
                          />
                        </div>
                        {form.formState.errors.contacts?.[index]?.phone && (
                          <p className="text-xs text-destructive">
                            {
                              form.formState.errors.contacts[index]?.phone
                                ?.message
                            }
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="inline-flex items-center justify-center size-8 rounded-md  mt-5 shrink-0"
                      title="Remove contact"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="path">Path</Label>
                <Textarea
                  id="path"
                  placeholder="details about the event, directions etc."
                  {...form.register("path")}
                />
                {form.formState.errors.path && (
                  <p className=" text-destructive">
                    {form.formState.errors.path.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="googleMapsUrl">Google Maps Share Link</Label>
                <Input
                  id="googleMapsUrl"
                  placeholder="https://maps.app.goo.gl/wnKNUBd23ukhAF8V9"
                  {...form.register("googleMapsUrl")}
                />
                <p className="text-xs  flex items-center gap-1">
                  <ExternalLink className="size-3.5" />
                  Use a Google Maps share link.
                </p>
                {form.formState.errors.googleMapsUrl && (
                  <p className=" text-destructive">
                    {form.formState.errors.googleMapsUrl.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Banner / Cover Image (optional)</Label>
                <FileUploader
                  value={selectedImageFile ? [selectedImageFile] : []}
                  onValueChange={(files) => {
                    const file = files[0] ?? null;
                    setSelectedImageFile(file);
                    if (file) {
                      form.setValue("image", file);
                    }
                  }}
                  accept="image/*"
                  maxFiles={1}
                >
                  <FileUploaderDropzone>
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center justify-center rounded-full border p-2.5">
                        <Upload className="size-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">
                        Drag &amp; drop banner image here
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Or click to browse (displayed on web schedule drawer)
                      </p>
                    </div>
                  </FileUploaderDropzone>
                  <FileUploaderList>
                    {selectedImageFile && (
                      <FileUploaderItem file={selectedImageFile}>
                        <FileUploaderItemPreview file={selectedImageFile} />
                        <FileUploaderItemMetadata file={selectedImageFile} />
                        <FileUploaderItemDelete file={selectedImageFile} />
                      </FileUploaderItem>
                    )}
                  </FileUploaderList>
                </FileUploader>
                {!selectedImageFile && existingImageUrl && (
                  <div className="mt-2 space-y-1.5">
                    <p className="text-xs text-muted-foreground">Current Image:</p>
                    <div className="relative w-48 h-28 rounded-md overflow-hidden border group">
                      <img
                        src={existingImageUrl}
                        alt="Event Banner"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setExistingImageUrl(null);
                          setSelectedImageFile(null);
                          form.setValue("image", "");
                        }}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-md opacity-90 hover:opacity-100 transition-opacity"
                        title="Remove Image"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="size-4 mr-2 animate-spin" />
                )}
                {editItem ? "Update Event" : "Create Event"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event schedule entry? This
              action cannot be undone.
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
