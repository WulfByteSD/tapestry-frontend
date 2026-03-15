import type { CampaignMember } from "@tapestry/types";
import { Avatar } from "@tapestry/ui";
import { FaEllipsisV } from "react-icons/fa";
import styles from "./RosterTab.module.scss";

type Props = {
  member: CampaignMember;
  isArchived: boolean;
};

function formatDate(date?: Date | string): string {
  if (!date) return "Unknown";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getRoleBadgeClass(role: string): string {
  switch (role) {
    case "sw":
    case "co-sw":
      return styles.badgeSW;
    case "player":
      return styles.badgePlayer;
    case "observer":
      return styles.badgeObserver;
    default:
      return styles.badge;
  }
}

function getRoleLabel(role: string): string {
  switch (role) {
    case "sw":
      return "Storyweaver";
    case "co-sw":
      return "Co-Storyweaver";
    case "player":
      return "Player";
    case "observer":
      return "Observer";
    default:
      return role;
  }
}

export function MemberCard({ member, isArchived }: Props) {
  return (
    <div className={styles.memberCard}>
      <div className={styles.memberInfo}>
        <Avatar src={member.player?.avatar} name={member.nickname || member.player?.displayName} size="md" />
        <div className={styles.memberDetails}>
          <div className={styles.memberName}>{member.nickname || member.player?.displayName || "Unknown"}</div>
          <div className={styles.memberMeta}>
            <span className={getRoleBadgeClass(member.role)}>{getRoleLabel(member.role)}</span>
            <span className={styles.joinDate}>Joined {formatDate(member.joinedAt)}</span>
          </div>
        </div>
      </div>
      {!isArchived && (
        <button className={styles.actionButton} disabled title="Member actions (coming soon)">
          <FaEllipsisV />
        </button>
      )}
    </div>
  );
}
