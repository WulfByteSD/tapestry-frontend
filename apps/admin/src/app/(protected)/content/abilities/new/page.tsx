import { createAdminPageMetadata } from "@/app/pageMetadata";
import NodeWorkspace from "@/features/content/_components/nodeWorkspace/NodeWorkspace.component";

export const metadata = createAdminPageMetadata({
  title: "New Ability",
  description: "Create a new ability record for a setting and prepare it for later content linking.",
});

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ContentNodePage({ params }: PageProps) {
  const { id } = await params;
  return <NodeWorkspace nodeId={id} />;
}
