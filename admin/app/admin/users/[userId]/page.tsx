"use client";

import { useParams } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Shield, ShieldCheck, Pencil } from "lucide-react";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  moderator: "Moderator",
  mufti: "Mufti",
  user: "User",
  writer: "Writer",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  moderator: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  mufti:
    "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  user: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  writer: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
};

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.userId as string;
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin = currentUser?.role === "admin";

  const { data: user, isLoading } = useUser(userId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">User not found</p>
        <Link
          href="/admin/users"
          className="inline-flex items-center justify-center h-7 px-2.5 rounded-lg border border-border font-medium mt-4"
        >
          Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Users
      </Link>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Profile</h1>
        {isAdmin && (
          <Link href={`/admin/users/${userId}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="size-4 mr-1" />
              Edit
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>User Information</span>
            <Badge variant="secondary" className={ROLE_COLORS[user.role]}>
              {user.role === "admin" && <ShieldCheck className="size-3 mr-1" />}
              {user.role === "moderator" && <Shield className="size-3 mr-1" />}
              {user.role === "mufti" && <Shield className="size-3 mr-1" />}
              {ROLE_LABELS[user.role] ?? user.role}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="font-medium">{user.name || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{user.email || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p className="font-medium">{user.phone || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Role</p>
              <p className="font-medium capitalize">{user.role}</p>
            </div>
          </div>
          <div className="pt-2 border-t">
            <p>
              User ID:{" "}
              <span className="text-foreground font-mono text-xs">
                {user._id}
              </span>
            </p>
            <p>Created: {formatDateTime(user.createdAt)}</p>
            <p>Updated: {formatDateTime(user.updatedAt)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
