import { z } from "zod";

export const adSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  link: z.string().optional(),
  buttonText: z.string().optional(),
  placements: z.array(z.string()).min(1, "At least one placement must be selected"),
  isActive: z.boolean(),
  priority: z.number().optional(),
  image: z.any().optional(),
});

export type AdForm = z.infer<typeof adSchema>;
