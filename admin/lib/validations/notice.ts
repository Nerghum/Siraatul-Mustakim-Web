import { z } from "zod";

export const noticeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.string().min(1, "Date is required"),
  description: z.string().min(1, "Description is required"),
  image: z.any().optional(),
});

export type NoticeForm = z.infer<typeof noticeSchema>;
