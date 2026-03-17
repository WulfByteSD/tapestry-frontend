import NodeWorkspace from "@/features/content/_components/nodeWorkspace/NodeWorkspace.component";

export default function ContentNodePage({ params }: { params: { id: string } }) {
  return <NodeWorkspace nodeId={params.id} />;
}
