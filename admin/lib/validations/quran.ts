import { z } from "zod";

export const quranSurahSchema = z.object({
  id: z
    .number()
    .min(1, "Surah ID is required")
    .max(114, "Surah ID must be between 1 and 114"),
  para: z
    .number()
    .min(1, "Para must be between 1 and 30")
    .max(30, "Para must be between 1 and 30"),
  name_ar: z.string().min(1, "Arabic name is required"),
  name_bn: z.string().min(1, "Bengali name is required"),
  name_en: z.string().min(1, "English name is required"),
  type: z.string().min(1, "Type is required"),
  total_verses: z.number().min(1, "Total verses is required"),
  slug: z.string().optional(),
  meaning_en: z.string().optional(),
  meaning_bn: z.string().optional(),
  listing_name_bn: z.string().optional(),
});

export const quranSurahEditSchema = z.object({
  para: z
    .number()
    .min(1, "Para must be between 1 and 30")
    .max(30, "Para must be between 1 and 30"),
  name_ar: z.string().min(1, "Arabic name is required"),
  name_bn: z.string().min(1, "Bengali name is required"),
  name_en: z.string().min(1, "English name is required"),
  type: z.string().min(1, "Type is required"),
  slug: z.string().optional(),
  meaning_en: z.string().optional(),
  meaning_bn: z.string().optional(),
  listing_name_bn: z.string().optional(),
});

export const quranVerseSchema = z.object({
  id: z.number().min(1),
  text_ar: z.string().min(1, "Arabic text is required"),
  bn_meaning: z.string().min(1, "Bengali meaning is required"),
  bn_pronunciation: z.string().optional(),
  tafsir: z.string().optional(),
  translation_footnotes: z.string().optional(),
  tafsir_footnotes: z.string().optional(),
  audio_url: z.string().optional(),
  audioStart: z.number().min(0, "Start time must be 0 or greater").optional(),
});

export const quranSurahEditWithVersesSchema = quranSurahEditSchema.extend({
  verses: z.array(quranVerseSchema).min(1, "At least one verse is required"),
});

export const quranSurahCreateSchema = quranSurahSchema.extend({
  verses: z.array(quranVerseSchema).min(1, "At least one verse is required"),
});

export type QuranSurahForm = z.infer<typeof quranSurahSchema>;
export type QuranSurahEditForm = z.infer<typeof quranSurahEditSchema>;
export type QuranSurahEditWithVersesForm = z.infer<typeof quranSurahEditWithVersesSchema>;
export type QuranSurahCreateForm = z.infer<typeof quranSurahCreateSchema>;
export type QuranVerseForm = z.infer<typeof quranVerseSchema>;
