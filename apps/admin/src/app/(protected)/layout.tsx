import { Suspense } from "react";
import AdminShell from "@/components/adminShell/AdminShell.component";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
