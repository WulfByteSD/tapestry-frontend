'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getSettings } from '@tapestry/api-client';
import { TextField, Select } from '@tapestry/ui';
import type { SettingDefinition } from '@tapestry/types';
import type { CharacterDraft } from '../characterCreator.types';
import styles from './steps.module.scss';

type Props = {
  draft: CharacterDraft;
  setField: <K extends keyof CharacterDraft>(key: K, value: CharacterDraft[K]) => void;
};

export function IdentityStep({ draft, setField }: Props) {
  const settingsQuery = useQuery({
    queryKey: ['content:settings'],
    queryFn: () => getSettings(api, { pageLimit: 50, sortOptions: 'name' }),
  });

  const settings = settingsQuery.data?.payload ?? [];

  return (
    <div className={styles.stepBody}>
      <TextField
        label="Character Name"
        value={draft.name}
        onChange={(e) => setField('name', (e as React.ChangeEvent<HTMLInputElement>).target.value)}
        hint="Required. This is the name your character will be known by."
        floatingLabel
      />

      <TextField
        label="Archetype"
        value={draft.archetypeKey}
        onChange={(e) => setField('archetypeKey', (e as React.ChangeEvent<HTMLInputElement>).target.value)}
        hint="e.g. Warden, Blade, Thornweave — your character's role and combat identity. Just a label for now."
        floatingLabel
      />

      <div className={styles.fieldGroup}>
        <label className={styles.selectLabel}>Setting</label>
        <Select value={draft.settingKey} onChange={(e) => setField('settingKey', e.target.value)}>
          <option value="">No Setting</option>
          {settings.map((s: SettingDefinition) => (
            <option key={s.key} value={s.key}>
              {s.name}
            </option>
          ))}
        </Select>
        <p className={styles.hint}>The world your character inhabits. You can change this later without losing anything.</p>
      </div>

      <div className={styles.fieldGroup}>
        <TextField
          label="Avatar URL"
          value={draft.avatarUrl}
          onChange={(e) => setField('avatarUrl', (e as React.ChangeEvent<HTMLInputElement>).target.value)}
          hint=""
          floatingLabel
        />
        <p className={styles.avatarNotice}>
          Tapestry does not host images — only external links work here. Need a place to upload yours?{' '}
          <a href="https://imgur.com" target="_blank" rel="noopener noreferrer" className={styles.link}>
            Imgur
          </a>
          ,{' '}
          <a href="https://postimages.org" target="_blank" rel="noopener noreferrer" className={styles.link}>
            Postimages
          </a>
          , or{' '}
          <a href="https://imgbb.com" target="_blank" rel="noopener noreferrer" className={styles.link}>
            imgBB
          </a>{' '}
          are free options.
        </p>
      </div>
    </div>
  );
}
