"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  quranSurahCreateSchema,
  type QuranSurahCreateForm,
} from "@/lib/validations/quran";
import {
  useCreateQuranSurah,
  useUploadQuranSurahAudio,
} from "@/hooks/use-quran";
import { useRouter } from "next/navigation";
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
import { Loader2, ArrowLeft, Plus, Trash2, Upload, Clock } from "lucide-react";
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
import { VerseTimestampInput } from "@/components/quran/verse-timestamp-input";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import type H5AudioPlayer from "react-h5-audio-player";

const createEmptyVerse = (id: number) => ({
  id,
  text_ar: "",
  bn_meaning: "",
  bn_pronunciation: "",
  audioStart: 0,
});

const getNextVerseId = (verses: QuranSurahCreateForm["verses"] | undefined) => {
  const maxVerseId =
    verses?.reduce(
      (max, verse) =>
        Number.isFinite(verse?.id) && verse.id > max ? verse.id : max,
      0,
    ) || 0;

  return maxVerseId + 1;
};

const normalizeVerseIds = (verses: QuranSurahCreateForm["verses"]) => {
  let maxVerseId = 0;

  return verses.map((verse) => {
    const verseId =
      Number.isFinite(verse.id) && verse.id > 0 ? verse.id : maxVerseId + 1;
    maxVerseId = Math.max(maxVerseId, verseId);

    return {
      ...verse,
      id: verseId,
    };
  });
};

export default function CreateQuranSurahPage() {
  const router = useRouter();
  const createMutation = useCreateQuranSurah();
  const [surahAudioFile, setSurahAudioFile] = useState<File | null>(null);
  const [showCustomType, setShowCustomType] = useState(false);
  const existingTypes = ["Meccan", "Medinan"];
  const uploadSurahAudio = useUploadQuranSurahAudio();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const surahAudioRef = useRef<H5AudioPlayer>(null);
  const [surahAudioDuration, setSurahAudioDuration] = useState<number | null>(
    null,
  );

  // Derive audio source from the uploaded file
  const surahAudioSrc = surahAudioFile
    ? URL.createObjectURL(surahAudioFile)
    : null;

  const form = useForm<QuranSurahCreateForm>({
    resolver: zodResolver(quranSurahCreateSchema),
    defaultValues: {
      id: undefined as unknown as number,
      para: undefined as unknown as number,
      name_ar: "",
      name_bn: "",
      name_en: "",
      type: "",
      total_verses: 1,
      verses: [createEmptyVerse(1)],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "verses",
    keyName: "fieldId",
  });

  // Keep total_verses in sync with verses array length
  const verses = useWatch({
    control: form.control,
    name: "verses",
  });
  const selectedType = useWatch({
    control: form.control,
    name: "type",
  });
  useEffect(() => {
    form.setValue("total_verses", verses?.length || 1, {
      shouldValidate: false,
    });
  }, [verses, form]);

  function onInvalid(errors: Record<string, unknown>) {
    const fieldNames = Object.keys(errors);
    toast.error(
      `Please fix ${fieldNames.length} validation error${fieldNames.length > 1 ? "s" : ""}. Scroll up to see details.`,
    );
    const firstErrorField = document.querySelector("[data-invalid='true']");
    if (firstErrorField) {
      firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  async function onSubmit(data: QuranSurahCreateForm) {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        verses: normalizeVerseIds(data.verses),
      };

      // Step 1: Create surah with verses (including audioStart)
      await createMutation.mutateAsync(payload);
      const createdSurahId = payload.id;

      // Step 2: Upload surah-level audio if selected
      if (surahAudioFile) {
        const surahFormData = new FormData();
        surahFormData.append("audio", surahAudioFile);
        await uploadSurahAudio.mutateAsync({
          surahId: createdSurahId,
          formData: surahFormData,
        });
      }

      toast.success("Surah created successfully with verses");
      router.push("/admin/quran");
    } catch (err) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as import("axios").AxiosError<{ error: string }>).response
              ?.data?.error
          : undefined;
      toast.error(message || "Failed to create surah");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isPending =
    isSubmitting || createMutation.isPending || uploadSurahAudio.isPending;

  return (
    <div className="space-y-4">
      <Link
        href="/admin/quran"
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Quran
      </Link>
      <h1 className="text-2xl font-bold">Create Surah</h1>

      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className="space-y-4"
      >
        {/* Surah Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Surah Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id">Surah Number</Label>
                <Input
                  id="id"
                  type="number"
                  placeholder="1-114"
                  min={1}
                  max={114}
                  {...form.register("id", { valueAsNumber: true })}
                />
                {form.formState.errors.id && (
                  <p className=" text-destructive">
                    {form.formState.errors.id.message as string}
                  </p>
                )}
              </div>
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

            {/* Hidden total_verses (auto-computed) */}
            <input type="hidden" {...form.register("total_verses")} />
          </CardContent>
        </Card>

        {/* Full Surah Audio */}
        <Card>
          <CardHeader>
            <CardTitle>Full Surah Audio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label>Upload full surah recitation (MP3)</Label>
            <FileUploader
              value={surahAudioFile ? [surahAudioFile] : []}
              onValueChange={(files) => {
                // Stop playback and reset state when file changes
                const audio = surahAudioRef.current?.audio?.current;
                if (audio) {
                  audio.pause();
                  audio.currentTime = 0;
                }
                setSurahAudioDuration(null);
                setSurahAudioFile(files[0] ?? null);
              }}
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
            {surahAudioFile && surahAudioSrc && (
              <AudioPlayer
                ref={surahAudioRef}
                src={surahAudioSrc}
                onListen={() => {
                  const audio = surahAudioRef.current?.audio?.current;
                  if (audio?.duration && !Number.isNaN(audio.duration)) {
                    setSurahAudioDuration(audio.duration);
                  }
                }}
                onLoadedMetaData={() => {
                  const audio = surahAudioRef.current?.audio?.current;
                  if (audio?.duration) {
                    setSurahAudioDuration(audio.duration);
                  }
                }}
                listenInterval={250}
                showSkipControls={false}
                showJumpControls={false}
                preload="metadata"
              />
            )}
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
                No verses added. Click &quot;Add Verse&quot; to start.
              </p>
            )}

            {fields.map((field, index) => (
              <div
                key={field.fieldId}
                className="border rounded-lg p-4 space-y-3 relative"
              >
                <div className="flex items-center justify-between">
                  <span className=" font-semibold ">
                    Verse #{field.id || index + 1}
                  </span>
                  <input
                    type="hidden"
                    {...form.register(`verses.${index}.id`, {
                      valueAsNumber: true,
                    })}
                  />
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-destructive hover:text-destructive h-8 px-2"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>

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
                        maxDuration={surahAudioDuration}
                        showUseCurrentTime={!!surahAudioFile}
                        onUseCurrentTime={() => {
                          const audio = surahAudioRef.current?.audio?.current;
                          if (audio) {
                            field.onChange(audio.currentTime);
                          }
                        }}
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
            ))}

            {fields.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append(
                    createEmptyVerse(getNextVerseId(form.getValues("verses"))),
                  )
                }
              >
                <Plus className="size-4 mr-1.5" />
                Add Verse
              </Button>
            )}

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
            {isPending ? "Creating..." : "Create Surah"}
          </Button>
          <Link href="/admin/quran">
            <Button type="button" variant="outline" size="lg">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
