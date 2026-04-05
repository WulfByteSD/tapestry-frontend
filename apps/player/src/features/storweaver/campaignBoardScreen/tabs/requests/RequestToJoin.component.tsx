'use client';

import { useState } from 'react';
import type { CampaignType, JoinRequest, PlayerType } from '@tapestry/types';
import { useMe } from '@/lib/auth-hooks';
import { useProfile } from '@tapestry/hooks';
import { api } from '@/lib/api';
import { useCampaignJoinRequests, useApproveJoinRequestMutation, useRejectJoinRequestMutation } from '@/lib/campaign-hooks';
import { Loader, useAlert } from '@tapestry/ui';
import { RequestCard } from './RequestCard';
import { ReviewRequestModal } from './ReviewRequestModal';
import styles from './RequestsTab.module.scss';

// Type for join request with populated player
type PopulatedJoinRequest = Omit<JoinRequest, 'player'> & {
  player?: PlayerType | string;
};

type Props = {
  campaign: CampaignType & { _id: string };
  isArchived: boolean;
};

export function RequestsTab({ campaign, isArchived }: Props) {
  const { addAlert } = useAlert();
  const { data: currentUser } = useMe();
  const { data: playerProfile } = useProfile(api, currentUser, 'player');
  const [selectedRequest, setSelectedRequest] = useState<PopulatedJoinRequest | null>(null);

  // Find current user's role in this campaign
  const members = campaign.members || [];
  const currentMember = members.find((m) => m.player._id === playerProfile?.payload._id);
  const currentUserRole = (currentMember?.role || 'observer') as 'sw' | 'co-sw' | 'player' | 'observer';

  // Permission check: only SW and Co-SW can see requests
  const canManageRequests = currentUserRole === 'sw' || currentUserRole === 'co-sw';

  // Fetch join requests
  const { data: requestsData, isLoading } = useCampaignJoinRequests(canManageRequests ? campaign._id : undefined);
  const requests = (requestsData as any) || [];

  const pendingRequests = requests;

  // Mutations
  const approveMutation = useApproveJoinRequestMutation(campaign._id);
  const rejectMutation = useRejectJoinRequestMutation(campaign._id);

  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {
      await approveMutation.mutateAsync({ requestId: selectedRequest._id });
      const playerName = typeof selectedRequest.player === 'object' ? selectedRequest.player?.displayName : 'Player';
      addAlert({
        type: 'success',
        message: `${playerName || 'Player'} has been added to the campaign.`,
      });
      setSelectedRequest(null);
    } catch (error) {
      addAlert({
        type: 'error',
        message: 'Failed to approve request. Please try again.',
      });
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    try {
      await rejectMutation.mutateAsync({ requestId: selectedRequest._id });
      const playerName = typeof selectedRequest.player === 'object' ? selectedRequest.player?.displayName : 'player';
      addAlert({
        type: 'info',
        message: `Request from ${playerName || 'player'} has been rejected.`,
      });
      setSelectedRequest(null);
    } catch (error) {
      addAlert({
        type: 'error',
        message: 'Failed to reject request. Please try again.',
      });
    }
  };

  // Permission gate
  if (!canManageRequests) {
    return (
      <div className={styles.empty}>
        <h3>Access Restricted</h3>
        <p>Only Storyweavers and Co-Storyweavers can view join requests.</p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.empty}>
        <Loader size="lg" />
      </div>
    );
  }

  // Empty state
  if (pendingRequests.length === 0) {
    return (
      <div className={styles.empty}>
        <h3>No pending requests</h3>
        <p>Join requests will appear here for approval.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.summary}>
        <strong>{pendingRequests.length}</strong> {pendingRequests.length === 1 ? 'request' : 'requests'}
      </div>

      <div className={styles.list}>
        {pendingRequests.map((request: any) => (
          <RequestCard key={request._id} request={request} onReview={() => setSelectedRequest(request)} isArchived={isArchived} />
        ))}
      </div>

      <ReviewRequestModal
        open={!!selectedRequest}
        onCancel={() => setSelectedRequest(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        request={selectedRequest}
        loading={approveMutation.isPending || rejectMutation.isPending}
      />
    </div>
  );
}

export default RequestsTab;
