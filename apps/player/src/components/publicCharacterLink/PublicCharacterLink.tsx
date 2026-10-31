'use client';

import { useState } from 'react';
import { Button, CopyField, Modal } from '@tapestry/ui';
import { FiLink } from 'react-icons/fi';
import { publicCharacterPath } from '@/features/characters/publicCharacterSheet/public-character';
import styles from './PublicCharacterLink.module.scss';

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
          footer={<Button type="button" className={styles.doneButton} onClick={close}>Done</Button>}
        >
          <div className={styles.content}>
            <div className={styles.intro}>
              <span className={styles.linkIcon} aria-hidden="true"><FiLink /></span>
              <div className={styles.character}>
                <h3 className={styles.characterName}>{characterName}</h3>
                <p className={styles.description}>Share your character with the table.</p>
              </div>
            </div>
            <div className={styles.linkSection}>
              <CopyField
                className={styles.copyField}
                value={publicUrl}
                label="Public sheet link"
                variant="field"
                displayAs="link"
                copyMessage="Public character link copied"
              />
              <p className={styles.description}>
                Anyone with this link can view the read-only sheet. No sign-in needed.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
