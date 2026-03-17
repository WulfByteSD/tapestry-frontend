"use client";

import React, { createContext, useContext, ReactNode } from "react";

export type AuthHooks = {
  useLogin: () => {
    mutate: (credentials: { email: string; password: string }) => void;
    isPending: boolean;
  };
  useLogout: () => () => void;
  useMe: () => {
    data?: unknown | null;
    isLoading?: boolean;
    isError?: boolean;
  };
};

const AuthContext = createContext<AuthHooks | null>(null);

export type AuthProviderProps = {
  hooks: AuthHooks;
  children: ReactNode;
};

export function AuthProvider({ hooks, children }: AuthProviderProps) {
  return <AuthContext.Provider value={hooks}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuthContext must be used within an AuthProvider. " +
        "Ensure your app root is wrapped with <AuthProvider hooks={...}>.",
    );
  }

  return context;
}
