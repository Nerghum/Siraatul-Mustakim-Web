const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

export interface PublicGatewaysResponse {
  bkash: {
    enabled: boolean;
    isSandbox: boolean;
    merchantNumber?: string;
  };
  sslcommerz: {
    enabled: boolean;
    isSandbox: boolean;
  };
}

export interface InitiateDonationPayload {
  amount: number | string;
  cus_phone: string;
  cus_name?: string;
  cus_email?: string;
  category?: string;
  fund?: string;
  frequency?: "oneTime" | "monthly";
  paymentMethod: "bkash" | "sslcommerz" | "card";
  callbackURL?: string;
}

export interface InitiateDonationResponse {
  status: boolean;
  data?: {
    redirectURL?: string;
    tran_id?: string;
    status?: string;
    message?: string;
  };
  message?: string;
}

export interface PaymentVerificationData {
  tran_id: string;
  amount: number;
  currency: string;
  cus_name?: string;
  cus_phone: string;
  cus_email?: string;
  paymentMethod: string;
  category: string;
  fund?: string;
  frequency?: string;
  orderId?: string;
  createdAt: string;
  paymentStatus: "success" | "pending" | "failed" | "cancelled";
}

/**
 * Fetches available public payment gateways configured in admin
 */
export async function fetchPublicGateways(): Promise<PublicGatewaysResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/api/payments/public-gateways`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (error) {
    console.warn("Failed to fetch public gateways:", error);
    return null;
  }
}

/**
 * Initiates payment session with selected gateway
 */
export async function initiateDonationPayment(
  payload: InitiateDonationPayload
): Promise<InitiateDonationResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/payments/initiate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    return json;
  } catch (error: any) {
    console.error("Donation initiation error:", error);
    return {
      status: false,
      message: error.message || "পেমেন্ট গেটওয়েতে সংযোগ করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।",
    };
  }
}

/**
 * Verifies transaction by tran_id
 */
export async function verifyPaymentTransaction(
  tran_id: string
): Promise<PaymentVerificationData | null> {
  if (!tran_id) return null;
  try {
    // Try bkash endpoint first
    let res = await fetch(`${API_BASE}/api/payments/bkash/verify?tran_id=${encodeURIComponent(tran_id)}`, {
      cache: "no-store",
    });

    if (res.ok) {
      const json = await res.json();
      if (json.status && json.data) {
        return json.data;
      }
    }

    // Try ssl endpoint
    res = await fetch(`${API_BASE}/api/payments/ssl/verify?tran_id=${encodeURIComponent(tran_id)}`, {
      cache: "no-store",
    });

    if (res.ok) {
      const json = await res.json();
      if (json.status && json.data) {
        return json.data;
      }
    }

    return null;
  } catch (error) {
    console.error("Payment verification error:", error);
    return null;
  }
}
