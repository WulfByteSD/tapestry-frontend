import { BiHome, BiFile, BiCog } from "react-icons/bi";
import { GiDiceTarget } from "react-icons/gi";
import type { SidebarGroup } from "@tapestry/ui";
import type { PlayerType } from "@tapestry/types";

interface SidebarLinksProps {
  profile?: PlayerType | null;
}

export function getSidebarLinks({ profile }: SidebarLinksProps): SidebarGroup[] {
  // Check if user has storyweaver role
  const hasStoryweaverRole = profile?.roles?.includes("storyweaver") ?? false;
  const storyweaverHref = hasStoryweaverRole ? "/storyweaver/campaigns" : "/storyweaver/become";

  return [
    {
      title: "Main",
      links: [{ href: "/", label: "Home", icon: <BiHome /> }],
    },
    {
      title: "Gameplay",
      links: [
        { href: "/games", label: "Games", icon: <GiDiceTarget /> },
        { href: storyweaverHref, label: "Storyweaver", icon: <BiFile /> },
      ],
    },
    {
      title: "Account",
      links: [{ href: "/settings", label: "Settings", icon: <BiCog /> }],
    },
  ];
}
