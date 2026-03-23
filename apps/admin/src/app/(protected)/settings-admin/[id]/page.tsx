import { SettingEditor } from "@/features/settings/_components/settingEditor/SettingEditor.component";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SettingEditorPage(props: Props) {
  const params = await props.params;
  return <SettingEditor settingId={params.id} />;
}
