import { z } from "zod";

export const malfuzatTextSchema = z.object({
  mode: z.literal("text"),
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  author: z.string().optional(),
  description: z.string().min(1, "Description is required"),
});

export const malfuzatAudioSchema = z.object({
  mode: z.literal("audio"),
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  author: z.string().optional(),
});

export const malfuzatSchema = z.discriminatedUnion("mode", [
  malfuzatTextSchema,
  malfuzatAudioSchema,
]);

export type MalfuzatTextForm = z.infer<typeof malfuzatTextSchema>;
export type MalfuzatAudioForm = z.infer<typeof malfuzatAudioSchema>;
export type MalfuzatForm = z.infer<typeof malfuzatSchema>;
