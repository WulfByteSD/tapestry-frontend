"use client";

import { useIsDesktop } from "@/hooks/useIsDesktop";
import PortalMobile from "./PortalMobile.component";
import PortalDesktop from "./PortalDesktop.component";

export default function PortalShell({ children }: { children: React.ReactNode }) {
  const isDesktop = useIsDesktop(768);

  if (isDesktop) {
    return <PortalDesktop>{children}</PortalDesktop>;
  }

  return <PortalMobile>{children}</PortalMobile>;
}
