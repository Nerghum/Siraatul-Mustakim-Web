import { z } from "zod";

const roleEnum = z.enum(["user", "writer", "admin", "moderator", "mufti"]);

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
  role: roleEnum,
});

export type CreateUserForm = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
  role: z.enum(["user", "writer", "admin", "moderator", "mufti"]).optional(),
});

export type UpdateUserForm = z.infer<typeof updateUserSchema>;
