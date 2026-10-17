"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { emailLogin } from "@/services/auth";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

const emailLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type EmailLoginForm = z.infer<typeof emailLoginSchema>;

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const [isLoading, setIsLoading] = useState(false);

  const emailForm = useForm<EmailLoginForm>({
    resolver: zodResolver(emailLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onEmailSubmit(data: EmailLoginForm) {
    setIsLoading(true);
    try {
      const response = await emailLogin(data);
      const { user, token } = response;

      // Store backend token for API requests
      if (token) {
        useAuthStore.getState().setAuth(token, user);
      }

      const result = await signIn("credentials", {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
        backendToken: "session",
        redirect: false,
      });

      if (result?.error) {
        toast.error("Authentication failed. Please try again.");
        return;
      }

      toast.success("Signed in successfully!");
      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      const err = error as { message?: string };
      const message =
        err.message || "Login failed. Please check your email and password.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Siraatul Admin</CardTitle>
          <CardDescription>
            Sign in with your email and password
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={emailForm.handleSubmit(onEmailSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 " />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  className="pl-9"
                  {...emailForm.register("email")}
                  disabled={isLoading}
                />
              </div>
              {emailForm.formState.errors.email && (
                <p className=" text-destructive">
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 " />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-9"
                  {...emailForm.register("password")}
                  disabled={isLoading}
                />
              </div>
              {emailForm.formState.errors.password && (
                <p className=" text-destructive">
                  {emailForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="size-4 mr-2 animate-spin" />}
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
          <div className="">Loading...</div>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
