import apiClient from "./api-client";
import type { AuthResponse, SigninRequest, VerifyOtpRequest, EmailLoginRequest } from "@/types/auth";

export const signin = (data: SigninRequest) =>
  apiClient.post<{ message: string; phone: string }>("/auth/signin", data);

export const verifyOtp = (data: VerifyOtpRequest) =>
  apiClient.post<AuthResponse>("/auth/verify-otp", data);

export const emailLogin = (data: EmailLoginRequest) =>
  fetch("/api/auth/email-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  }).then((res) => {
    if (!res.ok) {
      return res.json().then((err) => Promise.reject(err));
    }
    return res.json();
  });

