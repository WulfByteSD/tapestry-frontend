import BecomeStoryweaverView from "@/views/storyweaver/become/BecomeStoryweaver.view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a Storyweaver | Tapestry TTRPG",
  description:
    "Join Tapestry as a Storyweaver and craft epic adventures for your players. Create immersive campaigns and bring your stories to life.",
};

export default function BecomeStoryweaverPage() {
  return <BecomeStoryweaverView />;
}
