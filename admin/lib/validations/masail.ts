import { z } from "zod";

export const masailSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().optional(),
  description: z.string().min(1, "Description is required"),
});

export type MasailForm = z.infer<typeof masailSchema>;
