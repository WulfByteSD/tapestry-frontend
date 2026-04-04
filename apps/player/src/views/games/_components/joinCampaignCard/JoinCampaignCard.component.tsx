'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TextAreaField, SelectField, Button } from '@tapestry/ui';
import { api } from '@/lib/api';
import { useMyJoinRequests } from '@/lib/campaign-hooks';
import type { CampaignMember } from '@tapestry/types';
import styles from './JoinCampaignCard.module.scss';
import Link from 'next/link';

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

  // Check if user is already a member
  const isMember = useMemo(() => {
    if (!currentUserProfileId) return false;
    return members.some((member) => (typeof member.player === 'string' ? member.player === currentUserProfileId : member.player._id === currentUserProfileId));
  }, [members, currentUserProfileId]);

  // Only fetch join requests if user is not already a member
  const { data: joinRequestsResponse } = useMyJoinRequests(
    !isMember && joinPolicy === 'request' // Only fetch if not a member and campaign requires approval
  );
  const joinRequests = joinRequestsResponse?.payload || [];

  // Check if user has a pending join request for this campaign
  const pendingRequest = useMemo(() => {
    if (isMember) return null;
    return joinRequests.find((req) => req.campaign === gameId && req.status === 'pending');
  }, [joinRequests, gameId, isMember]);

  const joinMutation = useMutation({
    mutationFn: async () => {
      // Different endpoints for open vs request policies
      if (joinPolicy === 'open') {
        // Direct join for open campaigns
        await api.post(`/game/campaigns/${gameId}/join`, {
          role: preferredRole,
        });
      } else {
        // Request approval for 'request' policy
        const payload: { role: string; message?: string } = {
          role: preferredRole,
        };

        if (requestMessage.trim()) {
          payload.message = requestMessage.trim();
        }

        await api.post(`/game/campaigns/${gameId}/join-requests`, payload);
      }
    },
    onSuccess: () => {
      // Invalidate queries to refresh campaign data and user's campaign list
      queryClient.invalidateQueries({ queryKey: ['campaign', gameId] });
      queryClient.invalidateQueries({ queryKey: ['my-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['my-join-requests'] });
    },
  });

  // User is already a member - show member status
  if (isMember) {
    const userMember = members.find((member) => (typeof member.player === 'string' ? member.player === currentUserProfileId : member.player._id === currentUserProfileId));

    return (
      <section className={styles.joinCard}>
        <div className={styles.joinCardTop}>
          <div className={styles.successIcon}>✓</div>
          <h2>You're a Member</h2>
          <p>
            You joined this campaign as a{' '}
            <strong>{userMember?.role === 'sw' ? 'Storyweaver' : userMember?.role === 'co-sw' ? 'Co-Storyweaver' : userMember?.role === 'observer' ? 'Observer' : 'Player'}</strong>
            .
          </p>
          <Link href={`/games/${gameId}/board`}>
            <Button variant="solid" tone="gold" className={styles.boardButton}>
              Go to Game Board
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  // User has a pending join request
  if (pendingRequest) {
    return (
      <section className={styles.joinCard}>
        <div className={styles.joinCardTop}>
          <div className={styles.pendingIcon}>⏳</div>
          <h2>Request Pending</h2>
          <p>
            Your request to join as a <strong>{pendingRequest.role === 'observer' ? 'Observer' : 'Player'}</strong> is awaiting approval from the Storyweaver.
          </p>
          {pendingRequest.message && (
            <div className={styles.requestMessage}>
              <p className={styles.messageLabel}>Your message:</p>
              <p className={styles.messageText}>"{pendingRequest.message}"</p>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Invite-only campaigns cannot be joined
  if (joinPolicy === 'invite-only') {
    return (
      <section className={styles.joinCard}>
        <div className={styles.joinCardTop}>
          <h2>Invite Only</h2>
          <p>This campaign is private. To join, you'll need a specific invite code from the campaign creator.</p>
        </div>
      </section>
    );
  }

  const isOpen = joinPolicy === 'open';
  const buttonText = isOpen ? 'Join Campaign' : 'Request to Join';
  const headingText = isOpen ? 'Join this campaign' : 'Request to join';
  const descriptionText = isOpen
    ? 'Choose your role and join the adventure immediately.'
    : 'Send a request to the Storyweaver. Once accepted, you can attach a character and begin play.';

  return (
    <>
      <section className={styles.joinCard}>
        <div className={styles.joinCardTop}>
          <h2>{headingText}</h2>
          <p>{descriptionText}</p>
        </div>

        <SelectField
          label="Preferred Role"
          value={preferredRole}
          onChange={(e) => setPreferredRole(e.target.value as 'player' | 'observer')}
          disabled={joinMutation.isPending}
          helpText="Choose how you'd like to participate in this campaign"
        >
          <option value="player">Player</option>
          <option value="observer">Observer</option>
        </SelectField>

        {!isOpen ? (
          <TextAreaField
            label="Message to Storyweaver (optional)"
            value={requestMessage}
            onChange={(event) => setRequestMessage(event.target.value)}
            placeholder="Hey, this campaign looks like exactly my kind of bad decision."
            rows={5}
            disabled={joinMutation.isPending}
            maxLength={500}
            helpText={`${requestMessage.length} / 500 characters`}
          />
        ) : null}

        <button type="button" className={styles.joinButton} onClick={() => joinMutation.mutate()} disabled={joinMutation.isPending}>
          {joinMutation.isPending ? (
            <>
              <span className={styles.spinner}></span>
              {isOpen ? 'Joining...' : 'Submitting...'}
            </>
          ) : (
            buttonText
          )}
        </button>

        {joinMutation.isError ? (
          <div className={styles.errorMessage}>
            <span className={styles.errorIcon}>⚠️</span>
            <p>{isOpen ? 'Failed to join campaign' : 'Join request failed'}. The backend probably hasn't grown this limb yet.</p>
          </div>
        ) : null}
      </section>

      {joinMutation.isSuccess ? (
        <section className={styles.successCard}>
          <div className={styles.successIcon}>✓</div>
          <h2>{isOpen ? 'Joined Successfully' : 'Request Submitted'}</h2>
          <p>{isOpen ? "You're now a member of this campaign!" : "Your join request has been sent to the Storyweaver. You'll be notified when they review it."}</p>
        </section>
      ) : null}
    </>
  );
}
