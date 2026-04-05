'use client';

import { useState } from 'react';
import { Button } from '@tapestry/ui';
import type { CampaignType, CharacterSheet, CharacterRequest } from '@tapestry/types';
import {
  useCampaignCharacters,
  useCampaignCharacterRequests,
  useRequestCharacterAttachmentMutation,
  useApproveCharacterRequestMutation,
  useRejectCharacterRequestMutation,
  useAttachDMPCMutation,
  useDetachCharacterMutation,
} from '@/lib/character-hooks';
import CampaignCharacterCard from './character/CampaignCharacterCard';
import PendingRequestRow from './character/PendingRequestRow';
import AttachCharacterModal from './character/AttachCharacterModal';
import styles from './zones.module.scss';

interface Props {
  campaign: CampaignType;
  isSW: boolean;
  currentUserId: string;
}

export default function CharacterZone({ campaign, isSW, currentUserId }: Props) {
  const campaignId = campaign._id;
  const [modalOpen, setModalOpen] = useState(false);

  const { data: characters = [], isLoading: charsLoading } = useCampaignCharacters(campaignId);
  const { data: requests = [], isLoading: reqsLoading } = useCampaignCharacterRequests(campaignId);

  const requestAttach = useRequestCharacterAttachmentMutation(campaignId);
  const approveMutation = useApproveCharacterRequestMutation(campaignId);
  const rejectMutation = useRejectCharacterRequestMutation(campaignId);
  const attachDMPC = useAttachDMPCMutation(campaignId);
  const detach = useDetachCharacterMutation(campaignId);

  const isLoading = charsLoading || reqsLoading;

  // Characters that belong to the current player (non-SW)
  const myCharacters = isSW
    ? (characters as CharacterSheet[])
    : (characters as CharacterSheet[]).filter((c) => c.player === currentUserId);

  // Pending requests — all for SW, own for player
  const pendingRequests = isSW
    ? (requests as CharacterRequest[]).filter((r) => r.status === 'pending')
    : (requests as CharacterRequest[]).filter(
        (r) => r.status === 'pending' && (typeof r.player === 'string' ? r.player : r.player._id) === currentUserId,
      );

  const attachedIds = (characters as CharacterSheet[]).map((c) => c._id);

  function handleSubmitAttach(characterId: string, message?: string) {
    if (isSW) {
      attachDMPC.mutate({ characterId }, { onSuccess: () => setModalOpen(false) });
    } else {
      requestAttach.mutate({ characterId, message }, { onSuccess: () => setModalOpen(false) });
    }
  }

  return (
    <div className={styles.zone}>
      <div className={styles.zoneHeader}>
        <h2 className={styles.zoneTitle}>{isSW ? 'Campaign Characters' : 'Your Character'}</h2>
        <Button
          size="sm"
          variant="outline"
          tone="gold"
          onClick={() => setModalOpen(true)}
        >
          {isSW ? '+ Attach DMPC' : '+ Attach a Character'}
        </Button>
      </div>

      {isLoading ? (
        <div className={styles.skeletonBody}>
          <div className={styles.skeletonLine} style={{ width: '60%' }} />
          <div className={styles.skeletonLine} style={{ width: '40%' }} />
        </div>
      ) : (
        <>
          {/* Pending approval queue */}
          {pendingRequests.length > 0 && (
            <section>
              <p className={styles.zoneDescription} style={{ marginBottom: 8 }}>
                {isSW ? 'Pending Approvals' : 'Awaiting Approval'}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pendingRequests.map((req) => (
                  <PendingRequestRow
                    key={req._id}
                    request={req}
                    isSW={isSW}
                    isPending={approveMutation.isPending || rejectMutation.isPending}
                    onApprove={() => approveMutation.mutate(req._id)}
                    onReject={() => rejectMutation.mutate(req._id)}
                    onCancel={() => rejectMutation.mutate(req._id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Approved characters */}
          {myCharacters.length > 0 ? (
            <section style={{ marginTop: pendingRequests.length > 0 ? 20 : 0 }}>
              {isSW && (
                <p className={styles.zoneDescription} style={{ marginBottom: 8 }}>
                  Approved Characters
                </p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {myCharacters.map((char) => (
                  <CampaignCharacterCard
                    key={char._id}
                    character={char}
                    canDetach={isSW || char.player === currentUserId}
                    isDetaching={detach.isPending}
                    onDetach={() => detach.mutate(char._id)}
                  />
                ))}
              </div>
            </section>
          ) : (
            pendingRequests.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <p className={styles.zoneDescription}>
                  {isSW
                    ? 'No characters attached to this campaign yet.'
                    : "You haven't attached a character to this campaign yet."}
                </p>
                <Button
                  variant="solid"
                  tone="gold"
                  onClick={() => setModalOpen(true)}
                  style={{ marginTop: 12 }}
                >
                  {isSW ? 'Attach a DMPC' : 'Attach a Character'}
                </Button>
              </div>
            )
          )}
        </>
      )}

      <AttachCharacterModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        attachedIds={attachedIds}
        onSubmit={handleSubmitAttach}
        isSubmitting={requestAttach.isPending || attachDMPC.isPending}
        isDMPC={isSW}
        playerId={currentUserId}
      />
    </div>
  );
}

