import { z } from "zod";

export const articleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  status: z.enum(["draft", "published", "pending"]),
  tags: z.string().optional(),
  image: z.any().optional(),
});

export type ArticleFormValues = z.infer<typeof articleSchema>;
