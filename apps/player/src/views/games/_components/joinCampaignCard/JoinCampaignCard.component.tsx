'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TextAreaField, SelectField } from '@tapestry/ui';
import { api } from '@/lib/api';
import styles from './JoinCampaignCard.module.scss';

type JoinPolicy = 'open' | 'request' | 'invite-only';

type Props = {
  gameId: string;
  joinPolicy: JoinPolicy;
};

export default function JoinCampaignCard({ gameId, joinPolicy }: Props) {
  const queryClient = useQueryClient();
  const [requestMessage, setRequestMessage] = useState('');
  const [preferredRole, setPreferredRole] = useState<'player' | 'observer'>('player');

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
      // TODO: Invalidate campaign query to refresh join status
      queryClient.invalidateQueries({ queryKey: ['campaign', gameId] });
    },
  });

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
