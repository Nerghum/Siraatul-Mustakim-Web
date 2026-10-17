"use client";

import { useCallback, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateUserSchema, type UpdateUserForm } from "@/lib/validations/user";
import { useUser, useUpdateUser } from "@/hooks/use-user";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function EditUserPage() {
  const params = useParams();
  const userId = params.userId as string;
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin = currentUser?.role === "admin";

  const { data: user, isLoading } = useUser(userId);
  const updateMutation = useUpdateUser();

  const [formPopulated, setFormPopulated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<UpdateUserForm>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
    },
  });

  useEffect(() => {
    if (user && !formPopulated) {
      form.reset({
        name: user.name ?? "",
        email: user.email ?? "",
        password: "",
        role: user.role,
      });
      setFormPopulated(true);
    }
  }, [user, formPopulated, form]);

  const onSubmit = useCallback(
    async (data: UpdateUserForm) => {
      const payload: Record<string, unknown> = {};

      if (data.name !== undefined) payload.name = data.name;
      if (data.email !== undefined && data.email !== "")
        payload.email = data.email;
      if (data.password !== undefined && data.password !== "")
        payload.password = data.password;
      if (isAdmin && data.role !== undefined) payload.role = data.role;

      if (Object.keys(payload).length === 0) {
        toast.info("No changes to save");
        return;
      }

      updateMutation.mutate(
        {
          id: userId,
          data: payload as import("@/types/user").UpdateUserPayload,
        },
        {
          onSuccess: () => {
            toast.success("User updated successfully");
            form.reset({ ...form.getValues(), password: "" });
          },
          onError: (err: Error) => {
            const axiosData = (
              err as import("axios").AxiosError<{ error: string }>
            ).response?.data;
            const message = axiosData?.error ?? "Failed to update user";
            toast.error(message);
          },
        },
      );
    },
    [userId, updateMutation, isAdmin, form],
  );

  const isPending = updateMutation.isPending;

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl">
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
        href={`/admin/users/${userId}`}
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to User
      </Link>
      <h1 className="text-2xl font-bold">Edit User</h1>

      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Full name"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Leave blank to keep current"
                  className="pr-9"
                  {...form.register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.password.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Leave empty to keep the current password
              </p>
            </div>

            {isAdmin && (
              <div className="space-y-2">
                <Label>Role</Label>
                <Controller
                  name="role"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="writer">Writer</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="mufti">Mufti</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.role && (
                  <p className="text-destructive text-sm">
                    {form.formState.errors.role.message}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="size-4 mr-2 animate-spin" />
                ) : (
                  <Save className="size-4 mr-2" />
                )}
                Save Changes
              </Button>
              <Link href={`/admin/users/${userId}`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
