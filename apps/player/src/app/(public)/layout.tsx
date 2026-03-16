import { Suspense } from "react";
import PortalShell from "@/components/portalShell/PortalShell.component";
import PublicGate from "@/components/publicGate/PublicGate.component";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PublicGate>{children}</PublicGate>
    </Suspense>
  );
}
