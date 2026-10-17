import { z } from "zod";

export const boyanSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  author: z.string().optional(),
  location: z.string().optional(),
  mediaType: z.enum(["audio", "video"]).default("audio"),
  youtubeUrl: z.string().optional(),
});

export type BoyanForm = z.infer<typeof boyanSchema>;
