// apps/player/src/app/(portal)/storyweaver/campaigns/new/page.tsx
import CampaignCreateView from "@/views/storyweaver/campaignCreate/CampaignCreate.view";

export const metadata = {
  title: "Tapestry TTRPG - Create Campaign",
  description: "Create a new Storyweaver campaign",
};

export default function NewCampaignPage() {
  return <CampaignCreateView />;
}
