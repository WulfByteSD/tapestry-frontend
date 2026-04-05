'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Modal } from '@tapestry/ui';
import { useDeleteCampaignMutation } from '@/lib/campaign-hooks';
import type { CampaignType } from '@tapestry/types';
import styles from './DeleteCampaignModal.module.scss';

type Props = {
  open: boolean;
  campaign: CampaignType & { _id: string };
  onClose: () => void;
};

export default function FullDeleteCampaignModal({ open, campaign, onClose }: Props) {
  const router = useRouter();
  const [confirmName, setConfirmName] = useState('');
  const deleteMutation = useDeleteCampaignMutation(campaign._id);
  const isDeleteEnabled = confirmName.trim() === campaign.name.trim();

  const handleConfirm = async () => {
    if (!isDeleteEnabled) return;

    try {
      await deleteMutation.mutateAsync();
      onClose();
      setConfirmName('');
      // Redirect to campaigns list after deletion
      router.push('/games');
    } catch (error) {
      console.error('Failed to delete campaign:', error);
    }
  };

  const handleCancel = () => {
    onClose();
    setConfirmName('');
  };

  return (
    <Modal
      open={open}
      title="Permanently Delete Campaign"
      onCancel={handleCancel}
      onOk={handleConfirm}
      okText="Delete Forever"
      cancelText="Cancel"
      confirmLoading={deleteMutation.isPending}
      okButtonProps={{
        tone: 'danger',
        disabled: !isDeleteEnabled,
      }}
      centered
    >
      <div className={styles.content}>
        <p className={styles.warning}>
          This action is <strong>irreversible and permanent</strong>. All campaign data will be completely destroyed.
        </p>
        <p className={styles.details}>This includes all characters, activity, notes, rolls, and campaign history. This data cannot be recovered.</p>
        <p className={styles.emphasis}>
          ⚠️ If you want to preserve the campaign but make it inactive, use <strong>Archive</strong> instead.
        </p>
        <p className={styles.confirmInstruction}>
          To confirm permanent deletion, type the campaign name: <strong>{campaign.name}</strong>
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
