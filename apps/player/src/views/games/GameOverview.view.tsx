'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Avatar } from '@tapestry/ui';
import { useCampaign } from '@/lib/campaign-hooks';
import type { CampaignType, CampaignMember, CampaignRole } from '@tapestry/types';
import JoinCampaignCard from '@/views/games/_components/joinCampaignCard/JoinCampaignCard.component';
import styles from './GameOverview.module.scss';
import Image from 'next/image';

type Props = {
  gameId: string;
};

type MembersByRole = {
  sw: CampaignMember[];
  'co-sw': CampaignMember[];
  player: CampaignMember[];
  observer: CampaignMember[];
};

function truncateWords(text: string, maxWords: number): { truncated: string; isTruncated: boolean } {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) {
    return { truncated: text, isTruncated: false };
  }
  return {
    truncated: words.slice(0, maxWords).join(' ') + '...',
    isTruncated: true,
  };
}

function groupMembersByRole(members: CampaignMember[]): MembersByRole {
  const grouped: MembersByRole = {
    sw: [],
    'co-sw': [],
    player: [],
    observer: [],
  };

  members.forEach((member) => {
    grouped[member.role].push(member);
  });

  return grouped;
}

export default function GameOverviewView({ gameId }: Props) {
  const [notesExpanded, setNotesExpanded] = useState(false);

  const { data, isLoading, isError } = useCampaign(gameId);
  const campaign = data?.payload as CampaignType | undefined;

  // Compute derived values (must be before early returns to satisfy Rules of Hooks)
  const playerCount = campaign?.members?.length ?? 0;
  const maxPlayers = (campaign as any)?.maxPlayers ?? null;
  const settingLabel = campaign?.settingKey ?? 'No setting';
  const joinPolicyLabel = campaign?.discoverable ? 'Open to discovery' : 'Private';
  const joinPolicy = (campaign as any)?.joinPolicy ?? 'invite-only';
  const capacityLabel = maxPlayers ? `${playerCount} / ${maxPlayers}` : `${playerCount}`;

  const membersByRole = useMemo(() => groupMembersByRole(campaign?.members ?? []), [campaign?.members]);

  const storyweaver = useMemo(() => {
    return membersByRole.sw[0]?.player ?? null;
  }, [membersByRole]);

  const notesContent = useMemo(() => {
    const text = campaign?.notes ?? '';
    if (!text) return { truncated: 'No campaign pitch has been written yet.', isTruncated: false };
    return truncateWords(text, 50);
  }, [campaign?.notes]);

  if (isLoading) {
    return (
      <div className={styles.stateCard}>
        <h1>Loading game...</h1>
        <p>Pulling the campaign overview together.</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className={styles.stateCard}>
        <h1>Game not found</h1>
        <p>That campaign either moved, vanished, or never existed in the first place.</p>
        <Link href="/games" className={styles.backLink}>
          Back to games
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Link href="/games" className={styles.backLink}>
        ← Back to games
      </Link>

      {isError ? <div className={styles.notice}>Live detail fetch failed, so this page is using placeholder data while you build the frontend.</div> : null}

      <section className={styles.hero}>
        {campaign.avatar ? <Image src={campaign.avatar} alt={campaign.name} width={460} height={460} className={styles.heroAvatar} /> : null}
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Campaign Overview</p>
          <h1 className={styles.title}>{campaign.name}</h1>

          <div className={styles.metaRow}>
            <span className={styles.pill}>
              <span className={styles.pillLabel}>Setting</span>
              <span className={styles.pillValue}>{settingLabel}</span>
            </span>
            <span className={styles.pill}>
              <span className={styles.pillLabel}>Players</span>
              <span className={styles.pillValue}>{capacityLabel}</span>
            </span>
            <span className={styles.pill}>
              <span className={styles.pillLabel}>Join Policy</span>
              <span className={styles.pillValue}>{joinPolicy === 'open' ? 'Open' : joinPolicy === 'request' ? 'Request' : 'Invite Only'}</span>
            </span>
          </div>
        </div>
      </section>

      <div className={styles.grid}>
        <main className={styles.mainColumn}>
          <section className={styles.panel}>
            <h2>About this campaign</h2>
            <div className={notesExpanded ? styles.scrollableContent : undefined}>
              <p className={styles.panelText}>{notesExpanded ? campaign.notes : notesContent.truncated}</p>
            </div>
            {notesContent.isTruncated ? (
              <button type="button" className={styles.expandButton} onClick={() => setNotesExpanded(!notesExpanded)}>
                {notesExpanded ? 'Show less' : 'Read more'}
              </button>
            ) : null}
          </section>

          {storyweaver ? (
            <section className={styles.storyweaverCard}>
              <h2>Storyweaver</h2>
              <div className={styles.storyweaverContent}>
                <Avatar src={storyweaver.avatar ?? null} name={storyweaver.displayName ?? 'Unknown'} size="lg" className={styles.storyweaverAvatar} />
                <div className={styles.storyweaverInfo}>
                  <h3 className={styles.storyweaverName}>{storyweaver.displayName ?? 'Unknown Storyweaver'}</h3>
                  {storyweaver.bio ? <p className={styles.storyweaverBio}>{storyweaver.bio}</p> : null}
                </div>
              </div>
            </section>
          ) : null}

          <section className={styles.panel}>
            <h2>Campaign Members</h2>
            <div className={styles.membersGrid}>
              {membersByRole.player.length > 0 ? (
                <div className={styles.memberRoleSection}>
                  <h3 className={styles.memberRoleTitle}>Players</h3>
                  <div className={styles.memberAvatarRow}>
                    {membersByRole.player.slice(0, 4).map((member) => (
                      <Avatar key={member.player._id} src={member.player.avatar ?? null} name={member.player.displayName ?? 'Player'} size="md" className={styles.memberAvatar} />
                    ))}
                    {membersByRole.player.length > 4 ? <span className={styles.memberOverflow}>+ {membersByRole.player.length - 4} others</span> : null}
                  </div>
                </div>
              ) : null}

              {membersByRole['co-sw'].length > 0 ? (
                <div className={styles.memberRoleSection}>
                  <h3 className={styles.memberRoleTitle}>Co-Storyweavers</h3>
                  <div className={styles.memberAvatarRow}>
                    {membersByRole['co-sw'].slice(0, 4).map((member) => (
                      <Avatar key={member.player._id} src={member.player.avatar ?? null} name={member.player.displayName ?? 'Co-SW'} size="md" className={styles.memberAvatar} />
                    ))}
                    {membersByRole['co-sw'].length > 4 ? <span className={styles.memberOverflow}>+ {membersByRole['co-sw'].length - 4} others</span> : null}
                  </div>
                </div>
              ) : null}

              {membersByRole.observer.length > 0 ? (
                <div className={styles.memberRoleSection}>
                  <h3 className={styles.memberRoleTitle}>Observers</h3>
                  <div className={styles.memberAvatarRow}>
                    {membersByRole.observer.slice(0, 4).map((member) => (
                      <Avatar key={member.player._id} src={member.player.avatar ?? null} name={member.player.displayName ?? 'Observer'} size="md" className={styles.memberAvatar} />
                    ))}
                    {membersByRole.observer.length > 4 ? <span className={styles.memberOverflow}>+ {membersByRole.observer.length - 4} others</span> : null}
                  </div>
                </div>
              ) : null}

              {membersByRole.player.length === 0 && membersByRole['co-sw'].length === 0 && membersByRole.observer.length === 0 ? (
                <p className={styles.emptyMembers}>No members yet. Be the first to join!</p>
              ) : null}
            </div>
          </section>

          {campaign.tableExpectations ? (
            <section className={styles.expectationsPanel}>
              <div className={styles.expectationsHeader}>
                <h2>Table Expectations</h2>
                <span className={styles.expectationsIcon}>📋</span>
              </div>
              <div className={styles.scrollableContent}>
                <p className={styles.expectationsText}>{campaign.tableExpectations}</p>
              </div>
            </section>
          ) : null}

          <section className={styles.panel}>
            <h2>Tone & Atmosphere</h2>
            <div className={styles.chipRow}>
              {campaign.toneModules && campaign.toneModules.length > 0 ? (
                campaign.toneModules.map((tone) => (
                  <span key={tone} className={styles.chip}>
                    {tone}
                  </span>
                ))
              ) : (
                <span className={styles.empty}>No tone modules listed yet</span>
              )}
            </div>
          </section>
        </main>

        <aside className={styles.sideColumn}>
          <JoinCampaignCard gameId={gameId} joinPolicy={joinPolicy as 'open' | 'request' | 'invite-only'} />

          <section className={styles.panel}>
            <h2>Campaign Details</h2>
            <dl className={styles.detailList}>
              <div className={styles.detailItem}>
                <dt>Status</dt>
                <dd className={styles[`status_${campaign.status}`]}>{campaign.status ?? 'active'}</dd>
              </div>
              <div className={styles.detailItem}>
                <dt>Current Players</dt>
                <dd>{capacityLabel} players</dd>
              </div>
              <div className={styles.detailItem}>
                <dt>Setting</dt>
                <dd>{settingLabel}</dd>
              </div>
              <div className={styles.detailItem}>
                <dt>Join Policy</dt>
                <dd>{joinPolicy === 'open' ? 'Open to all' : joinPolicy === 'request' ? 'Approval required' : 'Invite only'}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
