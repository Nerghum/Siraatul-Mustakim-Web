import { z } from "zod";

export const chapterSchema = z.object({
  chapterId: z.string().min(1, "Chapter ID is required"),
  title: z.string().min(1, "Title is required"),
  icon: z.string().min(1, "Icon is required"),
});

export type ChapterForm = {
  chapterId: string;
  title: string;
  icon: string;
};

export const duaItemSchema = z.object({
  duaId: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  sourceLabel: z.string().optional(),
  sourceLabelBangla: z.string().optional(),
  sourceLabelArabic: z.string().optional(),
  ayahLabel: z.string().optional(),
  arabic: z.string().min(1, "Arabic text is required"),
  pronunciation: z.string().optional(),
  translation: z.string().min(1, "Translation is required"),
  tafsir: z.string().optional(),
  audioUrl: z.string().optional(),
});

export type DuaItemForm = {
  duaId?: string;
  title: string;
  sourceLabel?: string;
  sourceLabelBangla?: string;
  sourceLabelArabic?: string;
  ayahLabel?: string;
  arabic: string;
  pronunciation?: string;
  translation: string;
  tafsir?: string;
  audioUrl?: string;
};

export const allDuaItemSchema = duaItemSchema.extend({
  chapterId: z.string().min(1, "Category is required"),
});

export type AllDuaItemForm = DuaItemForm & {
  chapterId: string;
};

