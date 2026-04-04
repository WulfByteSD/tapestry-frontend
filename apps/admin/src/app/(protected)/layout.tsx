import { Suspense } from "react";
import NextTopLoader from "nextjs-toploader";
import AdminShell from "@/components/adminShell/AdminShell.component";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NextTopLoader
        color="var(--accent)"
        height={3}
        showSpinner={false}
        easing="ease"
        speed={200}
        shadow="0 0 10px var(--accent),0 0 5px var(--accent)"
      />
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
