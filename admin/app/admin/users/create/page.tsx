"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema, type CreateUserForm } from "@/lib/validations/user";
import { useCreateUser } from "@/hooks/use-user";
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
import { toast } from "sonner";
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function CreateUserPage() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin = currentUser?.role === "admin";

  const createMutation = useCreateUser();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      role: "user",
    },
  });

  const onSubmit = useCallback(
    async (data: CreateUserForm) => {
      createMutation.mutate(data, {
        onSuccess: () => {
          toast.success("User created successfully");
          router.push("/admin/users");
        },
        onError: (err: Error) => {
          const axiosData = (
            err as import("axios").AxiosError<{ error: string }>
          ).response?.data;
          const message = axiosData?.error ?? "Failed to create user";
          toast.error(message);
        },
      });
    },
    [createMutation, router],
  );

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          You do not have permission to access this page.
        </p>
        <Link
          href="/admin"
          className="inline-flex items-center justify-center h-7 px-2.5 rounded-lg border border-border font-medium mt-4"
        >
          Back to Admin
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
      <h1 className="text-2xl font-bold">Create User</h1>

      <Card>
        <CardHeader>
          <CardTitle>New User Details</CardTitle>
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
              <Label htmlFor="phone">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="e.g. 01XXXXXXXXX"
                {...form.register("phone")}
              />
              {form.formState.errors.phone && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com (optional)"
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
                  placeholder="Minimum 6 characters"
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
            </div>

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

            <div className="flex items-center gap-2 pt-2">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <Loader2 className="size-4 mr-2 animate-spin" />
                ) : null}
                Create User
              </Button>
              <Link href="/admin/users">
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
