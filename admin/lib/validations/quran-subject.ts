import { z } from "zod";

export const quranSubjectSchema = z.object({
  id: z.number().optional(),
  category_id: (z.number() as any).min(1, "Category is required"),
  category_title: z.string().min(1, "Category title is required"),
  surah_id: z.number().optional(),
  surah_title_bn: z.string().optional(),
  surah_title_en: z.string().optional(),
  surah_title_ar: z.string().optional(),
  verse_number: (z.number() as any).min(1, "Verse number is required"),
  verse_text: z.string().min(1, "Verse text is required"),
  author: z.string().optional(),
  bn_meaning: z.string().optional(),
  bn_pronunciation: z.string().optional(),
  tafsir: z.string().optional(),
});

export type QuranSubjectForm = z.infer<typeof quranSubjectSchema>;
