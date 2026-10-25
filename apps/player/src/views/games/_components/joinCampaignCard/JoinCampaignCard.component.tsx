'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TextAreaField, SelectField, Button } from '@tapestry/ui';
import { api } from '@/lib/api';
import { useMyJoinRequests } from '@/lib/campaign-hooks';
import type { CampaignMember } from '@tapestry/types';
import styles from './JoinCampaignCard.module.scss';

type JoinPolicy = 'open' | 'request' | 'invite-only';

type Props = {
  gameId: string;
  joinPolicy: JoinPolicy;
  members: CampaignMember[];
  currentUserProfileId?: string;
};

export default function JoinCampaignCard({ gameId, joinPolicy, members, currentUserProfileId }: Props) {
  const queryClient = useQueryClient();
  const [requestMessage, setRequestMessage] = useState('');
  const [preferredRole, setPreferredRole] = useState<'player' | 'observer'>('player');
  const userMember = currentUserProfileId
    ? members.find((member) => (typeof member.player === 'string' ? member.player === currentUserProfileId : member.player._id === currentUserProfileId))
    : undefined;
  const isMember = Boolean(userMember);
  const { data: joinRequestsResponse } = useMyJoinRequests(!isMember && joinPolicy === 'request');
  const pendingRequest = !isMember ? joinRequestsResponse?.payload?.find((req) => req.campaign === gameId && req.status === 'pending') : undefined;

  const joinMutation = useMutation({
    mutationFn: async () => {
      if (joinPolicy === 'open') {
        await api.post(`/game/campaigns/${gameId}/join`, { role: preferredRole });
      } else {
        const payload: { role: string; message?: string } = { role: preferredRole };
        if (requestMessage.trim()) payload.message = requestMessage.trim();
        await api.post(`/game/campaigns/${gameId}/join-requests`, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', gameId] });
      queryClient.invalidateQueries({ queryKey: ['my-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['my-join-requests'] });
    },
  });

  if (isMember) {
    return (
      <section className={`${styles.joinCard} ${styles.memberCard}`} aria-labelledby="participation-heading">
        <div className={styles.joinCardTop}>
          <h2 id="participation-heading">Your place at the table</h2>
          <p>
            You’re part of this campaign as a{' '}
            <strong>{userMember?.role === 'sw' ? 'Storyweaver' : userMember?.role === 'co-sw' ? 'Co-Storyweaver' : userMember?.role === 'observer' ? 'Observer' : 'Player'}</strong>.
          </p>
        </div>
        <Link href={`/games/${gameId}/board`} className={styles.boardLink}>Go to Game Board</Link>
      </section>
    );
  }

  if (pendingRequest) {
    return (
      <section className={styles.joinCard} aria-labelledby="participation-heading">
        <div className={styles.joinCardTop}>
          <h2 id="participation-heading">Request pending</h2>
          <p>Your request to join as a <strong>{pendingRequest.preferredRole === 'observer' ? 'Observer' : 'Player'}</strong> is awaiting approval from the Storyweaver.</p>
        </div>
        {pendingRequest.message ? (
          <div className={styles.requestMessage}>
            <p className={styles.messageLabel}>Your message</p>
            <p className={styles.messageText}>{pendingRequest.message}</p>
          </div>
        ) : null}
      </section>
    );
  }

  if (joinPolicy === 'invite-only') {
    return (
      <section className={styles.joinCard} aria-labelledby="participation-heading">
        <div className={styles.joinCardTop}>
          <h2 id="participation-heading">Join the table</h2>
          <p>You’ll need an invite code from the Storyweaver to join this campaign.</p>
        </div>
      </section>
    );
  }

  const isOpen = joinPolicy === 'open';

  return (
    <section className={styles.joinCard} aria-labelledby="participation-heading">
      <div className={styles.joinCardTop}>
        <h2 id="participation-heading">{isOpen ? 'Join this campaign' : 'Request to join'}</h2>
        <p>{isOpen ? 'Choose your role and join the adventure.' : 'Introduce yourself and send a request to the Storyweaver.'}</p>
      </div>
      <SelectField
        label="Preferred role"
        value={preferredRole}
        onChange={(event) => setPreferredRole(event.target.value as 'player' | 'observer')}
        disabled={joinMutation.isPending}
      >
        <option value="player">Player</option>
        <option value="observer">Observer</option>
      </SelectField>
      {!isOpen ? (
        <TextAreaField
          id="join-request-message"
          label="Message to Storyweaver (optional)"
          value={requestMessage}
          onChange={(event) => setRequestMessage(event.target.value)}
          placeholder="What draws you to this campaign?"
          rows={4}
          disabled={joinMutation.isPending}
          maxLength={500}
          helpText={`${requestMessage.length} / 500 characters`}
        />
      ) : null}
      <Button type="button" tone="gold" fullWidth isLoading={joinMutation.isPending} className={styles.joinButton} onClick={() => joinMutation.mutate()}>
        {joinMutation.isPending ? (isOpen ? 'Joining...' : 'Submitting...') : (isOpen ? 'Join Campaign' : 'Request to Join')}
      </Button>
      {joinMutation.isError ? (
        <p className={styles.feedback} role="alert">{isOpen ? 'We couldn’t join this campaign.' : 'Your join request could not be sent.'} Please try again.</p>
      ) : null}
      {joinMutation.isSuccess ? (
        <p className={styles.feedback} role="status">{isOpen ? 'You’ve joined the campaign. Your membership is updating.' : 'Your request has been sent to the Storyweaver for review.'}</p>
      ) : null}
    </section>
  );
}
