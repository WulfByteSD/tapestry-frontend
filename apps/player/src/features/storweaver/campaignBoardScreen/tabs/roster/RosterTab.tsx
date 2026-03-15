import type { CampaignType } from "@tapestry/types";
import styles from "./RosterTab.module.scss";
import { FaEllipsisV } from "react-icons/fa";

type Props = {
  campaign: CampaignType & { _id: string };
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

export function RosterTab({ campaign, isArchived }: Props) {
  const members = campaign.members || [];

  if (members.length === 0) {
    return (
      <div className={styles.empty}>
        <h3>No members yet</h3>
        <p>Once players join this campaign, they'll appear here.</p>
      </div>
    );
  }

  // Group members by role
  const storyweavers = members.filter((m) => m.role === "sw" || m.role === "co-sw");
  const players = members.filter((m) => m.role === "player");
  const observers = members.filter((m) => m.role === "observer");

  return (
    <div className={styles.container}>
      <div className={styles.summary}>
        <strong>{members.length}</strong> {members.length === 1 ? "member" : "members"}
      </div>

      {storyweavers.length > 0 && (
        <section className={styles.group}>
          <h4 className={styles.groupTitle}>Storyweavers</h4>
          <div className={styles.list}>
            {storyweavers.map((member, idx) => (
              <div key={`${member.player}-${idx}`} className={styles.memberCard}>
                <div className={styles.memberInfo}>
                  <div className={styles.memberAvatar}>{String(member.player || "?")[0].toUpperCase()}</div>
                  <div className={styles.memberDetails}>
                    <div className={styles.memberName}>{member.nickname || member.player || "Unknown"}</div>
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
            ))}
          </div>
        </section>
      )}

      {players.length > 0 && (
        <section className={styles.group}>
          <h4 className={styles.groupTitle}>Players</h4>
          <div className={styles.list}>
            {players.map((member, idx) => (
              <div key={`${member.player}-${idx}`} className={styles.memberCard}>
                <div className={styles.memberInfo}>
                  <div className={styles.memberAvatar}>{String(member.player || "?")[0].toUpperCase()}</div>
                  <div className={styles.memberDetails}>
                    <div className={styles.memberName}>{member.nickname || member.player || "Unknown"}</div>
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
            ))}
          </div>
        </section>
      )}

      {observers.length > 0 && (
        <section className={styles.group}>
          <h4 className={styles.groupTitle}>Observers</h4>
          <div className={styles.list}>
            {observers.map((member, idx) => (
              <div key={`${member.player}-${idx}`} className={styles.memberCard}>
                <div className={styles.memberInfo}>
                  <div className={styles.memberAvatar}>{String(member.player || "?")[0].toUpperCase()}</div>
                  <div className={styles.memberDetails}>
                    <div className={styles.memberName}>{member.nickname || member.player || "Unknown"}</div>
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
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
