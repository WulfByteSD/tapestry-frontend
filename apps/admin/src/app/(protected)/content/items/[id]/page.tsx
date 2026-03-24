import { createAdminPageMetadata } from "@/app/pageMetadata";
import NodeWorkspace from "@/features/content/_components/nodeWorkspace/NodeWorkspace.component";

export const metadata = createAdminPageMetadata({
  title: "Edit Item",
  description: "Update an item record and its connected gameplay details within the admin workspace.",
});

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ContentNodePage({ params }: PageProps) {
  const { id } = await params;
  return <NodeWorkspace nodeId={id} />;
}
