'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { Avatar, Button, Loader } from '@tapestry/ui';
import { useProfile } from '@tapestry/hooks';
import { useCampaign } from '@/lib/campaign-hooks';
import { useMe } from '@/lib/auth-hooks';
import { api } from '@/lib/api';
import type { CampaignType, CampaignMember, CampaignRole, PlayerType } from '@tapestry/types';
import JoinCampaignCard from '@/views/games/_components/joinCampaignCard/JoinCampaignCard.component';
import { NoteBody, noteBodyText } from '@/features/characters/noteContent';
import styles from './GameOverview.module.scss';

type Props = { gameId: string };

// Preserve the existing optional response fields and defaults locally.
type OverviewCampaign = CampaignType & {
  maxPlayers?: number | null;
  joinPolicy?: 'open' | 'request' | 'invite-only';
};

type MembersByRole = Record<CampaignRole, CampaignMember[]>;

const memberGroups = [
  { role: 'player', label: 'Players', fallback: 'Player' },
  { role: 'co-sw', label: 'Co-Storyweavers', fallback: 'Co-Storyweaver' },
  { role: 'observer', label: 'Observers', fallback: 'Observer' },
] as const;

function truncateWords(text: string, maxWords: number): { truncated: string; isTruncated: boolean } {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return { truncated: text, isTruncated: false };
  return { truncated: words.slice(0, maxWords).join(' ') + '...', isTruncated: true };
}

function truncateCharacters(text: string, maxCharacters: number): { truncated: string; isTruncated: boolean } {
  const characters = Array.from(text);
  if (characters.length <= maxCharacters) return { truncated: text, isTruncated: false };
  return { truncated: characters.slice(0, maxCharacters).join('').trimEnd() + '…', isTruncated: true };
}

function groupMembersByRole(members: CampaignMember[]): MembersByRole {
  const grouped: MembersByRole = { sw: [], 'co-sw': [], player: [], observer: [] };
  members.forEach((member) => grouped[member.role].push(member));
  return grouped;
}

export default function GameOverviewView({ gameId }: Props) {
  const [notesExpanded, setNotesExpanded] = useState(false);
  const descriptionDialogRef = useRef<HTMLDialogElement>(null);
  const descriptionTriggerRef = useRef<HTMLButtonElement>(null);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [expectationsExpanded, setExpectationsExpanded] = useState(false);
  const { data, isLoading, isError } = useCampaign(gameId);
  const campaign = data?.payload as OverviewCampaign | undefined;
  const { data: me } = useMe();
  const { selectedProfile: profile } = useProfile<PlayerType>(api, me, 'player');

  const memberCount = campaign?.members?.length ?? 0;
  const maxPlayers = campaign?.maxPlayers ?? null;
  const capacityLabel = maxPlayers ? `${memberCount} / ${maxPlayers}` : `${memberCount}`;
  const joinPolicy = campaign?.joinPolicy ?? 'invite-only';
  const isMember = Boolean(profile?._id && campaign?.members?.some((member) => (typeof member.player === 'string' ? member.player === profile._id : member.player._id === profile._id)));
  const membersByRole = useMemo(() => groupMembersByRole(campaign?.members ?? []), [campaign?.members]);
  const storyweaver = membersByRole.sw[0]?.player;
  const visibleNotes = noteBodyText(campaign?.notes ?? '');
  const notesBody = visibleNotes.trim() ? campaign?.notes ?? '' : 'No campaign pitch has been written yet.';
  const notesText = visibleNotes.trim() ? visibleNotes : notesBody;
  const notesContent = truncateCharacters(notesText.replace(/\s+/g, ' ').trim(), 150);
  // Empty rich-text blocks can still consume space even when their visible text is short.
  const notesBlockCount = notesBody.match(/<(?:p|h[1-6]|li|blockquote|br|hr)\b/gi)?.length ?? 0;
  const notesNeedDialog = Array.from(notesText).length > 450 || notesText.split(/\r\n|\r|\n/).length > 4 || notesBlockCount > 4;
  const bioContent = truncateWords(storyweaver?.bio ?? '', 35);
  const expectationsText = noteBodyText(campaign?.tableExpectations ?? '');
  const expectationsContent = truncateWords(expectationsText, 60);

  if (isLoading) {
    return (
      <div className={styles.stateCard}>
        <Loader size="lg" tone="gold" label="Loading game..." caption="Gathering the campaign details." />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className={styles.stateCard}>
        <h1>{isError ? 'Unable to load this game' : 'Game not found'}</h1>
        <p>{isError ? 'The campaign details could not be loaded. Please try again.' : 'This campaign is unavailable or no longer exists.'}</p>
        <Link href="/games" className={styles.backLink}>Back to games</Link>
      </div>
    );
  }

  const participation = (
    <div id="participation" tabIndex={-1} className={isMember ? styles.memberParticipation : styles.participation}>
      <JoinCampaignCard gameId={gameId} joinPolicy={joinPolicy} members={campaign.members || []} currentUserProfileId={profile?._id} />
    </div>
  );

  const campaignDetails = (
    <section className={styles.section} aria-labelledby="campaign-table-heading">
      <h2 id="campaign-table-heading">At this table</h2>
      <section className={styles.subsection} aria-labelledby="campaign-tones-heading">
        <h3 id="campaign-tones-heading">Tone Modules</h3>
        {campaign.toneModules?.length ? (
          <ul className={styles.toneList}>
            {campaign.toneModules.map((tone) => <li key={tone}>{tone}</li>)}
          </ul>
        ) : <p className={styles.empty}>No Tone Modules listed yet.</p>}
      </section>
      {expectationsText.trim() ? (
        <section className={styles.subsection} aria-labelledby="campaign-expectations-heading">
          <h3 id="campaign-expectations-heading">Table expectations</h3>
          <div id="campaign-expectations" className={`${styles.prose} ${styles.richProse}`}>
            {expectationsExpanded || !expectationsContent.isTruncated ? <NoteBody body={campaign.tableExpectations ?? ''} /> : expectationsContent.truncated}
          </div>
          {expectationsContent.isTruncated ? (
            <button type="button" className={styles.expandButton} aria-expanded={expectationsExpanded} aria-controls="campaign-expectations" onClick={() => setExpectationsExpanded(!expectationsExpanded)}>
              {expectationsExpanded ? 'Show less' : 'Read more'}
            </button>
          ) : null}
        </section>
      ) : null}
    </section>
  );

  const people = (
    <section className={`${styles.section} ${styles.people}`} aria-labelledby="campaign-people-heading">
      <h2 id="campaign-people-heading">People at the table</h2>
      {storyweaver ? (
        <div className={styles.storyweaver}>
          <Avatar src={storyweaver.avatar ?? null} name={storyweaver.displayName ?? 'Storyweaver'} size="lg" />
          <div className={styles.personDetails}>
            <h3 className={styles.roleTitle}>Storyweaver</h3>
            <p className={styles.personName}>{storyweaver.displayName ?? 'Unknown Storyweaver'}</p>
            {storyweaver.bio ? (
              <>
                <p id="storyweaver-bio" className={styles.prose}>{bioExpanded ? storyweaver.bio : bioContent.truncated}</p>
                {bioContent.isTruncated ? (
                  <button type="button" className={styles.expandButton} aria-expanded={bioExpanded} aria-controls="storyweaver-bio" onClick={() => setBioExpanded(!bioExpanded)}>
                    {bioExpanded ? 'Show less' : 'Read more'}
                  </button>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      ) : null}
      {memberGroups.map(({ role, label, fallback }) => membersByRole[role].length > 0 ? (
        <div className={styles.memberGroup} key={role}>
          <h3 className={styles.roleTitle}>{label}</h3>
          <ul className={styles.memberList}>
            {membersByRole[role].slice(0, 4).map((member) => (
              <li key={member.player._id} className={styles.member}>
                <Avatar src={member.player.avatar ?? null} name={member.player.displayName ?? fallback} size="md" />
                <span>{member.player.displayName ?? fallback}</span>
              </li>
            ))}
          </ul>
          {membersByRole[role].length > 4 ? <p className={styles.empty}>+ {membersByRole[role].length - 4} others</p> : null}
        </div>
      ) : null)}
      {memberCount === 0 ? <p className={styles.empty}>No members listed yet.</p> : null}
    </section>
  );

  return (
    <div className={styles.page}>
      <Link href="/games" className={styles.backLink}>← Back to games</Link>
      {isError ? <p className={styles.notice} role="status">We couldn’t refresh this campaign. The details below may be out of date.</p> : null}
      <header className={`${styles.identity} ${!campaign.avatar ? styles.identityWithoutArtwork : ''}`}>
        {campaign.avatar ? (
          <div className={styles.artworkFrame}>
            <Image src={campaign.avatar} alt="" width={1200} height={1200} sizes="(max-width: 700px) 100vw, 33vw" className={styles.artwork} />
          </div>
        ) : null}
        <div className={styles.identityContent}>
          <p className={styles.eyebrow}>Campaign</p>
          <h1 className={styles.title}>{campaign.name}</h1>
          <dl className={styles.facts}>
            <div><dt>Setting</dt><dd>{campaign.settingKey ?? 'No setting'}</dd></div>
            <div><dt>Members</dt><dd>{capacityLabel}</dd></div>
            <div><dt>Status</dt><dd className={styles.status}>{campaign.status ?? 'active'}</dd></div>
            <div><dt>Joining</dt><dd>{joinPolicy === 'open' ? 'Open to all' : joinPolicy === 'request' ? 'Approval required' : 'Invite only'}</dd></div>
          </dl>
          <section className={styles.pitch} aria-labelledby="campaign-pitch-heading">
            <h2 id="campaign-pitch-heading">About this campaign</h2>
            <div id="campaign-pitch" className={`${styles.prose} ${styles.richProse}`}>
              {!notesNeedDialog && (notesExpanded || !notesContent.isTruncated) ? <NoteBody body={notesBody} /> : notesContent.truncated}
            </div>
            {notesNeedDialog ? (
              <button
                ref={descriptionTriggerRef}
                type="button"
                className={styles.expandButton}
                aria-haspopup="dialog"
                aria-controls="campaign-description-dialog"
                onClick={() => descriptionDialogRef.current?.showModal()}
              >
                Read full description
              </button>
            ) : notesContent.isTruncated ? (
              <button type="button" className={styles.expandButton} aria-expanded={notesExpanded} aria-controls="campaign-pitch" onClick={() => setNotesExpanded(!notesExpanded)}>
                {notesExpanded ? 'Show less' : 'Read more'}
              </button>
            ) : null}
          </section>
          {!isMember ? (
            <a href="#participation" className={styles.joinShortcut} onClick={() => document.getElementById('participation')?.focus()}>
              {joinPolicy === 'open' ? 'Join this campaign' : joinPolicy === 'request' ? 'Request to join' : 'How to join'}
              <span aria-hidden="true"> ↓</span>
            </a>
          ) : null}
        </div>
      </header>
      {notesNeedDialog ? (
        <dialog
          ref={descriptionDialogRef}
          id="campaign-description-dialog"
          className={styles.readerDialog}
          aria-labelledby="campaign-description-title"
          onClose={() => descriptionTriggerRef.current?.focus()}
        >
          <div className={styles.readerHeader}>
            <div>
              <p className={styles.eyebrow}>About this campaign</p>
              <h2 id="campaign-description-title">{campaign.name}</h2>
            </div>
            <Button type="button" variant="outline" tone="gold" autoFocus onClick={() => descriptionDialogRef.current?.close()}>
              Close
            </Button>
          </div>
          <div className={styles.readerBody} tabIndex={0} role="region" aria-label="Campaign description">
            <div className={`${styles.prose} ${styles.richProse}`}><NoteBody body={notesBody} /></div>
          </div>
        </dialog>
      ) : null}
      {isMember ? (
        <>
          {participation}
          <div className={styles.memberContent}>{campaignDetails}{people}</div>
        </>
      ) : (
        <div className={styles.overviewGrid}>{campaignDetails}{participation}{people}</div>
      )}
    </div>
  );
}
