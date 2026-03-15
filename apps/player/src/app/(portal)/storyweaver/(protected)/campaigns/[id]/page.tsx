// apps/player/src/app/(portal)/storyweaver/campaigns/[id]/page.tsx
import CampaignBoardScreen from "@/features/storweaver/campaignBoardScreen/CampaignBoardScreen";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata = {
  title: "Campaign Board",
};

export default async function CampaignByIdPage({ params }: PageProps) {
  const { id } = await params;
  return <CampaignBoardScreen campaignId={id} />;
}
