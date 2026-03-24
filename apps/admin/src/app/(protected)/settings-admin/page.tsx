import { createAdminPageMetadata } from "@/app/pageMetadata";
import SettingsManagement from "@/features/settings/_components/settingsManagement/SettingsManagement.component";

export const metadata = createAdminPageMetadata({
  title: "Settings",
  description: "Browse and manage the settings records that anchor content modules across the admin workspace.",
});

export default function SettingsAdminPage() {
  return <SettingsManagement />;
}
