import { createAdminPageMetadata } from "@/app/pageMetadata";
import NewNodeWorkspace from "@/features/content/_components/nodeWorkspace/NewNodeWorkspace.component";

export const metadata = createAdminPageMetadata({
  title: "New Lore Node",
  description: "Create a new lore node and place it within a setting's content graph.",
});

type PageProps = {
  searchParams: Promise<{
    settingKey?: string;
    parentId?: string;
  }>;
};

export default async function ContentNewNodePage({ searchParams }: PageProps) {
  const { settingKey = "", parentId = "" } = await searchParams;

  return <NewNodeWorkspace settingKey={settingKey} parentId={parentId || null} />;
}
