import NewNodeWorkspace from "@/features/content/_components/nodeWorkspace/NewNodeWorkspace.component";

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
