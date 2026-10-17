import { z } from "zod";

export const kitabChapterSchema = z.object({
  _id: z.string().optional(),
  title: z.string().min(1, "Chapter title is required"),
  order: z.number(),
  content: z.string().optional(),
});

export type KitabChapterForm = z.infer<typeof kitabChapterSchema>;

export const kitabSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  status: z.enum(["published", "draft"]),
  bookType: z.enum(["pdf", "text"]),
  content: z.string().optional(),
  chapters: z.array(kitabChapterSchema).optional(),
});

export type KitabForm = z.infer<typeof kitabSchema>;
