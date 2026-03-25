import { createAdminPageMetadata } from "@/app/pageMetadata";
import NodeWorkspace from "@/features/content/_components/nodeWorkspace/NodeWorkspace.component";

export const metadata = createAdminPageMetadata({
  title: "New Skill",
  description: "Create a new skill record for a setting and prepare it for broader content authoring.",
});

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ContentNodePage({ params }: PageProps) {
  const { id } = await params;
  return <NodeWorkspace nodeId={id} />;
}
