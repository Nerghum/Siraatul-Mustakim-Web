"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useQuranSurah,
  useDeleteQuranSurah,
  useDeleteQuranVerse,
  useUpdateQuranVerse,
} from "@/hooks/use-quran";
import { useVersePlayback } from "@/hooks/use-verse-playback";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import type H5AudioPlayer from "react-h5-audio-player";
import { VerseTimestampInput } from "@/components/quran/verse-timestamp-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  ArrowLeft,
  Trash2,
  Pencil,
  Loader2,
  Play,
  Pause,
  Clock,
  LayoutGrid,
  List,
} from "lucide-react";
import Link from "next/link";
import type { QuranVerse } from "@/types/quran";
import { stripHtml, secondsToTimestamp } from "@/lib/utils";

export default function QuranSurahDetailPage() {
  const params = useParams();
  const surahId = Number(params.surahId);
  const router = useRouter();
  const { data: surah, isLoading, isError } = useQuranSurah(surahId);
  const deleteSurahMutation = useDeleteQuranSurah();
  const deleteVerseMutation = useDeleteQuranVerse();
  const updateVerseMutation = useUpdateQuranVerse();

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

  // Auto-scroll active verse row into view smoothly when playing
  useEffect(() => {
    if (activeVerseId && isPlaying) {
      const el = document.getElementById(`verse-row-${activeVerseId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [activeVerseId, isPlaying]);

  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [deleteSurahOpen, setDeleteSurahOpen] = useState(false);
  const [deleteVerseId, setDeleteVerseId] = useState<number | null>(null);
  const [editVerse, setEditVerse] = useState<QuranVerse | null>(null);
  const [editForm, setEditForm] = useState({
    text_ar: "",
    bn_meaning: "",
    bn_pronunciation: "",
    tafsir: "",
    translation_footnotes: "",
    tafsir_footnotes: "",
    audioStart: 0,
  });

  async function handleDeleteSurah() {
    try {
      await deleteSurahMutation.mutateAsync(surahId);
      toast.success("Surah deleted");
      router.push("/admin/quran");
    } catch {
      toast.error("Failed to delete surah");
      setDeleteSurahOpen(false);
    }
  }

  async function handleDeleteVerse() {
    if (deleteVerseId === null) return;
    try {
      await deleteVerseMutation.mutateAsync({
        surahId,
        verseId: deleteVerseId,
      });
      toast.success("Verse deleted");
      setDeleteVerseId(null);
    } catch {
      toast.error("Failed to delete verse");
      setDeleteVerseId(null);
    }
  }

  function openEditVerse(verse: QuranVerse) {
    setEditVerse(verse);
    setEditForm({
      text_ar: verse.text_ar,
      bn_meaning: verse.bn_meaning,
      bn_pronunciation: verse.bn_pronunciation || "",
      tafsir: verse.tafsir || "",
      translation_footnotes: verse.translation_footnotes || "",
      tafsir_footnotes: verse.tafsir_footnotes || "",
      audioStart: verse.audioStart ?? 0,
    });
  }

  async function handleUpdateVerse() {
    if (!editVerse) return;
    try {
      await updateVerseMutation.mutateAsync({
        surahId,
        verseId: editVerse.id,
        data: editForm,
      });
      toast.success("Verse updated");
      setEditVerse(null);
    } catch (err) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as import("axios").AxiosError<{ error: string }>).response
              ?.data?.error
          : undefined;
      toast.error(message || "Failed to update verse");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !surah) {
    return (
      <div className="text-center py-12">
        <p className="">Surah not found</p>
        <Link
          href="/admin/quran"
          className="inline-flex items-center justify-center h-7 px-2.5 rounded-lg border border-border  font-medium  mt-4"
        >
          Back to Quran
        </Link>
      </div>
    );
  }

  const verses = surah.verses || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/admin/quran"
            className="inline-flex items-center justify-center size-8 rounded-md "
          >
            <ArrowLeft className="size-4" />
          </Link>
          <h1 className="text-2xl font-bold">
            {surah.id}. {surah.name_en}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/quran/${surahId}/edit`}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border  font-medium "
          >
            <Pencil className="size-4" />
            Edit
          </Link>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteSurahOpen(true)}
          >
            <Trash2 className="size-4 mr-1.5" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <Card className="shadow-xs">
          <CardContent className="p-3.5">
            <p className="text-xs text-muted-foreground font-medium">Arabic</p>
            <p className="text-lg font-serif mt-0.5" dir="rtl">
              {surah.name_ar}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-xs">
          <CardContent className="p-3.5">
            <p className="text-xs text-muted-foreground font-medium">Bengali</p>
            <p className="text-base font-semibold mt-0.5">{surah.name_bn}</p>
          </CardContent>
        </Card>
        <Card className="shadow-xs">
          <CardContent className="p-3.5">
            <p className="text-xs text-muted-foreground font-medium">Para / Juz</p>
            <Badge variant="outline" className="mt-1 font-mono text-xs">
              Para {surah.para || 1}
            </Badge>
          </CardContent>
        </Card>
        <Card className="shadow-xs">
          <CardContent className="p-3.5">
            <p className="text-xs text-muted-foreground font-medium">Revelation</p>
            <Badge
              variant={surah.type === "Meccan" ? "default" : "secondary"}
              className={
                surah.type === "Meccan"
                  ? "mt-1 bg-amber-500/10 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
                  : "mt-1 bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
              }
            >
              {surah.type}
            </Badge>
          </CardContent>
        </Card>
        <Card className="shadow-xs">
          <CardContent className="p-3.5">
            <p className="text-xs text-muted-foreground font-medium">Total Verses</p>
            <p className="text-xl font-bold mt-0.5">{surah.total_verses}</p>
          </CardContent>
        </Card>
      </div>

      {/* Surah-level Audio */}
      <Card>
        <CardHeader>
          <CardTitle>Surah Audio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
              onListen={() => {
                // Sync duration on listen tick
                const el = audioPlayerRef.current?.audio?.current;
                if (el?.duration && !Number.isNaN(el.duration)) {
                  // duration is managed by the hook via registerAudio
                }
              }}
            />
          )}

          {/* Upload / Replace audio */}
          {/* <FileUploader
            value={[]}
            onValueChange={(files) => {
              const file = files[0];
              if (file) handleSurahAudioUpload(file);
            }}
            accept="audio/*"
            maxFiles={1}
            disabled={uploadingSurah}
          >
            <FileUploaderDropzone>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center justify-center rounded-full border p-2.5">
                  {uploadingSurah ? (
                    <Loader2 className="size-6 text-muted-foreground animate-spin" />
                  ) : (
                    <Upload className="size-6 text-muted-foreground" />
                  )}
                </div>
                <p className="text-sm font-medium">
                  {uploadingSurah
                    ? "Uploading..."
                    : surah.audio?.url
                      ? "Replace surah audio"
                      : "Drag & drop surah audio here"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Or click to browse (MP3, WAV, M4A)
                </p>
              </div>
            </FileUploaderDropzone>
          </FileUploader> */}
        </CardContent>
      </Card>

      {/* Verses Display (Cards or Table) */}
      <Card className="shadow-xs overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b">
          <div>
            <CardTitle className="text-lg">Verses ({verses.length})</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Authentic Arabic Uthmani text with Bengali translation and synchronized audio playback
            </p>
          </div>
          <div className="flex items-center gap-1 border rounded-lg p-0.5 bg-muted/30 self-start sm:self-auto">
            <Button
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("cards")}
              className="h-7 px-2.5 text-xs gap-1.5"
            >
              <LayoutGrid className="size-3.5" />
              Cards View
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="h-7 px-2.5 text-xs gap-1.5"
            >
              <List className="size-3.5" />
              Table View
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {verses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No verses found
            </div>
          ) : viewMode === "cards" ? (
            /* Cards View - Roomy, elegant & zero overlapping */
            <div className="divide-y p-3 sm:p-4 space-y-4">
              {verses.map((verse) => (
                <div
                  key={verse.id}
                  id={`verse-row-${verse.id}`}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    activeVerseId === verse.id && isPlaying
                      ? "border-primary bg-primary/[0.04] ring-2 ring-primary/20 shadow-md"
                      : "bg-card hover:border-border/80"
                  }`}
                >
                  {/* Card Header Bar */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center justify-center size-7 rounded-full text-xs font-bold font-mono ${
                          activeVerseId === verse.id && isPlaying
                            ? "bg-primary text-primary-foreground ring-2 ring-primary/30 animate-pulse"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {verse.id}
                      </span>
                      {activeVerseId === verse.id && isPlaying && (
                        <Badge
                          variant="default"
                          className="text-[10px] uppercase font-semibold tracking-wider bg-primary"
                        >
                          Now Playing
                        </Badge>
                      )}
                    </div>

                    {/* Verse Actions */}
                    <div className="flex items-center gap-1.5">
                      {hasAudio && (
                        <Button
                          variant={
                            activeVerseId === verse.id && isPlaying
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          className="h-7 px-2.5 text-xs gap-1 rounded-full"
                          title={
                            activeVerseId === verse.id && isPlaying
                              ? "Pause"
                              : "Play from this verse"
                          }
                          onClick={() => {
                            if (activeVerseId === verse.id && isPlaying) {
                              pause();
                            } else {
                              playVerse(verse.id);
                            }
                          }}
                        >
                          {activeVerseId === verse.id && isPlaying ? (
                            <Pause className="size-3 fill-current" />
                          ) : (
                            <Play className="size-3 fill-current" />
                          )}
                          <span className="font-mono text-[11px]">
                            {secondsToTimestamp(verse.audioStart ?? 0)}
                          </span>
                        </Button>
                      )}

                      <button
                        type="button"
                        onClick={() => openEditVerse(verse)}
                        className="inline-flex items-center justify-center size-7 rounded-md border border-input text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        title="Edit verse"
                      >
                        <Pencil className="size-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteVerseId(verse.id)}
                        className="inline-flex items-center justify-center size-7 rounded-md border border-input text-destructive hover:bg-destructive/10 transition-colors"
                        title="Delete verse"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </div>

                  {/* Card Content: Arabic & Bengali */}
                  <div className="p-4 space-y-3.5">
                    {/* Arabic Text Block */}
                    <div dir="rtl" className="w-full text-right">
                      <p className="font-serif text-2xl md:text-3xl leading-[2.3] text-foreground tracking-wide break-words">
                        {stripHtml(verse.text_ar)}
                      </p>
                    </div>

                    {/* Bengali Translation Block */}
                    <div className="border-l-2 border-primary/40 pl-3.5 py-0.5 space-y-1.5">
                      <p className="text-sm md:text-base leading-relaxed text-foreground/90 break-words">
                        {stripHtml(verse.bn_meaning)}
                      </p>
                      {verse.translation_footnotes && (
                        <p className="text-xs text-muted-foreground/85 bg-muted/40 p-2 rounded-md border border-border/50">
                          <span className="font-semibold text-foreground/80">টীকা:</span> {stripHtml(verse.translation_footnotes)}
                        </p>
                      )}
                      {verse.bn_pronunciation && (
                        <p className="text-xs text-muted-foreground italic break-words">
                          {stripHtml(verse.bn_pronunciation)}
                        </p>
                      )}
                    </div>

                    {/* Bengali Tafsir Block */}
                    {verse.tafsir && (
                      <div className="bg-muted/30 border border-border/60 rounded-lg p-3 text-xs md:text-sm space-y-1">
                        <span className="inline-block text-[11px] font-semibold text-primary uppercase tracking-wide">তাফসীর</span>
                        <p className="leading-relaxed text-foreground/85 whitespace-pre-line">
                          {stripHtml(verse.tafsir)}
                        </p>
                        {verse.tafsir_footnotes && (
                          <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                            <span className="font-semibold">তাফসীর টীকা:</span> {stripHtml(verse.tafsir_footnotes)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Table View - Fixed Layout & Strict Column Widths (No Overlap) */
            <div className="overflow-x-auto w-full">
              <table className="w-full table-fixed min-w-[950px] border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-muted-foreground text-xs font-semibold">
                    <th className="w-16 py-3 px-3 text-center">#</th>
                    <th className="w-[43%] py-3 px-4 text-right">Arabic Text (القرآن)</th>
                    <th className="w-[39%] py-3 px-4 text-left">Bengali Translation (বাংলা অনুবাদ)</th>
                    <th className="w-[18%] min-w-[180px] py-3 pr-4 pl-2 text-right">Audio & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {verses.map((verse) => (
                    <tr
                      key={verse.id}
                      id={`verse-row-${verse.id}`}
                      className={`transition-colors ${
                        activeVerseId === verse.id && isPlaying
                          ? "bg-primary/10 border-l-4 border-l-primary shadow-xs font-medium"
                          : "hover:bg-muted/30"
                      }`}
                    >
                      {/* Verse Number */}
                      <td className="w-16 align-top py-4 px-2 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={`inline-flex items-center justify-center size-7 rounded-full text-xs font-bold font-mono ${
                              activeVerseId === verse.id && isPlaying
                                ? "bg-primary text-primary-foreground ring-2 ring-primary/30 animate-pulse"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {verse.id}
                          </span>
                          {activeVerseId === verse.id && isPlaying && (
                            <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                              Playing
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Arabic Text */}
                      <td className="w-[43%] align-top py-4 px-4 text-right">
                        <div dir="rtl" className="w-full text-right overflow-hidden break-words">
                          <p className="text-xl md:text-2xl leading-[2.2] font-serif text-foreground break-words">
                            {stripHtml(verse.text_ar)}
                          </p>
                        </div>
                      </td>

                      {/* Bengali Translation */}
                      <td className="w-[39%] align-top py-4 px-4 text-left">
                        <div className="w-full overflow-hidden break-words space-y-1">
                          <p className="text-sm leading-relaxed text-foreground/90 break-words">
                            {stripHtml(verse.bn_meaning)}
                          </p>
                          {verse.bn_pronunciation && (
                            <p className="text-xs text-muted-foreground italic break-words">
                              {stripHtml(verse.bn_pronunciation)}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Audio & Actions Combined (Prevents Overlap) */}
                      <td className="w-[18%] min-w-[180px] align-top py-4 pr-4 pl-2 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {hasAudio && (
                            <Button
                              variant={
                                activeVerseId === verse.id && isPlaying
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              className="h-8 px-2 text-xs gap-1 rounded-full shrink-0"
                              title={
                                activeVerseId === verse.id && isPlaying
                                  ? "Pause"
                                  : "Play from this verse"
                              }
                              onClick={() => {
                                if (activeVerseId === verse.id && isPlaying) {
                                  pause();
                                } else {
                                  playVerse(verse.id);
                                }
                              }}
                            >
                              {activeVerseId === verse.id && isPlaying ? (
                                <Pause className="size-3 fill-current" />
                              ) : (
                                <Play className="size-3 fill-current" />
                              )}
                              <span className="text-[11px] font-mono tabular-nums">
                                {secondsToTimestamp(verse.audioStart ?? 0)}
                              </span>
                            </Button>
                          )}

                          <button
                            type="button"
                            onClick={() => openEditVerse(verse)}
                            className="inline-flex items-center justify-center size-8 rounded-md border border-input text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                            title="Edit verse"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteVerseId(verse.id)}
                            className="inline-flex items-center justify-center size-8 rounded-md border border-input text-destructive hover:bg-destructive/10 transition-colors"
                            title="Delete verse"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Surah Dialog */}
      <AlertDialog open={deleteSurahOpen} onOpenChange={setDeleteSurahOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Surah</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {surah.name_en}? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSurah}
              disabled={deleteSurahMutation.isPending}
            >
              {deleteSurahMutation.isPending && (
                <Loader2 className="size-4 mr-2 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Verse Dialog */}
      <AlertDialog
        open={deleteVerseId !== null}
        onOpenChange={(open) => !open && setDeleteVerseId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Verse</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete verse {deleteVerseId}? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVerse}
              disabled={deleteVerseMutation.isPending}
            >
              {deleteVerseMutation.isPending && (
                <Loader2 className="size-4 mr-2 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Verse Dialog */}
      <Dialog
        open={editVerse !== null}
        onOpenChange={(open) => {
          if (!open) setEditVerse(null);
        }}
      >
        <DialogContent className="h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Verse {editVerse?.id}</DialogTitle>
            <DialogDescription>
              Update verse text, translation, and start time
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Arabic Text</Label>
              <RichTextEditor
                value={editForm.text_ar}
                onChange={(html) => setEditForm({ ...editForm, text_ar: html })}
                dir="rtl"
                placeholder="Arabic text..."
              />
            </div>
            <div className="space-y-2">
              <Label>Bengali Meaning</Label>
              <RichTextEditor
                value={editForm.bn_meaning}
                onChange={(html) =>
                  setEditForm({ ...editForm, bn_meaning: html })
                }
                placeholder="Bengali meaning..."
              />
            </div>
            <div className="space-y-2">
              <Label>Bengali Pronunciation</Label>
              <RichTextEditor
                value={editForm.bn_pronunciation}
                onChange={(html) =>
                  setEditForm({ ...editForm, bn_pronunciation: html })
                }
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label>Bengali Tafsir</Label>
              <RichTextEditor
                value={editForm.tafsir}
                onChange={(html) =>
                  setEditForm({ ...editForm, tafsir: html })
                }
                placeholder="Tafsir explanation..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Translation Footnotes</Label>
                <RichTextEditor
                  value={editForm.translation_footnotes}
                  onChange={(html) =>
                    setEditForm({ ...editForm, translation_footnotes: html })
                  }
                  placeholder="Footnotes on translation..."
                />
              </div>
              <div className="space-y-2">
                <Label>Tafsir Footnotes</Label>
                <RichTextEditor
                  value={editForm.tafsir_footnotes}
                  onChange={(html) =>
                    setEditForm({ ...editForm, tafsir_footnotes: html })
                  }
                  placeholder="Footnotes on tafsir..."
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Clock className="size-3.5" />
                Verse Start Time
              </Label>
              <VerseTimestampInput
                value={editForm.audioStart}
                onChange={(seconds) =>
                  setEditForm({ ...editForm, audioStart: seconds })
                }
                maxDuration={surah?.audio?.duration}
                onUseCurrentTime={() => {
                  const el = audioPlayerRef.current?.audio?.current;
                  if (el) {
                    setEditForm({
                      ...editForm,
                      audioStart: Math.round(el.currentTime * 1000) / 1000,
                    });
                  }
                }}
                showUseCurrentTime={hasAudio}
              />
              <p className="text-xs text-muted-foreground">
                When this verse starts in the Surah audio (MM:SS.mmm)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditVerse(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateVerse}
              disabled={updateVerseMutation.isPending}
            >
              {updateVerseMutation.isPending && (
                <Loader2 className="size-4 mr-2 animate-spin" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
