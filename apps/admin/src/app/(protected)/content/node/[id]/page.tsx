import NodeWorkspace from "@/features/content/_components/nodeWorkspace/NodeWorkspace.component";

type PageProps = {
  params: Promise<{ id: string }>;
};
export default async function ContentNodePage({ params }: PageProps) {
  const { id } = await params;
  return <NodeWorkspace nodeId={id} />;
}
