'use client';

import { useState } from 'react';
import { Modal, Button, TextAreaField, SelectField } from '@tapestry/ui';
import type { NotePostType } from '@tapestry/types';
import { usePostNoteMutation } from './activityFeed.hooks';
import styles from './PostNoteModal.module.scss';

type Props = {
  campaignId: string;
  isOpen: boolean;
  onClose: () => void;
};

const POST_TYPE_OPTIONS = [
  { value: 'campaign-update', label: '📰 Campaign Update', icon: '📰' },
  { value: 'session-recap', label: '⚔️ Session Recap', icon: '⚔️' },
  { value: 'lore-drop', label: '📜 Lore Drop', icon: '📜' },
  { value: 'player-spotlight', label: '⭐ Player Spotlight', icon: '⭐' },
  { value: 'announcement', label: '📢 Announcement', icon: '📢' },
  { value: 'behind-the-scenes', label: '🎬 Behind the Scenes', icon: '🎬' },
];

const MAX_CHAR = 2000;

export function PostNoteModal({ campaignId, isOpen, onClose }: Props) {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<NotePostType>('campaign-update');
  const postNote = usePostNoteMutation(campaignId);

  const remaining = MAX_CHAR - content.length;
  const isLow = remaining < 100;

  const helpText = isLow ? `⚠️ ${remaining} characters remaining` : `${remaining} / ${MAX_CHAR} characters remaining`;

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      await postNote.mutateAsync({ content: content.trim(), postType });
      setContent('');
      setPostType('campaign-update');
      onClose();
    } catch (error) {
      // Error handled by QueryClient global error handler
      console.error('Failed to post note:', error);
    }
  };

  return (
    <Modal open={isOpen} onCancel={onClose} title="Post to Activity Feed" footer={null}>
      <div className={styles.modalContent}>
        <SelectField label="Post Type" value={postType} onChange={(e) => setPostType(e.target.value as NotePostType)} options={POST_TYPE_OPTIONS} />

        <TextAreaField
          label="Content"
          placeholder="Share story updates, session notes, or campaign announcements..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          maxLength={MAX_CHAR}
          helpText={helpText}
        />

        <p className={styles.markdownHint}>💡 Supports Markdown: **bold**, *italic*, [links](url), etc.</p>

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
