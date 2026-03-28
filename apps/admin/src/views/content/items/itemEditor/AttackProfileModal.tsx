import React, { useMemo } from 'react';
import { Button, Modal, SelectField, TagInputField, TextAreaField, TextField, type SelectOption } from '@tapestry/ui';
import { useSkills } from '@/lib/content-admin';
import { AttackProfileDraft } from './editor.types';
import { useAttackProfileEditor } from './useAttackProfileEditor';
import { ATTACK_KIND_OPTIONS, ATTACK_PROFILE_ASPECT_OPTIONS } from './editor.constants';

import styles from './ItemEditor.module.scss';

type AttackProfileModalProps = {
  attackProfileEditor: ReturnType<typeof useAttackProfileEditor>;
  currentSettingKeys: string[];
};

export const AttackProfileModal = ({ attackProfileEditor, currentSettingKeys }: AttackProfileModalProps) => {
  const skillsQuery = useSkills({ pageNumber: 1, pageLimit: 200, sortOptions: 'name' });

  const skillOptions = useMemo<SelectOption[]>(() => {
    const settingKeysSet = new Set(currentSettingKeys);

    return (skillsQuery.data?.payload ?? [])
      .filter((skill) => {
        const skillSettingKeys = skill.settingKeys ?? [];
        return skillSettingKeys.includes('shared') || skillSettingKeys.some((settingKey) => settingKeysSet.has(settingKey));
      })
      .map((skill) => ({
        label: skill.defaultAspect ? `${skill.name} - ${skill.defaultAspect}` : skill.name,
        value: skill.key,
      }));
  }, [currentSettingKeys, skillsQuery.data?.payload]);

  const { isModalOpen, draft, errors, isPending, originalKey, handleNameChange, handleKeyChange, updateDraft, handleSubmit, handleRemove, closeModal } = attackProfileEditor;
  const isEditMode = originalKey != null;

  return (
    <Modal
      open={isModalOpen}
      title={isEditMode ? `Edit ${draft.name || 'Attack Profile'}` : 'Add Attack Profile'}
      onCancel={closeModal}
      footer={
        <div className={styles.modalFooterActions}>
          <div>
            {isEditMode ? (
              <Button variant="outline" tone="danger" onClick={handleRemove} disabled={isPending}>
                Remove Profile
              </Button>
            ) : null}
          </div>
          <div className={styles.modalFooterButtons}>
            <Button variant="outline" tone="neutral" onClick={closeModal} disabled={isPending}>
              Cancel
            </Button>
            <Button tone="gold" onClick={handleSubmit} isLoading={isPending}>
              {isEditMode ? 'Save Profile' : 'Add Profile'}
            </Button>
          </div>
        </div>
      }
      width={720}
      centered
      destroyOnClose
    >
      <div className={styles.modalBody}>
        <div className={styles.gridTwo}>
          <TextField
            floatingLabel
            label="Profile Name"
            value={draft.name}
            onChange={(event) => handleNameChange(event.target.value)}
            error={errors.name}
            disabled={isPending}
            autoFocus
          />
          <TextField floatingLabel label="Profile Key" value={draft.key} onChange={(event) => handleKeyChange(event.target.value)} error={errors.key} disabled={isPending} />
        </div>

        <div className={styles.gridThree}>
          <SelectField
            floatingLabel
            label="Attack Kind"
            value={draft.attackKind}
            onChange={(event) => updateDraft('attackKind', event.target.value as AttackProfileDraft['attackKind'])}
            disabled={isPending}
            options={ATTACK_KIND_OPTIONS}
          />
          <SelectField
            floatingLabel
            label="Default Aspect"
            value={draft.defaultAspect}
            onChange={(event) => updateDraft('defaultAspect', event.target.value)}
            disabled={isPending}
            options={ATTACK_PROFILE_ASPECT_OPTIONS}
          />
          <SelectField
            mode="multiple"
            floatingLabel
            label="Allowed Skills"
            value={draft.allowedSkillKeys}
            onChange={(value) => updateDraft('allowedSkillKeys', value as string[])}
            disabled={isPending}
            placeholder={skillOptions.length ? 'Select skill(s)...' : 'No matching skills available'}
            options={skillOptions}
            helpText={skillsQuery.isError ? 'Skill options are currently unavailable.' : undefined}
          />
        </div>

        <div className={styles.gridThree}>
          <TextField
            floatingLabel
            label="Modifier"
            type="number"
            value={draft.modifier ?? ''}
            valueMode="number"
            onChange={(value) => updateDraft('modifier', value as number | undefined)}
            error={errors.modifier}
            disabled={isPending}
            placeholder="0"
          />
          <TextField
            floatingLabel
            label="Harm"
            type="number"
            value={draft.harm ?? ''}
            valueMode="number"
            onChange={(value) => updateDraft('harm', value as number | undefined)}
            error={errors.harm}
            disabled={isPending}
            placeholder="0"
          />
          <TextField
            floatingLabel
            label="Range Label"
            value={draft.rangeLabel}
            onChange={(event) => updateDraft('rangeLabel', event.target.value)}
            disabled={isPending}
            placeholder="Close, 30 ft, across the room..."
          />
        </div>

        <TagInputField
          floatingLabel
          label="Tags"
          value={draft.tags}
          onChange={(value) => updateDraft('tags', value as string[])}
          disabled={isPending}
          placeholder="Type a tag and press comma or enter..."
        />

        <TextAreaField
          floatingLabel
          label="Notes"
          value={draft.notes}
          onChange={(event) => updateDraft('notes', event.target.value)}
          disabled={isPending}
          placeholder="Optional internal notes about this profile..."
        />
      </div>
    </Modal>
  );
};
