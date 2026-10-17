import { z } from "zod";

const contactEntrySchema = z.object({
  name: z.string().min(1, "Contact name is required"),
  phone: z.string().min(1, "Phone number is required"),
});

export const eventsScheduleSchema = z.object({
  districtName: z.string().min(1, "Zilla is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  location: z.string().min(1, "Location is required"),
  path: z.string().min(1, "Path is required"),
  googleMapsUrl: z
    .string()
    .min(1, "Google Maps link is required")
    .refine((value) => value.startsWith("https://maps.app.goo.gl/"), {
      message: "Use a Google Maps share link like https://maps.app.goo.gl/...",
    }),
  title: z.string().optional().default(""),
  timeText: z.string().optional().default(""),
  contacts: z.array(contactEntrySchema).optional().default([]),
  type: z.enum(["green", "amber"]).optional().default("green"),
  image: z.any().optional(),
});

export type EventsScheduleForm = z.infer<typeof eventsScheduleSchema>;

