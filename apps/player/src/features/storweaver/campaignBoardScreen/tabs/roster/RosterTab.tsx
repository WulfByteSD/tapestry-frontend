import type { CampaignType } from "@tapestry/types";
import styles from "./RosterTab.module.scss";
import { MemberCard } from "./MemberCard";

type Props = {
  campaign: CampaignType & { _id: string };
  isArchived: boolean;
};

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
              <MemberCard key={`${member.player}-${idx}`} member={member} isArchived={isArchived} />
            ))}
          </div>
        </section>
      )}

      {players.length > 0 && (
        <section className={styles.group}>
          <h4 className={styles.groupTitle}>Players</h4>
          <div className={styles.list}>
            {players.map((member, idx) => (
              <MemberCard key={`${member.player}-${idx}`} member={member} isArchived={isArchived} />
            ))}
          </div>
        </section>
      )}

      {observers.length > 0 && (
        <section className={styles.group}>
          <h4 className={styles.groupTitle}>Observers</h4>
          <div className={styles.list}>
            {observers.map((member, idx) => (
              <MemberCard key={`${member.player}-${idx}`} member={member} isArchived={isArchived} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
