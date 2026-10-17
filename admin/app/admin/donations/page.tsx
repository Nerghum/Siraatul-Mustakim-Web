"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import {
  useDonationConfig,
  useUpdateDonationConfig,
  useDonationHistory,
  usePaymentStats,
  useGatewaySettings,
  useUpdateGatewaySettings,
  useDonorsList,
  useUpdateDonationStatus,
} from "@/hooks/use-donations";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Coins,
  Plus,
  Trash2,
  Save,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Eye,
  KeyRound,
  ShieldCheck,
  CreditCard,
  Users,
  LayoutDashboard,
  Settings2,
  TrendingUp,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  UserCheck,
  Smartphone,
  ExternalLink,
  Lock,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type {
  FundOption,
  PaymentMethod,
  PaymentRecord,
  DonorRecord,
  GatewaySettings,
} from "@/types/donations";

const ALLOWED_ROLES = ["admin"];

export default function DonationsPage() {
  const currentUser = useAuthStore((s) => s.user);
  const hasAccess =
    currentUser && ALLOWED_ROLES.includes(currentUser.role || "");

  const [activeTab, setActiveTab] = useState("dashboard");

  // ==========================================
  // STATS & DASHBOARD
  // ==========================================
  const {
    data: paymentStats,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = usePaymentStats();

  // ==========================================
  // TRANSACTIONS HISTORY STATE
  // ==========================================
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gatewayFilter, setGatewayFilter] = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [page, setPage] = useState(1);

  const historyParams: Record<string, string | number | undefined> = {
    page,
    limit: 10,
  };
  if (search) historyParams.q = search;
  if (statusFilter !== "all") historyParams.status = statusFilter;
  if (gatewayFilter !== "all") historyParams.gateway = gatewayFilter;
  if (sectorFilter !== "all") historyParams.category = sectorFilter;

  const {
    data: historyData,
    isLoading: isHistoryLoading,
    refetch: refetchHistory,
  } = useDonationHistory(historyParams);

  // Selected donation for detail dialog
  const [selectedDonation, setSelectedDonation] = useState<PaymentRecord | null>(
    null
  );
  const [newStatus, setNewStatus] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState<string>("");
  const updateStatusMutation = useUpdateDonationStatus();

  // ==========================================
  // DONORS LIST STATE
  // ==========================================
  const [donorSearch, setDonorSearch] = useState("");
  const [donorPage, setDonorPage] = useState(1);

  const donorParams: Record<string, string | number | undefined> = {
    page: donorPage,
    limit: 10,
  };
  if (donorSearch) donorParams.q = donorSearch;

  const {
    data: donorsData,
    isLoading: isDonorsLoading,
    refetch: refetchDonors,
  } = useDonorsList(donorParams);

  // ==========================================
  // GATEWAY CREDENTIALS STATE
  // ==========================================
  const {
    data: gatewaySettings,
    isLoading: isGatewayLoading,
    refetch: refetchGateways,
  } = useGatewaySettings();
  const updateGatewayMutation = useUpdateGatewaySettings();

  const [bkashForm, setBkashForm] = useState({
    isEnabled: false,
    isSandbox: true,
    appKey: "",
    appSecret: "",
    username: "",
    password: "",
    merchantNumber: "",
  });

  const [sslForm, setSslForm] = useState({
    isEnabled: false,
    isSandbox: true,
    storeId: "",
    storePassword: "",
  });

  const [showBkashSecret, setShowBkashSecret] = useState(false);
  const [showBkashPass, setShowBkashPass] = useState(false);
  const [showSslPass, setShowSslPass] = useState(false);

  useEffect(() => {
    if (gatewaySettings) {
      setBkashForm({
        isEnabled: gatewaySettings.bkash?.isEnabled || false,
        isSandbox: gatewaySettings.bkash?.isSandbox !== false,
        appKey: gatewaySettings.bkash?.appKey || "",
        appSecret: gatewaySettings.bkash?.appSecret || "",
        username: gatewaySettings.bkash?.username || "",
        password: gatewaySettings.bkash?.password || "",
        merchantNumber: gatewaySettings.bkash?.merchantNumber || "",
      });

      setSslForm({
        isEnabled: gatewaySettings.sslcommerz?.isEnabled || false,
        isSandbox: gatewaySettings.sslcommerz?.isSandbox !== false,
        storeId: gatewaySettings.sslcommerz?.storeId || "",
        storePassword: gatewaySettings.sslcommerz?.storePassword || "",
      });
    }
  }, [gatewaySettings]);

  const handleSaveGateways = () => {
    updateGatewayMutation.mutate(
      {
        bkash: bkashForm,
        sslcommerz: sslForm,
      },
      {
        onSuccess: () => {
          toast.success("Payment gateway credentials saved successfully!");
          refetchGateways();
        },
        onError: (err: any) => {
          toast.error(
            err.response?.data?.message ||
              "Failed to save payment gateway credentials"
          );
        },
      }
    );
  };

  // ==========================================
  // CONFIG SETTINGS (SECTORS & AMOUNTS)
  // ==========================================
  const {
    data: config,
    isLoading: isConfigLoading,
    refetch: refetchConfig,
  } = useDonationConfig();
  const updateConfigMutation = useUpdateDonationConfig();

  const [funds, setFunds] = useState<FundOption[]>([]);
  const [quickAmountsStr, setQuickAmountsStr] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    if (config) {
      setFunds(config.funds || []);
      setQuickAmountsStr((config.quickAmounts || []).join(", "));
      setPaymentMethods(config.paymentMethods || []);
    }
  }, [config]);

  const handleAddFund = () => {
    const newId = `fund_${Date.now()}`;
    setFunds([
      ...funds,
      {
        id: newId,
        title: "নতুন খাত",
        subtitle: "খাত সম্পর্কিত বিবরণ লিখুন",
        collected: 0,
      },
    ]);
  };

  const handleRemoveFund = (id: string) => {
    setFunds(funds.filter((f) => f.id !== id));
  };

  const handleFundChange = (
    id: string,
    field: keyof FundOption,
    value: string | number
  ) => {
    setFunds(
      funds.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  const handleSaveSectors = () => {
    const quickAmounts = quickAmountsStr
      .split(",")
      .map((x) => parseInt(x.trim(), 10))
      .filter((x) => !isNaN(x) && x > 0);

    updateConfigMutation.mutate(
      {
        funds,
        quickAmounts,
        paymentMethods,
      },
      {
        onSuccess: () => {
          toast.success("Donation sectors & amounts updated successfully!");
          refetchConfig();
        },
        onError: (err: any) => {
          toast.error(
            err.response?.data?.message || "Failed to update configurations"
          );
        },
      }
    );
  };

  if (!hasAccess) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle /> Access Denied
            </CardTitle>
            <CardDescription>
              Only administrators can manage donations and payment settings.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // ==========================================
  // BADGES & HELPERS
  // ==========================================
  const renderStatusBadge = (recordStatus: string) => {
    switch (recordStatus) {
      case "success":
        return (
          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center w-fit gap-1 text-xs">
            <CheckCircle className="size-3" /> Success
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="flex items-center w-fit gap-1 text-xs">
            <XCircle className="size-3" /> Failed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="secondary" className="flex items-center w-fit gap-1 text-xs">
            <AlertCircle className="size-3" /> Cancelled
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="text-amber-500 border-amber-500 flex items-center w-fit gap-1 text-xs"
          >
            <Clock className="size-3 animate-pulse" /> Pending
          </Badge>
        );
    }
  };

  const renderGatewayBadge = (gateway: string) => {
    const g = gateway?.toLowerCase();
    if (g === "bkash") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-pink-50 text-pink-700 border border-pink-200">
          <Smartphone className="size-3" /> bKash
        </span>
      );
    }
    if (g === "sslcommerz" || g === "ssl" || g === "card") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <CreditCard className="size-3" /> SSLCommerz
        </span>
      );
    }
    return (
      <Badge variant="outline" className="capitalize text-xs">
        {gateway || "Direct"}
      </Badge>
    );
  };

  // Open modal for details
  const openDetails = (item: PaymentRecord) => {
    setSelectedDonation(item);
    setNewStatus(item.status);
    setAdminNotes(item.notes || "");
  };

  const handleUpdateDonationStatus = () => {
    if (!selectedDonation) return;
    updateStatusMutation.mutate(
      {
        id: selectedDonation._id,
        data: { status: newStatus, notes: adminNotes },
      },
      {
        onSuccess: (res) => {
          toast.success("Donation record updated successfully");
          setSelectedDonation(null);
          refetchHistory();
        },
        onError: () => {
          toast.error("Failed to update donation status");
        },
      }
    );
  };

  // ==========================================
  // DATA TABLE COLUMNS
  // ==========================================
  const columns: Column<PaymentRecord>[] = [
    {
      key: "tran_id",
      header: "Transaction ID",
      render: (item) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-xs font-bold text-foreground">
            {item.tran_id}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {formatDate(item.createdAt)}
          </span>
        </div>
      ),
    },
    {
      key: "cus_phone",
      header: "Donor Info",
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm text-foreground">
            {item.cus_name || "General Donor"}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {item.cus_phone}
          </span>
          {item.cus_email ? (
            <span className="text-[11px] text-muted-foreground">
              {item.cus_email}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      key: "category",
      header: "Sector & Fund",
      render: (item) => (
        <div className="flex flex-col gap-1 items-start">
          <Badge
            variant="outline"
            className="capitalize text-[11px] font-semibold bg-muted/60"
          >
            {item.category === "zakat" ? "যাকাত" : "সাধারণ"}
          </Badge>
          <span className="text-[11px] text-muted-foreground capitalize">
            {item.fund === "madrasa" ? "মাদ্রাসা" : "অ্যাপ তহবিল"} •{" "}
            {item.frequency === "monthly" ? "মাসিক" : "এককালীন"}
          </span>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (item) => (
        <span className="font-bold text-base text-emerald-600 font-mono">
          ৳{item.amount.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "gateway",
      header: "Gateway",
      render: (item) => renderGatewayBadge(item.provider || item.gateway),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => renderStatusBadge(item.status),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1 text-xs"
          onClick={() => openDetails(item)}
        >
          <Eye className="size-3.5" /> Details
        </Button>
      ),
    },
  ];

  const donorColumns: Column<DonorRecord>[] = [
    {
      key: "name",
      header: "Donor Name",
      render: (item) => (
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs uppercase">
            {item.name ? item.name.charAt(0) : "D"}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-foreground">
              {item.name || "Anonymous Donor"}
            </span>
            {item.email ? (
              <span className="text-xs text-muted-foreground">
                {item.email}
              </span>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone Number",
      render: (item) => (
        <span className="font-mono text-sm font-medium">{item.phone}</span>
      ),
    },
    {
      key: "totalDonated",
      header: "Total Donated",
      render: (item) => (
        <span className="font-bold text-emerald-600 text-base font-mono">
          ৳{item.totalDonated.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "donationCount",
      header: "Successful Donations",
      render: (item) => (
        <Badge variant="outline" className="font-mono bg-emerald-50 text-emerald-700 border-emerald-200">
          {item.donationCount} donations
        </Badge>
      ),
    },
    {
      key: "lastDonationDate",
      header: "Last Donated",
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-xs text-foreground">
            {formatDate(item.lastDonationDate)}
          </span>
          <span className="text-[11px] text-muted-foreground capitalize">
            Status: {item.lastStatus}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Filter",
      render: (item) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1"
          onClick={() => {
            setSearch(item.phone);
            setActiveTab("history");
          }}
        >
          View Transactions
        </Button>
      ),
    },
  ];

  const summary = paymentStats?.summary || {
    totalCollected: 0,
    totalDonations: 0,
    totalDonors: 0,
    todayCollected: 0,
    thisMonthCollected: 0,
    pendingCount: 0,
    failedCount: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Donation Management & Gateways
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor incoming donations, view donor lists, and configure bKash & SSLCommerz payment credentials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchStats();
              refetchHistory();
              refetchDonors();
            }}
            className="gap-1.5"
          >
            <RefreshCw className="size-3.5" /> Refresh Data
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full max-w-3xl">
          <TabsTrigger value="dashboard" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <LayoutDashboard className="size-4" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Coins className="size-4" /> Transactions
          </TabsTrigger>
          <TabsTrigger value="donors" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Users className="size-4" /> Donors List
          </TabsTrigger>
          <TabsTrigger value="gateways" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <ShieldCheck className="size-4" /> Gateway Settings
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Settings2 className="size-4" /> Sectors
          </TabsTrigger>
        </TabsList>

        {/* ========================================================= */}
        {/* TAB 1: DASHBOARD                                          */}
        {/* ========================================================= */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-emerald-500 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                  Total Collected
                </CardTitle>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <Coins className="size-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground font-mono">
                  ৳{summary.totalCollected.toLocaleString("en-IN")}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <CheckCircle className="size-3.5 text-emerald-500" />
                  {summary.totalDonations} successful donations
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                  Total Donors
                </CardTitle>
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Users className="size-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground font-mono">
                  {summary.totalDonors}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Unique donor contacts
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                  This Month
                </CardTitle>
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                  <Calendar className="size-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground font-mono">
                  ৳{summary.thisMonthCollected.toLocaleString("en-IN")}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Collected in current month
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                  Today's Collection
                </CardTitle>
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <TrendingUp className="size-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground font-mono">
                  ৳{summary.todayCollected.toLocaleString("en-IN")}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Collected in last 24 hours
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Daily Collections by Sector</CardTitle>
                <CardDescription>
                  Showing collection amounts across General & Zakat sectors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    general: { label: "General", color: "hsl(var(--chart-1))" },
                    zakat: { label: "Zakat", color: "hsl(var(--chart-2))" },
                  }}
                  className="h-[260px] w-full"
                >
                  <AreaChart
                    accessibilityLayer
                    data={paymentStats?.daily || []}
                    margin={{ left: 12, right: 12 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Area
                      dataKey="zakat"
                      type="monotone"
                      fill="var(--color-zakat)"
                      fillOpacity={0.4}
                      stroke="var(--color-zakat)"
                      stackId="1"
                    />
                    <Area
                      dataKey="general"
                      type="monotone"
                      fill="var(--color-general)"
                      fillOpacity={0.4}
                      stroke="var(--color-general)"
                      stackId="1"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Total Collections</CardTitle>
                <CardDescription>
                  Total successful donation amounts per month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    total: { label: "Total", color: "hsl(var(--chart-3))" },
                  }}
                  className="h-[260px] w-full"
                >
                  <BarChart
                    accessibilityLayer
                    data={paymentStats?.monthly || []}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                    />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="dashed" />}
                    />
                    <Bar dataKey="total" fill="var(--color-total)" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Donations & Method Breakdown */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Donations</CardTitle>
                  <CardDescription>
                    Latest transactions submitted through the platform
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab("history")}
                  className="text-xs"
                >
                  View All &rarr;
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {!paymentStats?.recentDonations ||
                  paymentStats.recentDonations.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      No recent donations recorded yet.
                    </p>
                  ) : (
                    paymentStats.recentDonations.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-emerald-100 text-emerald-700">
                            <Coins className="size-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-sm">
                              {item.cus_name || "General Donor"}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {item.cus_phone} • Trx: {item.tran_id}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-right">
                          <div>
                            <div className="font-bold text-emerald-600 font-mono">
                              ৳{item.amount}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {formatDate(item.createdAt)}
                            </div>
                          </div>
                          {renderStatusBadge(item.status)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Gateways Status</CardTitle>
                <CardDescription>
                  Active status of bKash & SSLCommerz
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3.5 rounded-lg border bg-muted/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm flex items-center gap-1.5">
                      <Smartphone className="size-4 text-pink-600" /> bKash Gateway
                    </span>
                    <Badge
                      variant={bkashForm.isEnabled ? "default" : "outline"}
                      className={
                        bkashForm.isEnabled
                          ? "bg-pink-600 hover:bg-pink-700 text-white"
                          : "text-muted-foreground"
                      }
                    >
                      {bkashForm.isEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Mode:{" "}
                    <span className="font-medium text-foreground">
                      {bkashForm.isSandbox ? "Sandbox (Test)" : "Live (Production)"}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border bg-muted/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm flex items-center gap-1.5">
                      <CreditCard className="size-4 text-blue-600" /> SSLCommerz
                    </span>
                    <Badge
                      variant={sslForm.isEnabled ? "default" : "outline"}
                      className={
                        sslForm.isEnabled
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "text-muted-foreground"
                      }
                    >
                      {sslForm.isEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Mode:{" "}
                    <span className="font-medium text-foreground">
                      {sslForm.isSandbox ? "Sandbox (Test)" : "Live (Production)"}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full gap-1.5"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("gateways")}
                >
                  <KeyRound className="size-3.5" /> Configure Gateway Credentials
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ========================================================= */}
        {/* TAB 2: TRANSACTIONS LIST                                  */}
        {/* ========================================================= */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3 shadow-sm">
            <div className="relative min-w-[220px] flex-1 sm:max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by donor name, phone, email, Trx ID..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="h-9 bg-background pl-9"
              />
            </div>

            <div className="w-[140px]">
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val || "all");
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 bg-background">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-[140px]">
              <Select
                value={gatewayFilter}
                onValueChange={(val) => {
                  setGatewayFilter(val || "all");
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 bg-background">
                  <SelectValue placeholder="Gateway" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Gateways</SelectItem>
                  <SelectItem value="bkash">bKash</SelectItem>
                  <SelectItem value="sslcommerz">SSLCommerz</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-[140px]">
              <Select
                value={sectorFilter}
                onValueChange={(val) => {
                  setSectorFilter(val || "all");
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 bg-background">
                  <SelectValue placeholder="Sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  <SelectItem value="general">সাধারণ (General)</SelectItem>
                  <SelectItem value="zakat">যাকাত (Zakat)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="size-9"
              onClick={() => refetchHistory()}
              disabled={isHistoryLoading}
            >
              <RefreshCw
                className={`size-4 ${isHistoryLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>

          <DataTable<PaymentRecord>
            columns={columns}
            data={historyData?.data as PaymentRecord[] | undefined}
            isLoading={isHistoryLoading}
            page={page}
            totalPages={historyData?.pagination?.totalPages || 1}
            onPageChange={setPage}
            emptyMessage="No donation transactions found"
            emptyDescription="All completed, pending, and failed donation attempts will appear here."
          />
        </TabsContent>

        {/* ========================================================= */}
        {/* TAB 3: DONORS LIST                                        */}
        {/* ========================================================= */}
        <TabsContent value="donors" className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3 shadow-sm">
            <div className="relative min-w-[240px] flex-1 sm:max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search donors by name, phone, or email..."
                value={donorSearch}
                onChange={(e) => {
                  setDonorSearch(e.target.value);
                  setDonorPage(1);
                }}
                className="h-9 bg-background pl-9"
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              className="size-9"
              onClick={() => refetchDonors()}
              disabled={isDonorsLoading}
            >
              <RefreshCw
                className={`size-4 ${isDonorsLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>

          <DataTable<DonorRecord>
            columns={donorColumns}
            data={donorsData?.data as DonorRecord[] | undefined}
            isLoading={isDonorsLoading}
            page={donorPage}
            totalPages={donorsData?.pagination?.totalPages || 1}
            onPageChange={setDonorPage}
            emptyMessage="No donors found"
            emptyDescription="Donors will be cataloged automatically as they make donations."
          />
        </TabsContent>

        {/* ========================================================= */}
        {/* TAB 4: PAYMENT GATEWAY CREDENTIALS (bKash & SSL)          */}
        {/* ========================================================= */}
        <TabsContent value="gateways" className="space-y-6">
          {isGatewayLoading ? (
            <div className="flex h-40 items-center justify-center">
              <RefreshCw className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {/* bKash Configuration Card */}
              <Card className="border shadow-sm">
                <CardHeader className="space-y-1 bg-pink-50/40 dark:bg-pink-950/20 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-pink-700 dark:text-pink-300">
                      <Smartphone className="size-5" /> bKash Gateway Settings
                    </CardTitle>
                    <Button
                      type="button"
                      variant={bkashForm.isEnabled ? "default" : "outline"}
                      size="sm"
                      className={
                        bkashForm.isEnabled
                          ? "bg-pink-600 hover:bg-pink-700 text-white"
                          : ""
                      }
                      onClick={() =>
                        setBkashForm({
                          ...bkashForm,
                          isEnabled: !bkashForm.isEnabled,
                        })
                      }
                    >
                      {bkashForm.isEnabled ? "Active / Enabled" : "Disabled"}
                    </Button>
                  </div>
                  <CardDescription>
                    Configure bKash tokenized checkout credentials and sandbox/live environment.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-5">
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-sm">Mode / Environment</span>
                      <p className="text-xs text-muted-foreground">
                        {bkashForm.isSandbox
                          ? "Currently in Sandbox (Test) mode"
                          : "Currently in Live (Production) mode"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setBkashForm({
                          ...bkashForm,
                          isSandbox: !bkashForm.isSandbox,
                        })
                      }
                      className={
                        bkashForm.isSandbox
                          ? "border-amber-400 text-amber-700 bg-amber-50"
                          : "border-emerald-500 text-emerald-700 bg-emerald-50"
                      }
                    >
                      {bkashForm.isSandbox ? "Sandbox Mode" : "Live Mode"}
                    </Button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">
                      App Key
                    </label>
                    <Input
                      value={bkashForm.appKey}
                      onChange={(e) =>
                        setBkashForm({ ...bkashForm, appKey: e.target.value })
                      }
                      placeholder="e.g. 4f6xxxxxxxxx"
                      className="font-mono text-xs bg-background"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-muted-foreground">
                        App Secret
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowBkashSecret(!showBkashSecret)}
                        className="text-[11px] text-primary hover:underline"
                      >
                        {showBkashSecret ? "Hide" : "Show"}
                      </button>
                    </div>
                    <Input
                      type={showBkashSecret ? "text" : "password"}
                      value={bkashForm.appSecret}
                      onChange={(e) =>
                        setBkashForm({ ...bkashForm, appSecret: e.target.value })
                      }
                      placeholder="Enter bKash App Secret"
                      className="font-mono text-xs bg-background"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">
                        Username
                      </label>
                      <Input
                        value={bkashForm.username}
                        onChange={(e) =>
                          setBkashForm({
                            ...bkashForm,
                            username: e.target.value,
                          })
                        }
                        placeholder="e.g. sandboxTokenizedUser02"
                        className="font-mono text-xs bg-background"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-muted-foreground">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowBkashPass(!showBkashPass)}
                          className="text-[11px] text-primary hover:underline"
                        >
                          {showBkashPass ? "Hide" : "Show"}
                        </button>
                      </div>
                      <Input
                        type={showBkashPass ? "text" : "password"}
                        value={bkashForm.password}
                        onChange={(e) =>
                          setBkashForm({
                            ...bkashForm,
                            password: e.target.value,
                          })
                        }
                        placeholder="Enter password"
                        className="font-mono text-xs bg-background"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Merchant Mobile Number (Optional reference)
                    </label>
                    <Input
                      value={bkashForm.merchantNumber}
                      onChange={(e) =>
                        setBkashForm({
                          ...bkashForm,
                          merchantNumber: e.target.value,
                        })
                      }
                      placeholder="e.g. 01700000000"
                      className="font-mono text-xs bg-background"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* SSLCommerz Configuration Card */}
              <Card className="border shadow-sm">
                <CardHeader className="space-y-1 bg-blue-50/40 dark:bg-blue-950/20 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                      <CreditCard className="size-5" /> SSLCommerz Settings
                    </CardTitle>
                    <Button
                      type="button"
                      variant={sslForm.isEnabled ? "default" : "outline"}
                      size="sm"
                      className={
                        sslForm.isEnabled
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : ""
                      }
                      onClick={() =>
                        setSslForm({
                          ...sslForm,
                          isEnabled: !sslForm.isEnabled,
                        })
                      }
                    >
                      {sslForm.isEnabled ? "Active / Enabled" : "Disabled"}
                    </Button>
                  </div>
                  <CardDescription>
                    Configure Store ID and Store Password for Visa, Mastercard, and Mobile Banking payments.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-5">
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-sm">Mode / Environment</span>
                      <p className="text-xs text-muted-foreground">
                        {sslForm.isSandbox
                          ? "Currently in Sandbox (Test) mode"
                          : "Currently in Live (Production) mode"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSslForm({
                          ...sslForm,
                          isSandbox: !sslForm.isSandbox,
                        })
                      }
                      className={
                        sslForm.isSandbox
                          ? "border-amber-400 text-amber-700 bg-amber-50"
                          : "border-emerald-500 text-emerald-700 bg-emerald-50"
                      }
                    >
                      {sslForm.isSandbox ? "Sandbox Mode" : "Live Mode"}
                    </Button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Store ID
                    </label>
                    <Input
                      value={sslForm.storeId}
                      onChange={(e) =>
                        setSslForm({ ...sslForm, storeId: e.target.value })
                      }
                      placeholder="e.g. testbox_live or testbox"
                      className="font-mono text-xs bg-background"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-muted-foreground">
                        Store Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowSslPass(!showSslPass)}
                        className="text-[11px] text-primary hover:underline"
                      >
                        {showSslPass ? "Hide" : "Show"}
                      </button>
                    </div>
                    <Input
                      type={showSslPass ? "text" : "password"}
                      value={sslForm.storePassword}
                      onChange={(e) =>
                        setSslForm({
                          ...sslForm,
                          storePassword: e.target.value,
                        })
                      }
                      placeholder="Enter Store Password"
                      className="font-mono text-xs bg-background"
                    />
                  </div>

                  <div className="rounded-lg border bg-muted/40 p-3 space-y-1.5 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      <CheckCircle className="size-3.5 text-emerald-600" /> Auto Callbacks Managed
                    </span>
                    <p>
                      Payment IPN, Success, Cancel, and Failure redirects are automatically linked to your system without manual webhook entry needed in SSLCommerz panel.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              className="gap-2 h-11 px-8 text-sm font-semibold"
              onClick={handleSaveGateways}
              disabled={updateGatewayMutation.isPending}
            >
              <Save className="size-4" />
              {updateGatewayMutation.isPending
                ? "Saving..."
                : "Save Gateway Credentials"}
            </Button>
          </div>
        </TabsContent>

        {/* ========================================================= */}
        {/* TAB 5: SECTORS & AMOUNTS                                  */}
        {/* ========================================================= */}
        <TabsContent value="settings" className="space-y-4">
          {isConfigLoading ? (
            <div className="flex h-40 items-center justify-center">
              <RefreshCw className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Left Column: Funds */}
              <Card className="flex flex-col h-fit">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>Donation Sectors</CardTitle>
                    <CardDescription>
                      Configure categories where donors can contribute (General, Zakat, Madrasa, etc.).
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleAddFund}
                    className="h-8 gap-1"
                  >
                    <Plus className="size-4" /> Add Sector
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {funds.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      No sectors created. Add one to start.
                    </p>
                  ) : (
                    funds.map((fund, idx) => (
                      <div
                        key={fund.id || idx}
                        className="p-4 rounded-lg border bg-muted/40 relative space-y-3"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFund(fund.id)}
                          className="absolute right-2 top-2 size-8 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                        <div className="flex items-center gap-3 pr-8 justify-between">
                          <div className="space-y-1 flex-1">
                            <label className="text-xs font-semibold text-muted-foreground">
                              Sector ID
                            </label>
                            <Input
                              value={fund.id}
                              onChange={(e) =>
                                handleFundChange(fund.id, "id", e.target.value)
                              }
                              placeholder="e.g. general"
                              className="h-9 bg-background"
                            />
                          </div>
                          <div className="pt-4">
                            <Badge
                              variant="outline"
                              className="bg-emerald-50 text-emerald-700 border-emerald-200 py-1.5 px-3 font-mono text-sm font-semibold whitespace-nowrap"
                            >
                              Collected: ৳
                              {fund.collected.toLocaleString("en-IN")}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">
                            Title (Bengali)
                          </label>
                          <Input
                            value={fund.title}
                            onChange={(e) =>
                              handleFundChange(fund.id, "title", e.target.value)
                            }
                            placeholder="সাধারণ তহবিল"
                            className="h-9 bg-background"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">
                            Subtitle (Bengali)
                          </label>
                          <Input
                            value={fund.subtitle}
                            onChange={(e) =>
                              handleFundChange(
                                fund.id,
                                "subtitle",
                                e.target.value
                              )
                            }
                            placeholder="সাধারণ দ্বীনি কাজে ব্যয় করা হবে"
                            className="h-9 bg-background"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Right Column: Quick Amounts */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Donation Amounts</CardTitle>
                    <CardDescription>
                      Fast presets shown to the donor on the frontend payment screen.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">
                        Amounts list (Comma separated numbers)
                      </label>
                      <Input
                        value={quickAmountsStr}
                        onChange={(e) => setQuickAmountsStr(e.target.value)}
                        placeholder="100, 500, 1000, 5000, 10000"
                        className="font-mono bg-background"
                      />
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Must be valid positive integers separated by commas.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  className="w-full flex gap-2 justify-center items-center h-11 text-sm font-semibold"
                  onClick={handleSaveSectors}
                  disabled={updateConfigMutation.isPending}
                >
                  <Save className="size-4" /> Save Sectors & Amounts
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ========================================================= */}
      {/* DONATION DETAILS DIALOG                                   */}
      {/* ========================================================= */}
      <Dialog
        open={Boolean(selectedDonation)}
        onOpenChange={(open) => !open && setSelectedDonation(null)}
      >
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Coins className="size-5 text-emerald-600" /> Donation Details
              </DialogTitle>
              {selectedDonation
                ? renderStatusBadge(selectedDonation.status)
                : null}
            </div>
            <DialogDescription className="font-mono text-xs text-muted-foreground">
              Transaction ID: {selectedDonation?.tran_id}
            </DialogDescription>
          </DialogHeader>

          {selectedDonation ? (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg border bg-muted/30 text-xs">
                <div>
                  <span className="text-muted-foreground block">Donor Name:</span>
                  <span className="font-semibold text-foreground text-sm">
                    {selectedDonation.cus_name || "General Donor"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Phone Number:</span>
                  <span className="font-semibold text-foreground font-mono text-sm">
                    {selectedDonation.cus_phone}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Email:</span>
                  <span className="font-semibold text-foreground">
                    {selectedDonation.cus_email || "Not provided"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Amount:</span>
                  <span className="font-bold text-emerald-600 text-base font-mono">
                    ৳{selectedDonation.amount.toLocaleString("en-IN")}{" "}
                    {selectedDonation.currency}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 p-3 rounded-lg border text-xs">
                <div>
                  <span className="text-muted-foreground block">Sector:</span>
                  <span className="font-semibold capitalize">
                    {selectedDonation.category === "zakat" ? "যাকাত" : "সাধারণ"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Fund:</span>
                  <span className="font-semibold capitalize">
                    {selectedDonation.fund === "madrasa" ? "মাদ্রাসা" : "অ্যাপ"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Frequency:</span>
                  <span className="font-semibold capitalize">
                    {selectedDonation.frequency === "monthly" ? "মাসিক" : "এককালীন"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Payment Gateway:</span>
                  <span className="font-semibold capitalize">
                    {selectedDonation.provider || selectedDonation.gateway}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground block">Date & Time:</span>
                  <span className="font-semibold">
                    {formatDate(selectedDonation.createdAt)}
                  </span>
                </div>
              </div>

              {/* Status & Notes update */}
              <div className="p-3.5 rounded-lg border bg-card space-y-3">
                <span className="text-xs font-semibold text-foreground block">
                  Update Transaction Status & Admin Notes
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-muted-foreground font-semibold">
                      Status
                    </label>
                    <Select
                      value={newStatus}
                      onValueChange={(val) => setNewStatus(val || "pending")}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-muted-foreground font-semibold">
                      Admin Notes
                    </label>
                    <Input
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="e.g. Verified via bank statement"
                      className="h-9"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <Button
                    size="sm"
                    className="h-8 gap-1.5"
                    onClick={handleUpdateDonationStatus}
                    disabled={updateStatusMutation.isPending}
                  >
                    <Save className="size-3.5" /> Save Changes
                  </Button>
                </div>
              </div>

              {/* Raw Gateway Execution / Create data */}
              {selectedDonation.rawExecute || selectedDonation.rawCreate ? (
                <details className="text-xs border rounded-lg p-2.5 bg-muted/20">
                  <summary className="cursor-pointer font-semibold text-muted-foreground hover:text-foreground">
                    View Raw Gateway Response Payload
                  </summary>
                  <pre className="mt-2 p-2 bg-muted/60 rounded text-[11px] font-mono overflow-x-auto max-h-40">
                    {JSON.stringify(
                      selectedDonation.rawExecute ||
                        selectedDonation.rawCreate,
                      null,
                      2
                    )}
                  </pre>
                </details>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
