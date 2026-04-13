import { createAdminPageMetadata } from "@/app/pageMetadata";
import NodeWorkspace from "@/features/content/_components/nodeWorkspace/NodeWorkspace.component";
import ItemEditor from "@/views/content/items/itemEditor/ItemEditor.component";

export const metadata = createAdminPageMetadata({
  title: "New Item",
  description: "Create a new item record for a setting and prepare it for broader content authoring.",
});

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ContentNodePage({ params }: PageProps) {
  const { id } = await params;
  return <ItemEditor id={id} />;
}
