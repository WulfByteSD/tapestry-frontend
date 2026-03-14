import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campaigns | Storyweaver",
  description: "Manage your campaigns as a Storyweaver",
};

export default function CampaignsPage() {
  return (
    <div>
      <h1>My Campaigns</h1>
      <p>Manage and create campaigns as a Storyweaver.</p>
      {/* TODO: Implement campaign list and management */}
    </div>
  );
}
