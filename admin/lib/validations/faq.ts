import { z } from "zod";

export const faqSchema = z.object({
  author: z.string().min(1, "Author is required"),
  district: z.string().optional(),
  question: z.string().min(1, "Question is required"),
});

export const answerFaqSchema = z.object({
  status: z.literal("answered"),
  userId: z.string().min(1, "Select a Mufti"),
  author: z.string().min(1, "Author is required"),
  category: z.string().min(1, "Category is required"),
  answer: z.string().min(1, "Answer is required"),
});

export type FaqForm = z.infer<typeof faqSchema>;
export type AnswerFaqForm = z.infer<typeof answerFaqSchema>;
