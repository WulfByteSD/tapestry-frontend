"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { AlertContainer, Header, Sidebar, type SidebarGroup } from "@tapestry/ui";
import { useProfile } from "@tapestry/hooks";
import type { PlayerType } from "@tapestry/types";
import Image from "next/image";
import { BiHome, BiFile, BiCog } from "react-icons/bi";
import { GiDiceTarget } from "react-icons/gi";
import styles from "./PortalDesktop.module.scss";
import { api } from "@/lib/api";
import { useMe, useLogout } from "@/lib/auth-hooks";

type Props = {
  children: React.ReactNode;
};

const sidebarGroups: SidebarGroup[] = [
  {
    title: "Main",
    links: [{ href: "/", label: "Home", icon: <BiHome /> }],
  },
  {
    title: "Gameplay",
    links: [{ href: "/rolls", label: "Rolls", icon: <GiDiceTarget /> }],
  },
  {
    title: "Account",
    links: [{ href: "/settings", label: "Settings", icon: <BiCog /> }],
  },
];

export default function PortalDesktop({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: me } = useMe();
  const { selectedProfile: profile } = useProfile<PlayerType>(api, me, "player");
  const logout = useLogout();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={styles.shell}>
      <Sidebar
        title="Tapestry TTRPG | Player Portal"
        groups={sidebarGroups}
        currentPath={pathname}
        LinkComponent={Link}
        logo={
          <Image
            src="https://res.cloudinary.com/dmc7wmarf/image/upload/v1771775270/ChatGPT_Image_Jan_10_2026_11_32_39_AM_-_Copy_bcpc4f.png"
            alt="Tapestry Logo"
            width={75}
            height={75}
          />
        }
        footer={
          <div>
            <div>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>Tapestry</p>
              <p style={{ margin: 0, fontSize: "11px", opacity: 0.6 }}>v1.0.0</p>
            </div>
          </div>
        }
      />
      <div className={styles.contentArea}>
        <Header
          user={
            profile?.displayName
              ? {
                  fullName: profile.displayName,
                  profileImageUrl: profile.avatar,
                }
              : undefined
          }
          onLogout={handleLogout}
          showMenuToggle={false}
          avatarSize="md"
          className={styles.header}
        />
        <main className={styles.main}>
          <AlertContainer position="top-right" />
          {children}
          <div className={styles.watermark} />
        </main>
      </div>
    </div>
  );
}
