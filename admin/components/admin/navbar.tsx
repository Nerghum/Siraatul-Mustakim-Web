"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useLogout } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth-store";
import { ThemeToggle } from "./theme-toggle";
import { getAdminNavItem } from "./nav-items";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LogOut, Menu, Shield, ShieldCheck, BookOpen } from "lucide-react";

const ROLE_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; className: string }
> = {
  admin: {
    label: "Admin",
    icon: <ShieldCheck className="size-3" />,
    className:
      "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-red-200 dark:border-red-800",
  },
  moderator: {
    label: "Moderator",
    icon: <Shield className="size-3" />,
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  },
  mufti: {
    label: "Mufti",
    icon: <BookOpen className="size-3" />,
    className:
      "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  },
  user: {
    label: "User",
    icon: null,
    className:
      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700",
  },
};

function getInitials(phone?: string, email?: string): string {
  if (email) return email.slice(0, 2).toUpperCase();
  if (phone) return phone.slice(-2).toUpperCase();
  return "AD";
}

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const logout = useLogout();
  const { data: session } = useSession();
  const authUser = useAuthStore((s) => s.user);
  const pathname = usePathname();
  const currentItem = getAdminNavItem(pathname);

  const userPhone = authUser?.phone ?? session?.user?.phone;
  const userEmail = authUser?.email;
  const userRole = authUser?.role ?? "admin";
  const roleConfig = ROLE_CONFIG[userRole] ?? ROLE_CONFIG.user;

  const displayName = userEmail || userPhone || "Admin";
  const initials = getInitials(userPhone, userEmail);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="size-9 md:hidden text-slate-600 dark:text-slate-300"
          onClick={onMenuClick}
        >
          <Menu className="size-5" />
        </Button>
        <div className="hidden sm:block">
          <div className="text-sm text-slate-500">Welcome back</div>
          <div className="font-semibold">{displayName}</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center gap-2.5 px-2.5 h-9 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Avatar className="size-8 border-2 border-border">
            <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col items-start leading-tight">
            <span className="text-sm font-medium">{displayName}</span>
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 h-4 font-medium gap-0.5 ${roleConfig.className}`}
            >
              {roleConfig.icon}
              {roleConfig.label}
            </Badge>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="p-3">
              <div className="flex items-center gap-3">
                <Avatar className="size-10 border-2 border-border">
                  <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-sm font-medium truncate">
                    {displayName}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 h-4 font-medium gap-0.5 w-fit ${roleConfig.className}`}
                  >
                    {roleConfig.icon}
                    {roleConfig.label}
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="cursor-pointer">
            <LogOut className="size-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      </div>
    </header>
  );
}
