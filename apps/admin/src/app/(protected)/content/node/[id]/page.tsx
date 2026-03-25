import { createAdminPageMetadata } from "@/app/pageMetadata";
import NodeWorkspace from "@/features/content/_components/nodeWorkspace/NodeWorkspace.component";

export const metadata = createAdminPageMetadata({
  title: "Edit Lore Node",
  description: "Edit a lore node's structure, relationships, and linked content inside the admin workspace.",
});

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ContentNodePage({ params }: PageProps) {
  const { id } = await params;
  return <NodeWorkspace nodeId={id} />;
}
