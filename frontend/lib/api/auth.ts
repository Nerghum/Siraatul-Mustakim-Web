export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

export async function requestOtp(phone: string) {
  const res = await fetch(`${API_BASE}/api/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to request OTP");
  }
  return res.json();
}

export async function verifyOtp(phone: string, otp: string) {
  const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, otp }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Invalid or expired OTP");
  }
  return res.json(); // returns { user, token }
}
