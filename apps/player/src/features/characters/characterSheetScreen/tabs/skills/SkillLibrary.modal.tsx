// tabs/skills/SkillLibrary.modal.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal, Button, Select, TextField, Loader } from '@tapestry/ui';
import { api } from '@/lib/api';
import { getSettings, getSkillsForSetting } from '@tapestry/api-client';
import type { CharacterSheet, SettingDefinition, SkillDefinition } from '@tapestry/types';
import styles from './SkillLibraryModal.module.scss';

type Props = {
  open: boolean;
  onClose: () => void;
  sheet: CharacterSheet;
  knownSkillKeys: string[];
  onAddSkill: (skill: SkillDefinition, settingKey: string) => void;
};

export function SkillLibraryModal({ open, onClose, sheet, knownSkillKeys, onAddSkill }: Props) {
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

  const skillsQuery = useQuery({
    queryKey: ['content:skills', effectiveSettingKey],

    enabled: open && !!effectiveSettingKey,
    queryFn: () => getSkillsForSetting(api, effectiveSettingKey),
  });

  const skills = skillsQuery.data?.payload ?? [];

  const filteredSkills = useMemo(() => {
    const q = search.trim().toLowerCase();

    return skills.filter((skill: SkillDefinition) => {
      if (knownSkillKeys.includes(skill.key)) return false;
      if (!q) return true;

      const haystack = [skill.name, skill.key, skill.category ?? '', skill.defaultAspect ?? '', skill.notes ?? '', ...(skill.tags ?? [])].join(' ').toLowerCase();

      return haystack.includes(q);
    });
  }, [skills, search, knownSkillKeys]);

  return (
    <Modal open={open} onCancel={onClose} title="Skill Library">
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
            <TextField value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Persuasion, stealth, systems..." />
          </label>
        </div>

        {skillsQuery.isLoading ? (
          <div className={styles.emptyState}>
            <Loader size="md" tone="gold" label="Loading skills..." />
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className={styles.emptyState}>No skills matched your search.</div>
        ) : (
          <div className={styles.skillList}>
            {filteredSkills.map((skill: SkillDefinition) => (
              <div key={skill.key} className={styles.skillCard}>
                <div className={styles.skillTopRow}>
                  <div>
                    <div className={styles.skillName}>{skill.name}</div>
                    <div className={styles.skillMeta}>
                      {skill.category ?? 'other'}
                      {skill.defaultAspect ? ` • ${skill.defaultAspect}` : ''}
                    </div>
                  </div>

                  <Button onClick={() => onAddSkill(skill, effectiveSettingKey)}>Add</Button>
                </div>

                {!!skill.tags?.length && (
                  <div className={styles.tagRow}>
                    {skill.tags.map((tag) => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {skill.notes ? <div className={styles.skillNotes}>{skill.notes}</div> : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
