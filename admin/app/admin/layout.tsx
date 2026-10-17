"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { ThemeProvider } from "@/providers/theme-provider";
import { Sidebar } from "@/components/admin/sidebar";
import { Navbar } from "@/components/admin/navbar";
import { BreadcrumbNav } from "@/components/admin/breadcrumb-nav";
import { Toaster } from "@/components/ui/sonner";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Sidebar as MobileSidebar } from "@/components/admin/sidebar";
import { PageSkeleton } from "@/components/shared/loading-skeleton";

function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated" && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [status, router, pathname]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <PageSkeleton />
      </div>
    );
  }

  if (!session && pathname !== "/admin/login") {
    return null;
  }

  return <>{children}</>;
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="hidden md:flex">
        <Sidebar />
      </div>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <MobileSidebar />
        </SheetContent>
      </Sheet>
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {pathname !== "/admin/login" && (
            <div className="mb-5">
              <BreadcrumbNav />
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return (
      <ThemeProvider>
        {children}
        <Toaster />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <AdminAuthGuard>
        <AdminShell>{children}</AdminShell>
      </AdminAuthGuard>
      <Toaster />
    </ThemeProvider>
  );
}
