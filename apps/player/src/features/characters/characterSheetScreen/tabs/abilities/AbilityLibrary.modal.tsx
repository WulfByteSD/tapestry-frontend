// apps/player/src/features/characters/characterSheetScreen/tabs/abilities/AbilityLibrary.modal.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Modal, Select, TextField, Loader } from '@tapestry/ui';
import { api } from '@/lib/api';
import { getAbilitiesForSetting, getSettings } from '@tapestry/api-client';
import type { AbilityDefinition, CharacterSheet, SettingDefinition } from '@tapestry/types';
import { formatAbilityMeta } from './abilities.functions';
import styles from './AbilityLibraryModal.module.scss';

type Props = {
  open: boolean;
  onClose: () => void;
  sheet: CharacterSheet;
  knownAbilityKeys: string[];
  onAddAbility: (ability: AbilityDefinition, settingKey: string) => void;
};

export function AbilityLibraryModal({ open, onClose, sheet, knownAbilityKeys, onAddAbility }: Props) {
  const [selectedSettingKey, setSelectedSettingKey] = useState(sheet.settingKey ?? '');
  const [search, setSearch] = useState('');

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
    if (sheet.settingKey) {
      setSelectedSettingKey(sheet.settingKey);
      return;
    }

    if (!selectedSettingKey && settings.length > 0) {
      setSelectedSettingKey(settings[0].key);
    }
  }, [sheet.settingKey, selectedSettingKey, settings]);

  const effectiveSettingKey = sheet.settingKey || selectedSettingKey || settings[0]?.key || '';

  const abilitiesQuery = useQuery({
    queryKey: ['content:abilities', effectiveSettingKey],
    enabled: open && !!effectiveSettingKey,
    queryFn: () => getAbilitiesForSetting(api, effectiveSettingKey),
  });

  const abilities = (abilitiesQuery.data?.payload ?? []) as unknown as AbilityDefinition[];

  const filteredAbilities = useMemo(() => {
    const q = search.trim().toLowerCase();

    return abilities.filter((ability) => {
      if (knownAbilityKeys.includes(ability.key)) return false;
      if (!q) return true;

      const haystack = [
        ability.name,
        ability.key,
        ability.category ?? '',
        ability.sourceType ?? '',
        ability.activation ?? '',
        ability.usageModel ?? '',
        ability.summary ?? '',
        ability.effectText ?? '',
        ...(ability.tags ?? []),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [abilities, search, knownAbilityKeys]);

  return (
    <Modal open={open} onCancel={onClose} title="Ability Library">
      <div className={styles.content}>
        <div className={styles.controls}>
          <label className={styles.field}>
            <span className={styles.label}>Setting</span>
            <Select value={selectedSettingKey} onChange={(e) => setSelectedSettingKey(e.target.value)} disabled={!!sheet.settingKey || settingsQuery.isLoading}>
              {settings.map((setting: SettingDefinition) => (
                <option key={setting.key} value={setting.key}>
                  {setting.name}
                </option>
              ))}
            </Select>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Search</span>
            <TextField value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Fireball, ember step, cloak field..." />
          </label>
        </div>

        {abilitiesQuery.isLoading ? (
          <div className={styles.emptyState}>
            <Loader size="md" tone="gold" label="Loading abilities..." />
          </div>
        ) : filteredAbilities.length === 0 ? (
          <div className={styles.emptyState}>No abilities matched your search.</div>
        ) : (
          <div className={styles.abilityList}>
            {filteredAbilities.map((ability: AbilityDefinition) => (
              <div key={ability.key} className={styles.abilityCard}>
                <div className={styles.abilityTopRow}>
                  <div>
                    <div className={styles.abilityName}>{ability.name}</div>
                    <div className={styles.abilityMeta}>
                      {ability.category ?? 'other'}
                      {formatAbilityMeta(ability) ? ` • ${formatAbilityMeta(ability)}` : ''}
                    </div>
                  </div>

                  <Button onClick={() => onAddAbility(ability, effectiveSettingKey)}>Add</Button>
                </div>

                {!!ability.tags?.length && (
                  <div className={styles.tagRow}>
                    {ability.tags.map((tag) => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {ability.summary ? <div className={styles.abilitySummary}>{ability.summary}</div> : null}

                {ability.effectText ? <div className={styles.abilityEffect}>{ability.effectText}</div> : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
