import { createAdminPageMetadata } from "@/app/pageMetadata"; 
import AbilityEditor from "@/views/content/abilities/abilityEditor/AbilityEditor.component";

export const metadata = createAdminPageMetadata({
  title: "New Ability",
  description: "Create a new ability record for a setting and prepare it for later content linking.",
});

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ContentNodePage({ params }: PageProps) {
  const { id } = await params;
  return <AbilityEditor id={id} />;
}
