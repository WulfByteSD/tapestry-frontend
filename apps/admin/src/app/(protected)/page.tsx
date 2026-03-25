import { createAdminPageMetadata } from "@/app/pageMetadata";
import DashboardView from "@/views/dashboard/Dashboard.view";

export const metadata = createAdminPageMetadata({
  title: "Dashboard",
  description: "Start from the admin landing page and confirm the protected workspace is ready for content work.",
});

export default function AdminDashboardPage() {
  return <DashboardView />;
}
