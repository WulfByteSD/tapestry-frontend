"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMe } from "@/lib/auth-hooks";
import styles from "./PublicGate.module.scss";

export default function PublicGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const params = useSearchParams();
  const { data: user, isLoading } = useMe();
  console.log("PublicGate user", user, "isLoading", isLoading);

  useEffect(() => {
    if (isLoading) return;
    if (user) {
      const next = params.get("next") || "/";
      router.replace(next);
    }
  }, [isLoading, user, router, params]);

  if (isLoading) return <div className={styles.state}>Loading…</div>;
  if (user) return <div className={styles.state}>Redirecting…</div>;

  return <>{children}</>;
}
