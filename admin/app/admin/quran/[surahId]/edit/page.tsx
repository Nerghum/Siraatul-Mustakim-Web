"use client";
import { useCallback, useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  quranSurahEditWithVersesSchema,
  type QuranSurahEditWithVersesForm,
} from "@/lib/validations/quran";
import {
  useQuranSurah,
  useUpdateQuranSurah,
  useUpdateQuranVerse,
  useDeleteQuranVerse,
  useCreateQuranVerse,
  useUploadQuranSurahAudio,
} from "@/hooks/use-quran";
import { useVersePlayback } from "@/hooks/use-verse-playback";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import type H5AudioPlayer from "react-h5-audio-player";
import { VerseTimestampInput } from "@/components/quran/verse-timestamp-input";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  Clock,
  Play,
  Pause,
} from "lucide-react";
import Link from "next/link";
import {
  FileUploader,
  FileUploaderDropzone,
  FileUploaderList,
  FileUploaderItem,
  FileUploaderItemPreview,
  FileUploaderItemMetadata,
  FileUploaderItemDelete,
} from "@/components/ui/file-uploader";

const createEmptyVerse = (id: number) => ({
  id,
  text_ar: "",
  bn_meaning: "",
  bn_pronunciation: "",
  tafsir: "",
  translation_footnotes: "",
  tafsir_footnotes: "",
  audioStart: 0,
});

const getNextVerseId = (
  verses: QuranSurahEditWithVersesForm["verses"] | undefined,
) => {
  const maxVerseId =
    verses?.reduce(
      (max, verse) =>
        Number.isFinite(verse?.id) && verse.id > max ? verse.id : max,
      0,
    ) || 0;

  return maxVerseId + 1;
};
export default function EditQuranSurahPage() {
  const params = useParams();
  const surahId = Number(params.surahId);
  const router = useRouter();
  const { data: surah, isLoading } = useQuranSurah(surahId);
  const updateMutation = useUpdateQuranSurah();
  const updateVerseMutation = useUpdateQuranVerse();
  const deleteVerseMutation = useDeleteQuranVerse();
  const createVerseMutation = useCreateQuranVerse();
  const uploadSurahAudio = useUploadQuranSurahAudio();
  const [showCustomType, setShowCustomType] = useState(false);
  const existingTypes = ["Meccan", "Medinan"];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const newVerseIndicesRef = useRef<Set<number>>(new Set());
  const [surahAudioFile, setSurahAudioFile] = useState<File | null>(null);

  // Verse playback
  const {
    registerAudio,
    isPlaying,
    activeVerseId,
    playAll,
    playVerse,
    pause,
    stop,
    hasAudio,
  } = useVersePlayback({
    audioSrc: surah?.audio?.url ?? null,
    verses: surah?.verses ?? [],
    surahDuration: surah?.audio?.duration,
  });
  const audioPlayerRef = useRef<H5AudioPlayer>(null);

  /** Pass the internal audio element to the hook */
  const registerPlayerAudio = useCallback(() => {
    const el = audioPlayerRef.current?.audio?.current;
    if (el) registerAudio(el);
  }, [registerAudio]);

  const form = useForm<QuranSurahEditWithVersesForm>({
    resolver: zodResolver(quranSurahEditWithVersesSchema),
    defaultValues: {
      name_ar: "",
      name_bn: "",
      name_en: "",
      type: "",
      para: undefined as unknown as number,
      verses: [],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "verses",
    keyName: "fieldId",
  });
  const selectedType = useWatch({ control: form.control, name: "type" });
  const formPopulatedRef = useRef(false);
  useEffect(() => {
    if (surah && !formPopulatedRef.current) {
      formPopulatedRef.current = true;
      form.reset({
        name_ar: surah.name_ar,
        name_bn: surah.name_bn,
        name_en: surah.name_en,
        type: surah.type,
        para: surah.para,
        slug: surah.slug || "",
        meaning_en: surah.meaning_en || "",
        meaning_bn: surah.meaning_bn || "",
        listing_name_bn: surah.listing_name_bn || "",
        verses: (surah.verses || []).map((v) => ({
          id: v.id,
          text_ar: v.text_ar,
          bn_meaning: v.bn_meaning,
          bn_pronunciation: v.bn_pronunciation || "",
          tafsir: v.tafsir || "",
          translation_footnotes: v.translation_footnotes || "",
          tafsir_footnotes: v.tafsir_footnotes || "",
          audioStart: v.audioStart ?? 0,
        })),
      });
    }
  }, [surah, form]);

  function handleAddVerse() {
    const nextId = getNextVerseId(form.getValues("verses"));
    const newIndex = fields.length;
    newVerseIndicesRef.current.add(newIndex);
    append(createEmptyVerse(nextId));
  }

  function handleRemoveVerse(index: number) {
    const verseId = form.getValues(`verses.${index}.id`);
    if (newVerseIndicesRef.current.has(index)) {
      newVerseIndicesRef.current.delete(index);
      remove(index);
      return;
    }

    if (verseId && confirm(`Delete verse ${verseId} from the database?`)) {
      deleteVerseMutation.mutate(
        { surahId, verseId },
        {
          onSuccess: () => {
            toast.success(`Verse ${verseId} deleted`);
            newVerseIndicesRef.current.delete(index);
            remove(index);
          },
          onError: () => {
            toast.error(`Failed to delete verse ${verseId}`);
          },
        },
      );
    }
  }

  const onInvalid = useCallback((errors: Record<string, unknown>) => {
    const fieldNames = Object.keys(errors);
    toast.error(
      `Please fix ${fieldNames.length} validation error${fieldNames.length > 1 ? "s" : ""}. Scroll up to see details.`,
    );
    const firstErrorField = document.querySelector("[data-invalid='true']");
    if (firstErrorField) {
      firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const onSubmit = useCallback(
    async (data: QuranSurahEditWithVersesForm) => {
      setIsSubmitting(true);
      try {
        // Step 1: Update surah metadata
        await updateMutation.mutateAsync({
          surahId,
          data: {
            name_ar: data.name_ar,
            name_bn: data.name_bn,
            name_en: data.name_en,
            type: data.type,
            para: data.para,
            slug: data.slug,
            meaning_en: data.meaning_en,
            meaning_bn: data.meaning_bn,
            listing_name_bn: data.listing_name_bn,
          },
        });

        // Step 2: Create/update verses with audioStart, tafsir, footnotes
        const versePromises: Promise<unknown>[] = [];
        const verseFields = form.getValues("verses");

        for (let index = 0; index < verseFields.length; index++) {
          const verse = verseFields[index];
          const isNew = newVerseIndicesRef.current.has(index);

          if (isNew) {
            versePromises.push(
              createVerseMutation.mutateAsync({
                surahId,
                data: {
                  id: verse.id,
                  text_ar: verse.text_ar,
                  bn_meaning: verse.bn_meaning,
                  bn_pronunciation: verse.bn_pronunciation || "",
                  tafsir: verse.tafsir || "",
                  translation_footnotes: verse.translation_footnotes || "",
                  tafsir_footnotes: verse.tafsir_footnotes || "",
                  audioStart: verse.audioStart ?? 0,
                },
              }),
            );
          } else {
            versePromises.push(
              updateVerseMutation.mutateAsync({
                surahId,
                verseId: verse.id,
                data: {
                  text_ar: verse.text_ar,
                  bn_meaning: verse.bn_meaning,
                  bn_pronunciation: verse.bn_pronunciation || "",
                  tafsir: verse.tafsir || "",
                  translation_footnotes: verse.translation_footnotes || "",
                  tafsir_footnotes: verse.tafsir_footnotes || "",
                  audioStart: verse.audioStart ?? 0,
                },
              }),
            );
          }
        }

        await Promise.all(versePromises);

        // Step 3: Upload surah audio if replaced
        if (surahAudioFile) {
          const surahFormData = new FormData();
          surahFormData.append("audio", surahAudioFile);
          await uploadSurahAudio.mutateAsync({
            surahId,
            formData: surahFormData,
          });
        }

        toast.success("Surah updated successfully");
        router.push(`/admin/quran/${surahId}`);
      } catch (err) {
        const message =
          err && typeof err === "object" && "response" in err
            ? (err as import("axios").AxiosError<{ error: string }>).response
                ?.data?.error
            : undefined;
        toast.error(message || "Failed to update surah");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      surahId,
      updateMutation,
      createVerseMutation,
      updateVerseMutation,
      surahAudioFile,
      uploadSurahAudio,
      router,
      form,
    ],
  );

  const isPending =
    isSubmitting ||
    updateMutation.isPending ||
    updateVerseMutation.isPending ||
    createVerseMutation.isPending ||
    uploadSurahAudio.isPending ||
    deleteVerseMutation.isPending;

  // Wrap handleSubmit to avoid accessing form refs during render
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      form.handleSubmit(onSubmit, onInvalid)(e);
    },
    [form, onSubmit, onInvalid],
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!surah) {
    return (
      <div className="text-center py-12">
        <p className="">Surah not found</p>
        <Link
          href="/admin/quran"
          className="inline-flex items-center justify-center h-7 px-2.5 rounded-lg border border-border font-medium mt-4"
        >
          Back to Quran
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href={`/admin/quran/${surahId}`}
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to {surah.name_en}
      </Link>
      <h1 className="text-2xl font-bold">
        Edit Surah {surah.id}. {surah.name_en}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Surah Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name_ar">Name (Arabic)</Label>
              <Input
                id="name_ar"
                placeholder="اسم السورة"
                dir="rtl"
                {...form.register("name_ar")}
              />
              {form.formState.errors.name_ar && (
                <p className=" text-destructive">
                  {form.formState.errors.name_ar.message as string}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name_bn">Name (Bengali)</Label>
                <Input
                  id="name_bn"
                  placeholder="সূরা নাম"
                  {...form.register("name_bn")}
                />
                {form.formState.errors.name_bn && (
                  <p className=" text-destructive">
                    {form.formState.errors.name_bn.message as string}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name_en">Name (English)</Label>
                <Input
                  id="name_en"
                  placeholder="Surah name"
                  {...form.register("name_en")}
                />
                {form.formState.errors.name_en && (
                  <p className=" text-destructive">
                    {form.formState.errors.name_en.message as string}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meaning_bn">Meaning (Bengali)</Label>
                <Input
                  id="meaning_bn"
                  placeholder="সূচনা"
                  {...form.register("meaning_bn")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meaning_en">Meaning (English)</Label>
                <Input
                  id="meaning_en"
                  placeholder="The Opening"
                  {...form.register("meaning_en")}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  placeholder="surah-faatiha"
                  {...form.register("slug")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="listing_name_bn">Listing Name (Bengali)</Label>
                <Input
                  id="listing_name_bn"
                  placeholder="আল-ফাতিহা"
                  {...form.register("listing_name_bn")}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="para">Para Number</Label>
                <Controller
                  name="para"
                  control={form.control}
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(val) => field.onChange(val ? parseInt(val) : undefined)}
                    >
                      <SelectTrigger id="para">
                        <SelectValue placeholder="Select para..." />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 30 }, (_, i) => i + 1).map((p) => (
                          <SelectItem key={p} value={String(p)}>
                            Para {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.para && (
                  <p className=" text-destructive">
                    {form.formState.errors.para.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                {!showCustomType ? (
                  <Controller
                    name="type"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        value={field.value || ""}
                        onValueChange={(val) => {
                          if (val === "__new__") {
                            setShowCustomType(true);
                          } else {
                            field.onChange(val);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent>
                          {existingTypes.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                          <div className="border-t my-1" />
                          <SelectItem value="__new__">
                            <span className="flex items-center gap-1.5 text-primary">
                              <Plus className="size-3.5" />
                              Add new type...
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Enter custom type..."
                      value={selectedType}
                      onChange={(e) =>
                        form.setValue("type", e.target.value, {
                          shouldValidate: true,
                        })
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowCustomType(false);
                        form.setValue("type", "", { shouldValidate: true });
                      }}
                      className="shrink-0"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
                {form.formState.errors.type && (
                  <p className=" text-destructive">
                    {form.formState.errors.type.message as string}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Full Surah Audio */}
        <Card>
          <CardHeader>
            <CardTitle>Full Surah Audio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Existing Audio Player */}
            {surah.audio?.url && (
              <AudioPlayer
                ref={audioPlayerRef}
                src={surah.audio.url}
                onPlay={() => {
                  registerPlayerAudio();
                  playAll();
                }}
                onPause={pause}
                onEnded={stop}
                showSkipControls={false}
                showJumpControls={false}
                preload="metadata"
                listenInterval={250}
              />
            )}

            {/* Upload new audio */}
            <div className="space-y-2">
              <Label>
                {surah.audio?.url ? "Replace audio" : "Upload surah audio"}
              </Label>
              <FileUploader
                value={surahAudioFile ? [surahAudioFile] : []}
                onValueChange={(files) => setSurahAudioFile(files[0] ?? null)}
                accept="audio/*"
                maxFiles={1}
              >
                <FileUploaderDropzone>
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center justify-center rounded-full border p-2.5">
                      <Upload className="size-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">
                      Drag &amp; drop audio here
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Or click to browse (MP3, WAV, M4A)
                    </p>
                  </div>
                </FileUploaderDropzone>
                <FileUploaderList>
                  {surahAudioFile && (
                    <FileUploaderItem file={surahAudioFile}>
                      <FileUploaderItemPreview file={surahAudioFile} />
                      <FileUploaderItemMetadata file={surahAudioFile} />
                      <FileUploaderItemDelete file={surahAudioFile} />
                    </FileUploaderItem>
                  )}
                </FileUploaderList>
              </FileUploader>
            </div>
          </CardContent>
        </Card>

        {/* Verses */}
        <Card>
          <CardHeader>
            <CardTitle>Verses ({fields.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {fields.length === 0 && (
              <p className=" text-center py-4">
                No verses. Click &quot;Add Verse&quot; to start.
              </p>
            )}

            {fields.map((field, index) => {
              const verseId = field.id;

              return (
                <div
                  key={field.fieldId}
                  className={`border rounded-lg p-4 space-y-3 relative transition-colors ${
                    activeVerseId === verseId
                      ? "border-primary bg-primary/5"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className=" font-semibold ">
                      Verse #{verseId || index + 1}
                      {activeVerseId === verseId && isPlaying && (
                        <span className="ml-2 text-xs text-primary font-normal">
                          ▶ Playing
                        </span>
                      )}
                    </span>
                    <input
                      type="hidden"
                      {...form.register(`verses.${index}.id`, {
                        valueAsNumber: true,
                      })}
                    />
                    <div className="flex items-center gap-1">
                      {hasAudio && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (activeVerseId === verseId && isPlaying) {
                              pause();
                            } else {
                              playVerse(verseId);
                            }
                          }}
                          className="h-8 px-2 text-primary"
                          title={
                            activeVerseId === verseId && isPlaying
                              ? "Pause"
                              : "Play"
                          }
                        >
                          {activeVerseId === verseId && isPlaying ? (
                            <Pause className="size-4 fill-current" />
                          ) : (
                            <Play className="size-4" />
                          )}
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveVerse(index)}
                        className="text-destructive hover:text-destructive h-8 px-2"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Arabic Text */}
                  <div className="space-y-2">
                    <Label>Arabic Text</Label>
                    <Controller
                      name={`verses.${index}.text_ar`}
                      control={form.control}
                      render={({ field }) => (
                        <RichTextEditor
                          value={field.value}
                          onChange={field.onChange}
                          dir="rtl"
                          placeholder="الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ"
                        />
                      )}
                    />
                    {form.formState.errors.verses?.[index]?.text_ar && (
                      <p className=" text-destructive">
                        {
                          form.formState.errors.verses[index]!.text_ar!
                            .message as string
                        }
                      </p>
                    )}
                  </div>

                  {/* Bengali Meaning + Pronunciation */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Bengali Meaning</Label>
                      <Controller
                        name={`verses.${index}.bn_meaning`}
                        control={form.control}
                        render={({ field }) => (
                          <RichTextEditor
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="সমস্ত প্রশংসা আল্লাহর জন্য"
                          />
                        )}
                      />
                      {form.formState.errors.verses?.[index]?.bn_meaning && (
                        <p className=" text-destructive">
                          {
                            form.formState.errors.verses[index]!.bn_meaning!
                              .message as string
                          }
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Bengali Pronunciation</Label>
                      <Controller
                        name={`verses.${index}.bn_pronunciation`}
                        control={form.control}
                        render={({ field }) => (
                          <RichTextEditor
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            placeholder="Optional"
                          />
                        )}
                      />
                    </div>
                  </div>

                  {/* Bengali Tafsir */}
                  <div className="space-y-2">
                    <Label>Bengali Tafsir</Label>
                    <Controller
                      name={`verses.${index}.tafsir`}
                      control={form.control}
                      render={({ field }) => (
                        <RichTextEditor
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          placeholder="Tafsir explanation..."
                        />
                      )}
                    />
                  </div>

                  {/* Footnotes */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Translation Footnotes</Label>
                      <Controller
                        name={`verses.${index}.translation_footnotes`}
                        control={form.control}
                        render={({ field }) => (
                          <RichTextEditor
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            placeholder="Translation footnotes (optional)"
                          />
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tafsir Footnotes</Label>
                      <Controller
                        name={`verses.${index}.tafsir_footnotes`}
                        control={form.control}
                        render={({ field }) => (
                          <RichTextEditor
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            placeholder="Tafsir footnotes (optional)"
                          />
                        )}
                      />
                    </div>
                  </div>

                  {/* Verse Start Time */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <Clock className="size-3.5" />
                      Verse Start Time
                    </Label>
                    <Controller
                      name={`verses.${index}.audioStart`}
                      control={form.control}
                      render={({ field }) => (
                        <VerseTimestampInput
                          value={field.value ?? 0}
                          onChange={field.onChange}
                          maxDuration={surah.audio?.duration}
                          onUseCurrentTime={() => {
                            const el = audioPlayerRef.current?.audio?.current;
                            if (el) {
                              field.onChange(
                                Math.round(el.currentTime * 1000) / 1000,
                              );
                            }
                          }}
                          showUseCurrentTime={hasAudio}
                        />
                      )}
                    />
                    <p className="text-xs text-muted-foreground">
                      When this verse starts in the Surah audio (MM:SS.mmm)
                    </p>
                    {form.formState.errors.verses?.[index]?.audioStart && (
                      <p className=" text-destructive">
                        {
                          form.formState.errors.verses[index]!.audioStart!
                            .message as string
                        }
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddVerse}
            >
              <Plus className="size-4 mr-1.5" />
              Add Verse
            </Button>

            {form.formState.errors.verses?.message && (
              <p className=" text-destructive">
                {form.formState.errors.verses.message as string}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isPending} size="lg">
            {isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
          <Link href={`/admin/quran/${surahId}`}>
            <Button type="button" variant="outline" size="lg">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
