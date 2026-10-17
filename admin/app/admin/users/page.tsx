"use client";

import { useState, useMemo } from "react";
import { useUserList, useDeleteUser } from "@/hooks/use-user";
import { useAuthStore } from "@/store/auth-store";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, Shield, ShieldCheck, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { useRouter } from "next/navigation";
import type { User } from "@/types/user";
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

export default function UsersPage() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin = currentUser?.role === "admin";
  if (!isAdmin) {
    router.push("/admin");
  }

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const params = useMemo(
    () => ({
      q: debouncedSearch || undefined,
      role: roleFilter === "all" ? undefined : roleFilter,
      page,
      limit: 20,
    }),
    [debouncedSearch, roleFilter, page],
  );

  const { data, isLoading, isError, error, refetch } = useUserList(params);
  const deleteMutation = useDeleteUser();

  const users = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  const columns: Column<User>[] = [
    {
      key: "name",
      header: "Name",
      render: (user) => (
        <span className="font-medium">{user.name || "\u2014"}</span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (user) => user.email || "\u2014",
    },
    {
      key: "phone",
      header: "Phone",
      render: (user) => user.phone || "\u2014",
    },
    {
      key: "role",
      header: "Role",
      render: (user) => (
        <Badge variant="secondary" className={ROLE_COLORS[user.role]}>
          {user.role === "admin" && <ShieldCheck className="size-3 mr-1" />}
          {user.role === "moderator" && <Shield className="size-3 mr-1" />}
          {user.role === "mufti" && <Shield className="size-3 mr-1" />}
          {ROLE_LABELS[user.role] ?? user.role}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      render: (user) => (
        <span className="text-sm text-muted-foreground">
          {formatDateTime(user.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (user) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            title="View"
            onClick={() => router.push(`/admin/users/${user._id}`)}
          >
            <Eye className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            title="Edit"
            onClick={() => router.push(`/admin/users/${user._id}/edit`)}
          >
            <Pencil className="size-3.5" />
          </Button>
          {user.role !== "admin" && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              title="Delete"
              onClick={() => setDeleteId(user._id)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        toast.success("User deleted");
        setDeleteId(null);
      },
      onError: () => {
        toast.error("Failed to delete user");
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage registered users</p>
        </div>
        {isAdmin && (
          <Button onClick={() => router.push("/admin/users/create")}>
            <Plus className="size-4 mr-2" />
            Create User
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1" />
        <Select
          value={roleFilter}
          onValueChange={(v) => {
            setRoleFilter(v ?? "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
            <SelectItem value="mufti">Mufti</SelectItem>
            <SelectItem value="writer">Writer</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search by name, email, or phone..."
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyMessage="No users found"
        emptyDescription="No users match your search criteria."
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The user will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
