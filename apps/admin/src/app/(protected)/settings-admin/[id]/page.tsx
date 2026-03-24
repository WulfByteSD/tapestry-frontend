import { createAdminPageMetadata } from "@/app/pageMetadata";
import { SettingEditor } from "@/features/settings/_components/settingEditor/SettingEditor.component";

export const metadata = createAdminPageMetadata({
  title: "Edit Setting",
  description: "Review and update a setting's identity, modules, and linked admin configuration.",
});

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SettingEditorPage(props: Props) {
  const params = await props.params;
  return <SettingEditor settingId={params.id} />;
}
