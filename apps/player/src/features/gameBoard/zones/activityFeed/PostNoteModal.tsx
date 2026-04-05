'use client';

import { useState } from 'react';
import { Modal, Button } from '@tapestry/ui';
import { usePostNoteMutation } from './activityFeed.hooks';
import styles from './PostNoteModal.module.scss';

type Props = {
  campaignId: string;
  isOpen: boolean;
  onClose: () => void;
};

export function PostNoteModal({ campaignId, isOpen, onClose }: Props) {
  const [content, setContent] = useState('');
  const postNote = usePostNoteMutation(campaignId);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      await postNote.mutateAsync(content.trim());
      setContent('');
      onClose();
    } catch (error) {
      // Error handled by QueryClient global error handler
      console.error('Failed to post note:', error);
    }
  };

  return (
    <Modal open={isOpen} onCancel={onClose} title="Post to Activity Feed" footer={null}>
      <div className={styles.modalContent}>
        <textarea
          className={styles.textarea}
          placeholder="Share story updates, session notes, or campaign announcements..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          maxLength={2000}
        />

        <div className={styles.modalFooter}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="solid" tone="gold" onClick={handleSubmit} disabled={!content.trim() || postNote.isPending}>
            {postNote.isPending ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
