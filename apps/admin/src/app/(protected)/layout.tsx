import AdminShell from "@/components/adminShell/AdminShell.component";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
