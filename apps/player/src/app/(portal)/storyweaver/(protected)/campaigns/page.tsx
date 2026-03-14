import { Metadata } from "next";
import CampaignsView from "@/views/storyweaver/campaigns/Campaigns.view";

export const metadata: Metadata = {
  title: "Campaigns | Storyweaver",
  description: "Manage your campaigns as a Storyweaver",
};

export default function CampaignsPage() {
  return <CampaignsView />;
}