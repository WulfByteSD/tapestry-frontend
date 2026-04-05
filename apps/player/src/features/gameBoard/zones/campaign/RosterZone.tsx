import type { CampaignType } from '@tapestry/types';
import { useMe } from '@/lib/auth-hooks';
import { useProfile } from '@tapestry/hooks';
import { api } from '@/lib/api';
import { MemberCard } from './roster/MemberCard';
import styles from './RosterZone.module.scss';

type Props = {
  campaign: CampaignType & { _id: string };
  isSW: boolean;
  currentUserId: string;
  isArchived: boolean;
};

export default function RosterZone({ campaign, isSW, currentUserId, isArchived }: Props) {
  const { data: currentUser } = useMe();
  const { data: playerProfile } = useProfile(api, currentUser, 'player');
  const members = campaign.members || [];

  // Find current user's role in this campaign
  const currentMember = members.find((m) => m.player._id === playerProfile?.payload._id);
  const currentUserRole = (currentMember?.role || 'observer') as 'sw' | 'co-sw' | 'player' | 'observer';

  if (members.length === 0) {
    return (
      <div className={styles.empty}>
        <h3>No members yet</h3>
        <p>Once players join this campaign, they'll appear here.</p>
      </div>
    );
  }

  // Group members by role
  const storyweavers = members.filter((m) => m.role === 'sw' || m.role === 'co-sw');
  const players = members.filter((m) => m.role === 'player');
  const observers = members.filter((m) => m.role === 'observer');

  return (
    <div className={styles.container}>
      <div className={styles.summary}>
        <strong>{members.length}</strong> {members.length === 1 ? 'member' : 'members'}
      </div>

      {storyweavers.length > 0 && (
        <section className={styles.group}>
          <h4 className={styles.groupTitle}>Storyweavers</h4>
          <div className={styles.list}>
            {storyweavers.map((member, idx) => (
              <MemberCard
                key={`${member.player}-${idx}`}
                member={member}
                isArchived={isArchived}
                campaignId={campaign._id}
                currentUserRole={currentUserRole}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        </section>
      )}

      {players.length > 0 && (
        <section className={styles.group}>
          <h4 className={styles.groupTitle}>Players</h4>
          <div className={styles.list}>
            {players.map((member, idx) => (
              <MemberCard
                key={`${member.player}-${idx}`}
                member={member}
                isArchived={isArchived}
                campaignId={campaign._id}
                currentUserRole={currentUserRole}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        </section>
      )}

      {observers.length > 0 && (
        <section className={styles.group}>
          <h4 className={styles.groupTitle}>Observers</h4>
          <div className={styles.list}>
            {observers.map((member, idx) => (
              <MemberCard
                key={`${member.player}-${idx}`}
                member={member}
                isArchived={isArchived}
                campaignId={campaign._id}
                currentUserRole={currentUserRole}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
