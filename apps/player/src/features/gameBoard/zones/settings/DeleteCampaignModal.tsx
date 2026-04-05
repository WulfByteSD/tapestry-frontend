'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Modal } from '@tapestry/ui';
import { useUpdateCampaignMutation } from '@/lib/campaign-hooks';
import type { CampaignType } from '@tapestry/types';
import styles from './DeleteCampaignModal.module.scss';

type Props = {
  open: boolean;
  campaign: CampaignType & { _id: string };
  onClose: () => void;
};

export default function DeleteCampaignModal({ open, campaign, onClose }: Props) {
  const router = useRouter();
  const [confirmName, setConfirmName] = useState('');
  const updateMutation = useUpdateCampaignMutation(campaign._id);
  const isDeleteEnabled = confirmName.trim() === campaign.name.trim();

  const handleConfirm = async () => {
    if (!isDeleteEnabled) return;

    try {
      await updateMutation.mutateAsync({ status: 'archived' });
      onClose();
      setConfirmName('');
      // Redirect to campaigns list after archiving
      router.push('/games');
    } catch (error) {
      console.error('Failed to archive campaign:', error);
    }
  };

  const handleCancel = () => {
    onClose();
    setConfirmName('');
  };

  return (
    <Modal
      open={open}
      title="Archive Campaign"
      onCancel={handleCancel}
      onOk={handleConfirm}
      okText="Archive Campaign"
      cancelText="Cancel"
      confirmLoading={updateMutation.isPending}
      okButtonProps={{
        tone: 'danger',
        disabled: !isDeleteEnabled,
      }}
      centered
    >
      <div className={styles.content}>
        <p className={styles.warning}>
          This action will <strong>permanently archive</strong> this campaign. Once archived, the campaign will no longer be accessible for active play.
        </p>
        <p className={styles.details}>All campaign data, characters, and activity will be preserved but the campaign will be marked as archived.</p>
        <p className={styles.confirmInstruction}>
          To confirm, please type the campaign name: <strong>{campaign.name}</strong>
        </p>
        <Input
          type="text"
          placeholder={`Type "${campaign.name}" to confirm`}
          value={confirmName}
          onChange={(e) => setConfirmName(e.target.value)}
          hasError={confirmName.length > 0 && !isDeleteEnabled}
          autoFocus
        />
      </div>
    </Modal>
  );
}
