import React, { useMemo, useState, useEffect } from 'react';
import { Button, Checkbox, Modal, SelectField, TextField, TextAreaField, type SelectOption } from '@tapestry/ui';
import { useAbilities } from '@/lib/content-admin';
import { useGrantedAbilityEditor } from './useGrantedAbilityEditor';
import { GRANT_MODE_OPTIONS, ABILITY_CATEGORY_OPTIONS, ABILITY_SOURCE_TYPE_OPTIONS } from './grantedAbility.constants';
import type { AbilityCategory, AbilitySourceType } from '@tapestry/types';

import styles from './ItemEditor.module.scss';

type AbilityOption = SelectOption & {
  abilityKey?: string;
};

type GrantedAbilityModalProps = {
  grantedAbilityEditor: ReturnType<typeof useGrantedAbilityEditor>;
  currentSettingKeys: string[];
};

export const GrantedAbilityModal = ({ grantedAbilityEditor, currentSettingKeys }: GrantedAbilityModalProps) => {
  // Search and filter state
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [filterCategory, setFilterCategory] = useState<AbilityCategory | ''>('');
  const [filterSourceType, setFilterSourceType] = useState<AbilitySourceType | ''>('');

  // Debounce keyword search (800ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
    }, 800);

    return () => clearTimeout(timer);
  }, [searchKeyword]);
  // Build filterOptions string for backend query
  const filterOptions = useMemo(() => {
    const filters: string[] = [];

    // Always exclude "learned" sourceType (abilities not meant for items)
    // filters.push('sourceType;!learned');

    // Add category filter if selected
    if (filterCategory) {
      filters.push(`category;${filterCategory}`);
    }

    // Add sourceType filter if selected
    if (filterSourceType) {
      filters.push(`sourceType;${filterSourceType}`);
    }

    // Add settingKeys filter (must match item's settings or be shared)
    if (currentSettingKeys.length > 0) {
      const settingKeysFilter = ['shared', ...currentSettingKeys].join(',');
      filters.push(`settingKeys;{"$in":"${settingKeysFilter}"}`);
    }

    return filters.join('|');
  }, [filterCategory, filterSourceType, currentSettingKeys]);

  // Query backend with filters
  const abilitiesQuery = useAbilities({
    pageNumber: 1,
    pageLimit: 500,
    sortOptions: 'name',
    keyword: debouncedKeyword,
    filterOptions,
  });

  // Map abilities to select options (no client-side filtering needed)
  const abilityOptions = useMemo<AbilityOption[]>(() => {
    return (abilitiesQuery.data?.payload ?? []).map((ability) => ({
      label: ability.name,
      value: ability._id,
      abilityKey: ability.key,
    }));
  }, [abilitiesQuery.data?.payload]);

  const abilityLookup = useMemo(() => {
    const map = new Map<string, string>();
    abilityOptions.forEach((option) => {
      if (option.abilityKey) {
        map.set(option.value as string, option.abilityKey);
      }
    });
    return map;
  }, [abilityOptions]);

  const { isModalOpen, draft, error, isPending, originalAbilityId, updateDraft, handleSubmit, handleRemove, closeModal } = grantedAbilityEditor;

  const isEditMode = originalAbilityId != null;

  const selectedAbility = useMemo(() => {
    if (!draft.abilityId) return null;
    return (abilitiesQuery.data?.payload ?? []).find((ability) => ability._id === draft.abilityId);
  }, [draft.abilityId, abilitiesQuery.data?.payload]);

  const handleAbilityChange = (value: string | number) => {
    const abilityKey = abilityLookup.get(value as string);
    updateDraft('abilityId', value as string);
    if (abilityKey) {
      updateDraft('abilityKey', abilityKey);
    }
  };

  return (
    <Modal
      open={isModalOpen}
      title={isEditMode ? 'Edit Granted Ability' : 'Add Granted Ability'}
      onCancel={closeModal}
      footer={
        <div className={styles.modalFooterActions}>
          <div>
            {isEditMode ? (
              <Button variant="outline" tone="danger" onClick={handleRemove} disabled={isPending}>
                Remove Ability
              </Button>
            ) : null}
          </div>
          <div className={styles.modalFooterButtons}>
            <Button variant="outline" tone="neutral" onClick={closeModal} disabled={isPending}>
              Cancel
            </Button>
            <Button tone="gold" onClick={handleSubmit} isLoading={isPending}>
              {isEditMode ? 'Save Changes' : 'Add Ability'}
            </Button>
          </div>
        </div>
      }
      width={600}
      centered
      destroyOnClose
    >
      <div className={styles.modalBody}>
        {!isEditMode && (
          <div className={styles.abilitySearchSection}>
            <TextField
              floatingLabel
              label="Search Abilities"
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              placeholder="Search by name, key, tags, or summary..."
              disabled={isPending}
            />
            <div className={styles.gridTwo}>
              <SelectField
                floatingLabel
                label="Filter by Category"
                value={filterCategory}
                onChange={(event) => setFilterCategory(event.target.value as AbilityCategory | '')}
                options={ABILITY_CATEGORY_OPTIONS}
                disabled={isPending}
              />
              <SelectField
                floatingLabel
                label="Filter by Source Type"
                value={filterSourceType}
                onChange={(event) => setFilterSourceType(event.target.value as AbilitySourceType | '')}
                options={ABILITY_SOURCE_TYPE_OPTIONS}
                disabled={isPending}
              />
            </div>
            {!abilitiesQuery.isLoading && <div className={styles.abilityResultCount}>{abilityOptions.length === 1 ? '1 result' : `${abilityOptions.length} results`}</div>}
          </div>
        )}

        <SelectField
          floatingLabel
          label="Ability"
          value={draft.abilityId}
          onChange={(event) => handleAbilityChange(event.target.value)}
          disabled={isPending || isEditMode}
          placeholder={abilityOptions.length ? 'Select an ability...' : 'No matching abilities available'}
          options={abilityOptions}
          error={error || undefined}
          helpText={
            abilitiesQuery.isError
              ? 'Ability options are currently unavailable.'
              : isEditMode
                ? 'The ability cannot be changed in edit mode. Remove and re-add to select a different ability.'
                : abilityOptions.length === 0 && (searchKeyword || filterCategory || filterSourceType)
                  ? 'No abilities match your filters. Try adjusting your search criteria.'
                  : undefined
          }
          autoFocus={!isEditMode}
        />

        {selectedAbility && (
          <div className={styles.abilityPreview}>
            <div className={styles.abilityPreviewHeader}>
              <h3 className={styles.abilityPreviewTitle}>{selectedAbility.name}</h3>
              <div className={styles.abilityPreviewMeta}>
                {selectedAbility.category && <span className={styles.abilityPreviewBadge}>{selectedAbility.category}</span>}
                {selectedAbility.activation && <span className={styles.abilityPreviewBadge}>{selectedAbility.activation}</span>}
                {selectedAbility.usageModel && <span className={styles.abilityPreviewBadge}>{selectedAbility.usageModel}</span>}
              </div>
            </div>

            {selectedAbility.summary && <p className={styles.abilityPreviewSummary}>{selectedAbility.summary}</p>}

            {selectedAbility.effectText && (
              <div className={styles.abilityPreviewEffect}>
                <strong>Effect:</strong> {selectedAbility.effectText}
              </div>
            )}

            {selectedAbility.cost && (
              <div className={styles.abilityPreviewCost}>
                <strong>Cost:</strong>{' '}
                {selectedAbility.cost.resourceKey && (
                  <span>
                    {selectedAbility.cost.amount} {selectedAbility.cost.resourceKey}
                  </span>
                )}
                {selectedAbility.cost.charges && <span>{selectedAbility.cost.charges} charges</span>}
                {selectedAbility.cost.cooldownTurns && <span>{selectedAbility.cost.cooldownTurns} turn cooldown</span>}
              </div>
            )}

            {selectedAbility.tags && selectedAbility.tags.length > 0 && (
              <div className={styles.abilityPreviewTags}>
                {selectedAbility.tags.map((tag) => (
                  <span key={tag} className={styles.abilityPreviewTag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <SelectField
          floatingLabel
          label="Grant Mode"
          value={draft.grantMode ?? 'active'}
          onChange={(event) => updateDraft('grantMode', event.target.value as 'active' | 'passive')}
          disabled={isPending}
          options={GRANT_MODE_OPTIONS}
          helpText="Active abilities must be manually triggered. Passive abilities are always in effect."
        />

        <div className={styles.checkboxField}>
          <Checkbox
            id="requiresEquipped"
            checked={draft.requiresEquipped ?? false}
            onChange={(checked) => updateDraft('requiresEquipped', checked)}
            disabled={isPending}
            label="Requires Equipped"
          />
          <p className={styles.fieldHelpText}>If checked, the ability is only available when the item is equipped. Otherwise, it's available just by owning the item.</p>
        </div>

        <TextAreaField
          floatingLabel
          label="Notes"
          value={draft.notes ?? ''}
          onChange={(event) => updateDraft('notes', event.target.value)}
          disabled={isPending}
          placeholder="Optional notes about how this ability is granted..."
        />
      </div>
    </Modal>
  );
};
