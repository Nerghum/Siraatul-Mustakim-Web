export interface FundOption {
  id: string;
  title: string;
  subtitle: string;
  collected: number;
}

export interface PaymentMethod {
  id: string;
  label: string;
  active: boolean;
}

export interface DonationConfig {
  funds: FundOption[];
  quickAmounts: number[];
  paymentMethods: PaymentMethod[];
}

export interface PaymentRecord {
  _id: string;
  tran_id: string;
  amount: number;
  currency: string;
  cus_name?: string;
  cus_phone: string;
  cus_email?: string;
  provider: string;
  status: "pending" | "success" | "failed" | "cancelled";
  gateway: string;
  category: string;
  fund?: string;
  frequency?: "oneTime" | "monthly";
  notes?: string;
  rawCreate?: any;
  rawExecute?: any;
  createdAt: string;
  updatedAt: string;
}

export interface DonorRecord {
  _id: string;
  phone: string;
  name: string;
  email?: string;
  totalDonated: number;
  donationCount: number;
  totalAttempts: number;
  lastDonationDate: string;
  lastStatus: string;
}

export interface GatewaySettings {
  bkash: {
    isEnabled: boolean;
    isSandbox: boolean;
    appKey: string;
    appSecret: string;
    username: string;
    password: string;
    merchantNumber: string;
    hasAppKey?: boolean;
    hasAppSecret?: boolean;
    hasPassword?: boolean;
  };
  sslcommerz: {
    isEnabled: boolean;
    isSandbox: boolean;
    storeId: string;
    storePassword: string;
    hasStorePassword?: boolean;
  };
}

export interface PaymentStatsSummary {
  totalCollected: number;
  totalDonations: number;
  totalDonors: number;
  todayCollected: number;
  thisMonthCollected: number;
  pendingCount: number;
  failedCount: number;
}

export interface PaymentStatsData {
  summary: PaymentStatsSummary;
  daily: { date: string; [key: string]: any }[];
  monthly: { month: string; total: number; count: number }[];
  methods: { _id: string; total: number; count: number }[];
  sectors: { _id: string; total: number; count: number }[];
  recentDonations: PaymentRecord[];
}
