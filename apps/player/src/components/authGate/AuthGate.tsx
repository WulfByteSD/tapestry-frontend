"use client";

import { ReactNode } from "react";
import { useMe } from "@/lib/auth-hooks";
import LoginView from "@/views/loginView/Login.view";

export default function AuthGate({ children }: { children: ReactNode }) {
  const { data: user, isLoading, isError } = useMe();

  if (isLoading) return <div className="p-4 text-sm">Loading…</div>;

  // If token is missing or /me fails -> show login
  if (!user || isError) return <LoginView />;

  return <>{children}</>;
}