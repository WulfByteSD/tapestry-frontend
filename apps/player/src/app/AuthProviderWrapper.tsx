"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@tapestry/hooks";
import { useLogin, useLogout, useMe } from "@/lib/auth-hooks";

export function AuthProviderWrapper({ children }: { children: ReactNode }) {
  return <AuthProvider hooks={{ useLogin, useLogout, useMe }}>{children}</AuthProvider>;
}
