import { createAdminPageMetadata } from "@/app/pageMetadata";
import NodeWorkspace from "@/features/content/_components/nodeWorkspace/NodeWorkspace.component";
import AbilityEditor from "@/views/content/abilities/abilityEditor/AbilityEditor.component";

export const metadata = createAdminPageMetadata({
  title: "Edit Ability",
  description: "Update an ability record and its gameplay-facing details from the admin workspace.",
});

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ContentNodePage({ params }: PageProps) {
  const { id } = await params;
  return <AbilityEditor id={id} />;
}
