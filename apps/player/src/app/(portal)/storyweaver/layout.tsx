"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "@/lib/auth-hooks";
import { usePlayerProfile } from "@/lib/settings-hooks";

export default function StoryweaverLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: me, isLoading: meLoading } = useMe();
  const playerId = me?.profileRefs?.player as string | undefined;
  const { data: profile, isLoading: profileLoading } = usePlayerProfile(playerId);

  useEffect(() => {
    if (meLoading || profileLoading) return;

    const roles = profile?.roles || [];
    if (!roles.includes("storyweaver")) {
      router.replace("/storyweaver/become");
    }
  }, [meLoading, profileLoading, profile, router]);

  if (meLoading || profileLoading) {
    return <div>Loading Storyweaver tools…</div>;
  }

  const roles = profile?.roles || [];
  if (!roles.includes("storyweaver")) {
    return null;
  }

  return <>{children}</>;
}
