'use client';

import { useEffect, useState } from 'react';
import { Button, Input, Modal, Select, SelectField } from '@tapestry/ui';
import type { CharacterSheet } from '@tapestry/types';
import styles from './CharacterDetails.module.scss';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getSettings } from '@tapestry/api-client';
import type { SettingDefinition } from '@tapestry/types';

type Props = {
  open: boolean;
  sheet: CharacterSheet;
  onClose: () => void;
  onSave: (payload: Record<string, unknown>) => void;
  isSaving?: boolean;
};

type DraftState = {
  avatarUrl: string;
  settingKey: string;
  archetypeKey: string;
  weaveLevel: number | string;
  title: string;
  bio: string;
  race: string;
  nationality: string;
  religion: string;
  sex: string;
  height: string;
  weight: string;
  eyes: string;
  hair: string;
  ethnicity: string;
  age: string;
};

function makeDraft(sheet: CharacterSheet): DraftState {
  const profile = sheet.sheet.profile ?? {};

  return {
    avatarUrl: sheet.avatarUrl ?? '',
    settingKey: sheet.settingKey ?? '',
    archetypeKey: sheet.sheet.archetypeKey ?? '',
    weaveLevel: sheet.sheet.weaveLevel ?? 1,
    title: profile.title ?? '',
    bio: profile.bio ?? '',
    race: profile.race ?? '',
    nationality: profile.nationality ?? '',
    religion: profile.religion ?? '',
    sex: profile.sex ?? '',
    height: profile.height ?? '',
    weight: profile.weight ?? '',
    eyes: profile.eyes ?? '',
    hair: profile.hair ?? '',
    ethnicity: profile.ethnicity ?? '',
    age: profile.age != null ? String(profile.age) : '',
  };
}
export function CharacterDetailsModal({ open, sheet, onClose, onSave, isSaving = false }: Props) {
  const [draft, setDraft] = useState<DraftState>(() => makeDraft(sheet));
  const settingsQuery = useQuery({
    queryKey: ['content:settings'],
    queryFn: () =>
      getSettings(api, {
        pageLimit: 50,
        sortOptions: 'name',
      }),
  });

  const settings = settingsQuery.data?.payload ?? [];
  useEffect(() => {
    if (open) {
      setDraft(makeDraft(sheet));
    }
  }, [open, sheet]);

  function setField<K extends keyof DraftState>(key: K, value: DraftState[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    const normalizedWeaveLevel = Math.max(1, Number.isFinite(Number(draft.weaveLevel)) ? Number(draft.weaveLevel) : 1);

    onSave({
      avatarUrl: draft.avatarUrl.trim() || null,
      settingKey: draft.settingKey.trim() || null,
      'sheet.archetypeKey': draft.archetypeKey.trim() || null,
      'sheet.weaveLevel': normalizedWeaveLevel,
      'sheet.profile': {
        title: draft.title.trim() || undefined,
        bio: draft.bio.trim() || undefined,
        race: draft.race.trim() || undefined,
        nationality: draft.nationality.trim() || undefined,
        religion: draft.religion.trim() || undefined,
        sex: draft.sex.trim() || undefined,
        height: draft.height.trim() || undefined,
        weight: draft.weight.trim() || undefined,
        eyes: draft.eyes.trim() || undefined,
        hair: draft.hair.trim() || undefined,
        ethnicity: draft.ethnicity.trim() || undefined,
        age: draft.age.trim() || undefined,
      },
    });
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Character Details"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </>
      }
      width={820}
      destroyOnClose
    >
      <div className={styles.root}>
        <Select value={draft.settingKey} onChange={(e) => setField('settingKey', e.target.value)}>
          <option value="">No Setting</option>
          {settings.map((setting: SettingDefinition) => (
            <option key={setting.key} value={setting.key}>
              {setting.name}
            </option>
          ))}
        </Select>
        <p className={styles.settingHint}>
          Changing a setting does not automatically remove old items, skills, or notes. Forking is usually the cleaner option when porting a character into another world.
        </p>
        <div className={styles.grid}>
          <Input label="Avatar URL" value={draft.avatarUrl} onChange={(e) => setField('avatarUrl', e.target.value)} placeholder="https://example.com/avatar.png" />

          <Input label="Archetype" value={draft.archetypeKey} onChange={(e) => setField('archetypeKey', e.target.value)} placeholder="bard, warden, striker..." />

          <Input label="Weave Level" type="number" min={1} value={draft.weaveLevel} onChange={(e) => setField('weaveLevel', e.target.value)} />

          <Input label="Title" value={draft.title} onChange={(e) => setField('title', e.target.value)} placeholder="The Ashen Blade, Court Singer..." />
        </div>

        <div className={styles.grid}>
          <Input label="Race" value={draft.race} onChange={(e) => setField('race', e.target.value)} />
          <Input label="Nationality" value={draft.nationality} onChange={(e) => setField('nationality', e.target.value)} />
          <Input label="Religion" value={draft.religion} onChange={(e) => setField('religion', e.target.value)} />
          <SelectField
            label="Sex"
            value={draft.sex}
            onChange={(e) => setField('sex', e.target.value)}
            options={[
              { value: '', label: '—' },
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other', label: 'Other' },
            ]}
          />
          <Input label="Height" value={draft.height} onChange={(e) => setField('height', e.target.value)} />
          <Input label="Weight" value={draft.weight} onChange={(e) => setField('weight', e.target.value)} />
          <Input label="Eyes" value={draft.eyes} onChange={(e) => setField('eyes', e.target.value)} />
          <Input label="Hair" value={draft.hair} onChange={(e) => setField('hair', e.target.value)} />
          <Input label="Ethnicity" value={draft.ethnicity} onChange={(e) => setField('ethnicity', e.target.value)} />
          <Input label="Age" value={draft.age} onChange={(e) => setField('age', e.target.value)} />
        </div>

        <label className={styles.bioBlock}>
          <span className={styles.bioLabel}>Bio</span>
          <textarea
            className={styles.bioInput}
            value={draft.bio}
            onChange={(e) => setField('bio', e.target.value)}
            placeholder="Who are they, what shaped them, and why are they here?"
            rows={8}
          />
        </label>
      </div>
    </Modal>
  );
}
