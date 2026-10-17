import { z } from "zod";

export const signinSchema = z.object({
  phone: z.string().min(11, "Phone number must be at least 11 digits"),
});

export const verifyOtpSchema = z.object({
  phone: z.string(),
  otp: z.string().min(4, "OTP must be at least 4 digits"),
});

export type SigninForm = z.infer<typeof signinSchema>;
export type VerifyOtpForm = z.infer<typeof verifyOtpSchema>;
