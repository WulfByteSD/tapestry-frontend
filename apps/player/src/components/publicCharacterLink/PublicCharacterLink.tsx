'use client';

import { useState } from 'react';
import { Button, CopyField, Modal } from '@tapestry/ui';
import { FiLink } from 'react-icons/fi';
import { publicCharacterPath } from '@/features/characters/publicCharacterSheet/public-character';

type Props = {
  characterId: string;
  characterName: string;
  fullWidth?: boolean;
};

export function PublicCharacterLink({ characterId, characterName, fullWidth }: Props) {
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const close = () => setPublicUrl(null);

  return (
    <>
      <Button
        type="button"
        size="sm"
        tone="neutral"
        variant="outline"
        fullWidth={fullWidth}
        leftIcon={<FiLink aria-hidden="true" />}
        aria-label={`Public link for ${characterName}`}
        onClick={() => setPublicUrl(`${window.location.origin}${publicCharacterPath(characterId)}`)}
      >
        Public link
      </Button>
      {publicUrl && (
        <Modal
          open
          centered
          title="Public character link"
          onCancel={close}
          bodyStyle={{ display: 'grid', gap: '1rem' }}
          footer={<Button type="button" onClick={close}>Done</Button>}
        >
          <p>
            Share <strong>{characterName}</strong> with your table. Anyone with this link
            can view the read-only sheet without signing in.
          </p>
          <CopyField
            value={publicUrl}
            label="Copy or open the public link"
            displayAs="link"
            copyMessage="Public character link copied"
          />
        </Modal>
      )}
    </>
  );
}
