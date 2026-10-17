"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { signin as signinApi } from "@/services/auth";

export function useSignin() {
  return useMutation({
    mutationFn: signinApi,
  });
}

export function useLogout() {
  const router = useRouter();

  return async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    await signOut({ redirect: false });
    router.push("/admin/login");
    router.refresh();
  };
}
