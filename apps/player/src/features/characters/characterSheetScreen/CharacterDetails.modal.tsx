'use client';

import { Button } from '@tapestry/ui';
import { SheetModal } from './SheetModal.component';
import { CharacterDetailsForm } from './CharacterDetails.form';
import { useCharacterDetailsDraft } from './CharacterDetails.hooks';
import { makeDetailsUpdates } from './CharacterDetails.helpers';
import type { CharacterDetailsProps } from './CharacterDetails.types';

export function CharacterDetailsModal({ open, sheet, onClose, onSave, isSaving = false }: CharacterDetailsProps) {
  const form = useCharacterDetailsDraft({ open, sheet });
  return (
    <SheetModal
      open={open}
      onCancel={onClose}
      title="Character details"
      subtitle="World, identity, and the story that shaped you."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(makeDetailsUpdates(form.draft))} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </>
      }
      width={820}
      destroyOnClose
    >
      <CharacterDetailsForm {...form} />
    </SheetModal>
  );
}
