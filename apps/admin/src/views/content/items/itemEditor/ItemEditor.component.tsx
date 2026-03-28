'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useDeleteItem, useItem, useSkills, useUpdateItem } from '@/lib/content-admin';
import { ASPECT_BLOCKS, AttackProfile, GrantedAbilityRef, ItemDefinition } from '@tapestry/types';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Form,
  FormField,
  FormGroup,
  Loader,
  Modal,
  SelectField,
  TagInputField,
  TextAreaField,
  TextField,
  type SelectOption,
  useAlert,
  useForm,
} from '@tapestry/ui';
import { useRouter } from 'next/navigation';

import styles from './ItemEditor.module.scss';

type ItemEditorProps = {
  id?: string;
};

type ItemEditorFormValues = Omit<ItemDefinition, '_id' | 'createdAt' | 'updatedAt'>;

type AttackProfileDraft = {
  key: string;
  name: string;
  attackKind: AttackProfile['attackKind'] | '';
  defaultAspect: string;
  allowedSkillKeys: string[];
  modifier?: number;
  harm?: number;
  rangeLabel: string;
  tags: string[];
  notes: string;
};

type AttackProfileDraftErrors = Partial<Record<'key' | 'name' | 'modifier' | 'harm', string>>;

const ITEM_SETTING_OPTIONS: SelectOption[] = [
  { label: 'Woven Realms', value: 'woven-realms' },
  { label: 'Neon Lights', value: 'neon-lights' },
];

const ITEM_CATEGORY_OPTIONS: SelectOption[] = [
  { label: 'Weapon', value: 'weapon' },
  { label: 'Armor', value: 'armor' },
  { label: 'Gear', value: 'gear' },
  { label: 'Consumable', value: 'consumable' },
  { label: 'Tool', value: 'tool' },
  { label: 'Currency', value: 'currency' },
  { label: 'Quest', value: 'quest' },
  { label: 'Other', value: 'other' },
];

const ITEM_STATUS_OPTIONS: SelectOption[] = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
];

const ITEM_SLOT_OPTIONS: SelectOption[] = [
  { label: 'None', value: '' },
  { label: 'Head', value: 'head' },
  { label: 'Body', value: 'body' },
  { label: 'Legs', value: 'legs' },
  { label: 'Feet', value: 'feet' },
  { label: 'Hands', value: 'hands' },
  { label: 'Weapon', value: 'weapon' },
  { label: 'Shield', value: 'shield' },
  { label: 'Accessory', value: 'accessory' },
  { label: 'Consumable', value: 'consumable' },
  { label: 'Other', value: 'other' },
];

const ATTACK_KIND_OPTIONS: SelectOption[] = [
  { label: 'None', value: '' },
  { label: 'Melee', value: 'melee' },
  { label: 'Ranged', value: 'ranged' },
  { label: 'Spell', value: 'spell' },
  { label: 'Special', value: 'special' },
];

const ATTACK_PROFILE_ASPECT_OPTIONS: SelectOption[] = [
  { label: 'None', value: '' },
  ...ASPECT_BLOCKS.flatMap((block) =>
    block.keys.map((aspect) => ({
      label: `${aspect.label} (${block.title})`,
      value: `${block.group}.${aspect.key}`,
    }))
  ),
];

const EMPTY_ATTACK_PROFILE_DRAFT: AttackProfileDraft = {
  key: '',
  name: '',
  attackKind: '',
  defaultAspect: '',
  allowedSkillKeys: [],
  modifier: undefined,
  harm: undefined,
  rangeLabel: '',
  tags: [],
  notes: '',
};

function slugifyAttackProfileKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function trimToUndefined(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function createAttackProfileDraft(profile?: AttackProfile | null): AttackProfileDraft {
  if (!profile) {
    return { ...EMPTY_ATTACK_PROFILE_DRAFT };
  }

  return {
    key: profile.key ?? '',
    name: profile.name ?? '',
    attackKind: profile.attackKind ?? '',
    defaultAspect: profile.defaultAspect ?? '',
    allowedSkillKeys: profile.allowedSkillKeys ?? [],
    modifier: typeof profile.modifier === 'number' ? profile.modifier : undefined,
    harm: typeof profile.harm === 'number' ? profile.harm : undefined,
    rangeLabel: profile.rangeLabel ?? '',
    tags: profile.tags ?? [],
    notes: profile.notes ?? '',
  };
}

function normalizeAttackProfileDraft(draft: AttackProfileDraft): AttackProfile {
  const tags = draft.tags.map((tag) => tag.trim()).filter(Boolean);

  return {
    key: draft.key.trim(),
    name: draft.name.trim(),
    attackKind: draft.attackKind || undefined,
    defaultAspect: draft.defaultAspect || undefined,
    allowedSkillKeys: draft.allowedSkillKeys.length ? draft.allowedSkillKeys : undefined,
    modifier: typeof draft.modifier === 'number' ? draft.modifier : undefined,
    harm: typeof draft.harm === 'number' ? draft.harm : undefined,
    rangeLabel: trimToUndefined(draft.rangeLabel),
    tags: tags.length ? tags : undefined,
    notes: trimToUndefined(draft.notes),
  };
}

function validateAttackProfileDraft(draft: AttackProfileDraft, attackProfiles: AttackProfile[], originalAttackProfileKey: string | null): AttackProfileDraftErrors {
  const errors: AttackProfileDraftErrors = {};
  const nextKey = draft.key.trim();

  if (!draft.name.trim()) {
    errors.name = 'Name is required.';
  }

  if (!nextKey) {
    errors.key = 'Key is required.';
  } else {
    const duplicateProfile = attackProfiles.find((profile) => profile.key === nextKey && profile.key !== originalAttackProfileKey);

    if (duplicateProfile) {
      errors.key = 'Key must be unique for this item.';
    }
  }

  if (draft.modifier !== undefined && !Number.isFinite(draft.modifier)) {
    errors.modifier = 'Modifier must be a number.';
  }

  if (draft.harm !== undefined && !Number.isFinite(draft.harm)) {
    errors.harm = 'Harm must be a number.';
  }

  return errors;
}

function formatAttackProfileSummary(profile: AttackProfile) {
  const parts = [profile.key];

  if (profile.attackKind) {
    parts.push(profile.attackKind);
  }

  if (typeof profile.harm === 'number') {
    parts.push(`Harm ${profile.harm}`);
  }

  if (profile.rangeLabel) {
    parts.push(`Range ${profile.rangeLabel}`);
  }

  return parts.join(' - ');
}

const ItemEditor = ({ id }: ItemEditorProps) => {
  const router = useRouter();
  const { addAlert } = useAlert();

  const itemQuery = useItem(id);
  const skillsQuery = useSkills({ pageNumber: 1, pageLimit: 200, sortOptions: 'name' });
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();

  const [isAttackProfileModalOpen, setIsAttackProfileModalOpen] = useState(false);
  const [attackProfileDraft, setAttackProfileDraft] = useState<AttackProfileDraft>({ ...EMPTY_ATTACK_PROFILE_DRAFT });
  const [attackProfileErrors, setAttackProfileErrors] = useState<AttackProfileDraftErrors>({});
  const [originalAttackProfileKey, setOriginalAttackProfileKey] = useState<string | null>(null);
  const [hasCustomAttackProfileKey, setHasCustomAttackProfileKey] = useState(false);

  const form = useForm<ItemEditorFormValues>({
    initialValues: {
      key: '',
      name: '',
      category: 'other',
      status: 'draft',
      settingKeys: [],
      tags: [],
      equippable: false,
      stackable: false,
      notes: '',
      attackProfiles: [] as AttackProfile[],
      grantedAbilities: [] as GrantedAbilityRef[],
      protection: 0,
    },
  });

  const itemTitle = form.values.name || 'Item Editor';
  const attackProfiles = form.values.attackProfiles ?? [];

  const skillOptions = useMemo<SelectOption[]>(() => {
    const currentSettingKeys = new Set(form.values.settingKeys ?? []);

    return (skillsQuery.data?.payload ?? [])
      .filter((skill) => {
        const skillSettingKeys = skill.settingKeys ?? [];
        return skillSettingKeys.includes('shared') || skillSettingKeys.some((settingKey) => currentSettingKeys.has(settingKey));
      })
      .map((skill) => ({
        label: skill.defaultAspect ? `${skill.name} - ${skill.defaultAspect}` : skill.name,
        value: skill.key,
      }));
  }, [form.values.settingKeys, skillsQuery.data?.payload]);

  useEffect(() => {
    if (itemQuery.data?.payload) {
      const { _id, createdAt, updatedAt, ...nextValues } = itemQuery.data.payload;
      form.replaceValues({
        ...nextValues,
      });
    }
  }, [itemQuery.data?.payload]);

  const handleSave = async () => {
    if (!id || !form.isValid) return;

    const nextValues: ItemEditorFormValues = {
      ...form.values,
      attackProfiles,
    };

    try {
      await updateItem.mutateAsync(id, nextValues);
      form.replaceValues(nextValues);

      addAlert({
        type: 'success',
        message: 'Item saved',
        description: 'Your changes have been saved successfully.',
      });
    } catch (error) {
      addAlert({
        type: 'error',
        message: 'Save failed',
        description: 'Failed to save item. Please try again.',
      });
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    const confirmed = confirm('Are you sure you want to delete this item? This action cannot be undone.');
    if (!confirmed) return;

    try {
      await deleteItem.mutateAsync(id);

      addAlert({
        type: 'success',
        message: 'Item deleted',
        description: 'The item has been deleted successfully.',
      });

      router.push('/items');
    } catch (error) {
      addAlert({
        type: 'error',
        message: 'Delete failed',
        description: 'Failed to delete item. Please try again.',
      });
    }
  };

  const closeAttackProfileModal = () => {
    if (updateItem.isPending) return;

    setIsAttackProfileModalOpen(false);
    setOriginalAttackProfileKey(null);
    setHasCustomAttackProfileKey(false);
    setAttackProfileErrors({});
    setAttackProfileDraft({ ...EMPTY_ATTACK_PROFILE_DRAFT });
  };

  const openCreateAttackProfileModal = () => {
    setOriginalAttackProfileKey(null);
    setHasCustomAttackProfileKey(false);
    setAttackProfileErrors({});
    setAttackProfileDraft({ ...EMPTY_ATTACK_PROFILE_DRAFT });
    setIsAttackProfileModalOpen(true);
  };

  const openEditAttackProfileModal = (profile: AttackProfile) => {
    setOriginalAttackProfileKey(profile.key);
    setHasCustomAttackProfileKey(profile.key !== slugifyAttackProfileKey(profile.name));
    setAttackProfileErrors({});
    setAttackProfileDraft(createAttackProfileDraft(profile));
    setIsAttackProfileModalOpen(true);
  };

  const updateAttackProfileDraft = <K extends keyof AttackProfileDraft>(name: K, value: AttackProfileDraft[K]) => {
    setAttackProfileDraft((current) => ({
      ...current,
      [name]: value,
    }));

    setAttackProfileErrors((current) => {
      if (!current[name as keyof AttackProfileDraftErrors]) return current;

      const nextErrors = { ...current };
      delete nextErrors[name as keyof AttackProfileDraftErrors];
      return nextErrors;
    });
  };

  const handleAttackProfileNameChange = (value: string) => {
    setAttackProfileDraft((current) => {
      const nextDraft = {
        ...current,
        name: value,
      };

      if (!hasCustomAttackProfileKey) {
        nextDraft.key = slugifyAttackProfileKey(value);
      }

      return nextDraft;
    });

    setAttackProfileErrors((current) => {
      const nextErrors = { ...current };
      delete nextErrors.name;
      delete nextErrors.key;
      return nextErrors;
    });
  };

  const handleAttackProfileKeyChange = (value: string) => {
    setHasCustomAttackProfileKey(value !== slugifyAttackProfileKey(attackProfileDraft.name));
    updateAttackProfileDraft('key', value);
  };

  const persistAttackProfiles = async (nextProfiles: AttackProfile[], successMessage: string, successDescription: string, errorMessage: string, errorDescription: string) => {
    if (!id) return false;

    const previousProfiles = attackProfiles;
    const nextValues: ItemEditorFormValues = {
      ...form.values,
      attackProfiles: nextProfiles,
    };

    form.setValue('attackProfiles', nextProfiles);

    try {
      await updateItem.mutateAsync(id, nextValues);
      form.replaceValues(nextValues);

      addAlert({
        type: 'success',
        message: successMessage,
        description: successDescription,
      });

      return true;
    } catch (error) {
      form.setValue('attackProfiles', previousProfiles);

      addAlert({
        type: 'error',
        message: errorMessage,
        description: errorDescription,
      });

      return false;
    }
  };

  const handleAttackProfileSubmit = async () => {
    const validationErrors = validateAttackProfileDraft(attackProfileDraft, attackProfiles, originalAttackProfileKey);

    if (Object.keys(validationErrors).length > 0) {
      setAttackProfileErrors(validationErrors);
      return;
    }

    const nextProfile = normalizeAttackProfileDraft(attackProfileDraft);
    const nextProfiles =
      originalAttackProfileKey == null ? [...attackProfiles, nextProfile] : attackProfiles.map((profile) => (profile.key === originalAttackProfileKey ? nextProfile : profile));

    const success = await persistAttackProfiles(
      nextProfiles,
      originalAttackProfileKey == null ? 'Attack profile added' : 'Attack profile saved',
      `${nextProfile.name} was saved to this item immediately.`,
      originalAttackProfileKey == null ? 'Attack profile add failed' : 'Attack profile save failed',
      'The attack profile could not be persisted. Your local change was rolled back.'
    );

    if (success) {
      closeAttackProfileModal();
    }
  };

  const handleAttackProfileRemove = async () => {
    if (!originalAttackProfileKey) return;

    const profileToRemove = attackProfiles.find((profile) => profile.key === originalAttackProfileKey);
    const nextProfiles = attackProfiles.filter((profile) => profile.key !== originalAttackProfileKey);

    const success = await persistAttackProfiles(
      nextProfiles,
      'Attack profile removed',
      `${profileToRemove?.name ?? 'The attack profile'} was removed and synced immediately.`,
      'Attack profile remove failed',
      'The attack profile could not be removed. The saved item data is unchanged.'
    );

    if (success) {
      closeAttackProfileModal();
    }
  };

  if (itemQuery.isLoading) {
    return (
      <div className={styles.page}>
        <Card>
          <CardBody className={styles.stateCard}>
            <Loader caption="Loading item..." />
          </CardBody>
        </Card>
      </div>
    );
  }

  if (itemQuery.isError || !itemQuery.data?.payload) {
    return (
      <div className={styles.page}>
        <Card>
          <CardBody className={styles.stateCard}>
            <div className={styles.stateTitle}>Item not found</div>
            <p className={styles.stateText}>This item could not be loaded. It may have been removed or the id is invalid.</p>
            <div className={styles.stateActions}>
              <Button variant="outline" tone="neutral" onClick={() => router.push('/items')}>
                Back to Items
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerCopy}>
          <p className={styles.eyebrow}>Content Admin</p>
          <h1 className={styles.title}>{itemTitle}</h1>
          <p className={styles.subtitle}>Edit the item definition, then save your changes back to the content library.</p>
        </div>

        <div className={styles.headerActions}>
          <Button variant="ghost" tone="neutral" onClick={() => router.push('/items')}>
            Back to Items
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Core Details</h2>
            <p className={styles.sectionSubtitle}>These fields define the item identity and its content metadata.</p>
          </div>
        </CardHeader>
        <CardBody>
          <Form form={form} className={styles.form}>
            <FormGroup>
              <FormField name="name">
                {(field) => (
                  <TextField
                    floatingLabel
                    id={field.id}
                    label="Name"
                    value={field.value as string}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={field.shouldShowError ? field.error : undefined}
                    inputMode="text"
                    autoComplete="off"
                    disabled={updateItem.isPending}
                  />
                )}
              </FormField>
              <FormField name="key">
                {(field) => (
                  <TextField
                    floatingLabel
                    id={field.id}
                    label="Key"
                    value={field.value as string}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={field.shouldShowError ? field.error : undefined}
                    inputMode="text"
                    autoComplete="off"
                    disabled={updateItem.isPending}
                  />
                )}
              </FormField>
            </FormGroup>
            <FormField name="notes">
              {(field) => (
                <TextAreaField
                  floatingLabel
                  id={field.id}
                  label="Notes"
                  value={field.value as string}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={field.shouldShowError ? field.error : undefined}
                  inputMode="text"
                  autoComplete="off"
                  disabled={updateItem.isPending}
                />
              )}
            </FormField>
            <FormGroup>
              <FormField name="settingKeys">
                {(field) => (
                  <SelectField
                    mode="multiple"
                    floatingLabel
                    id={field.id}
                    label="Associated Settings"
                    value={field.value as (string | number)[]}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={field.shouldShowError ? field.error : undefined}
                    disabled={updateItem.isPending}
                    placeholder="Select setting(s)..."
                    options={ITEM_SETTING_OPTIONS}
                  />
                )}
              </FormField>
            </FormGroup>
            <FormGroup>
              <FormField name="category">
                {(field) => (
                  <SelectField
                    floatingLabel
                    id={field.id}
                    label="Category"
                    value={field.value as string}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={field.shouldShowError ? field.error : undefined}
                    disabled={updateItem.isPending}
                    options={ITEM_CATEGORY_OPTIONS}
                  />
                )}
              </FormField>
              <FormField name="status">
                {(field) => (
                  <SelectField
                    floatingLabel
                    id={field.id}
                    label="Status"
                    value={field.value as string}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={field.shouldShowError ? field.error : undefined}
                    disabled={updateItem.isPending}
                    options={ITEM_STATUS_OPTIONS}
                  />
                )}
              </FormField>
            </FormGroup>
            <FormGroup>
              <FormField name="protection">
                {(field) => (
                  <TextField
                    floatingLabel
                    id={field.id}
                    label="Protection"
                    type="number"
                    value={field.value as number}
                    valueMode="number"
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={field.shouldShowError ? field.error : undefined}
                    disabled={updateItem.isPending}
                    placeholder="0"
                  />
                )}
              </FormField>
              <FormField name="slot">
                {(field) => (
                  <SelectField
                    floatingLabel
                    id={field.id}
                    label="Equipment Slot"
                    value={field.value as string}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={field.shouldShowError ? field.error : undefined}
                    disabled={updateItem.isPending || !form.values.equippable}
                    placeholder="Select slot..."
                    options={ITEM_SLOT_OPTIONS}
                  />
                )}
              </FormField>
            </FormGroup>
            <FormGroup>
              <FormField name="equippable">
                {(field) => (
                  <div className={styles.checkboxField}>
                    <Checkbox id={field.id} checked={field.value as boolean} onChange={field.onChange} disabled={updateItem.isPending} label="Equippable" />
                  </div>
                )}
              </FormField>
              <FormField name="stackable">
                {(field) => (
                  <div className={styles.checkboxField}>
                    <Checkbox id={field.id} checked={field.value as boolean} onChange={field.onChange} disabled={updateItem.isPending} label="Stackable" />
                  </div>
                )}
              </FormField>
            </FormGroup>
            <FormField name="tags">
              {(field) => (
                <TagInputField
                  floatingLabel
                  id={field.id}
                  label="Tags"
                  value={field.value as string[]}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={field.shouldShowError ? field.error : undefined}
                  disabled={updateItem.isPending}
                  placeholder="Type a tag and press comma or enter..."
                />
              )}
            </FormField>
          </Form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Attack Profiles</h2>
            <p className={styles.sectionSubtitle}>Add named attack modes for this item. Creating, editing, or removing a profile saves the item immediately.</p>
          </div>

          <Button variant="outline" tone="neutral" onClick={openCreateAttackProfileModal} disabled={updateItem.isPending}>
            + Add Attack Profile
          </Button>
        </CardHeader>
        <CardBody>
          {!attackProfiles.length ? (
            <div className={styles.attackProfileEmpty}>
              <p className={styles.attackProfileEmptyTitle}>No attack profiles yet.</p>
              <p className={styles.attackProfileEmptyText}>Add one when this item needs named attacks, alternate firing modes, or different aspect and skill rules.</p>
            </div>
          ) : (
            <div className={styles.attackProfileList}>
              {attackProfiles.map((profile) => (
                <button key={profile.key} type="button" className={styles.attackProfileCard} onClick={() => openEditAttackProfileModal(profile)} disabled={updateItem.isPending}>
                  <div className={styles.attackProfileCardHeader}>
                    <div>
                      <div className={styles.attackProfileName}>{profile.name}</div>
                      <div className={styles.attackProfileMeta}>{formatAttackProfileSummary(profile)}</div>
                    </div>
                    <span className={styles.attackProfileEditHint}>Edit</span>
                  </div>

                  <div className={styles.attackProfileDetails}>
                    {profile.defaultAspect && <span>Aspect: {profile.defaultAspect}</span>}
                    {profile.allowedSkillKeys?.length ? <span>Skills: {profile.allowedSkillKeys.length}</span> : <span>Skills: Any</span>}
                    {profile.tags?.length ? <span>Tags: {profile.tags.join(', ')}</span> : null}
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <div className={styles.footer}>
        <div className={styles.footerActions}>
          <Button variant="solid" tone="gold" onClick={handleSave} disabled={updateItem.isPending || !form.isValid}>
            {updateItem.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button variant="outline" tone="neutral" onClick={() => form.reset()} disabled={updateItem.isPending}>
            Reset
          </Button>
        </div>
        <div className={styles.footerDanger}>
          <Button variant="outline" tone="danger" onClick={handleDelete} disabled={deleteItem.isPending}>
            {deleteItem.isPending ? 'Deleting...' : 'Delete Item'}
          </Button>
        </div>
      </div>

      <Modal
        open={isAttackProfileModalOpen}
        title={originalAttackProfileKey == null ? 'Add Attack Profile' : `Edit ${attackProfileDraft.name || 'Attack Profile'}`}
        onCancel={closeAttackProfileModal}
        footer={
          <div className={styles.modalFooterActions}>
            <div>
              {originalAttackProfileKey ? (
                <Button variant="outline" tone="danger" onClick={handleAttackProfileRemove} disabled={updateItem.isPending}>
                  Remove Profile
                </Button>
              ) : null}
            </div>
            <div className={styles.modalFooterButtons}>
              <Button variant="outline" tone="neutral" onClick={closeAttackProfileModal} disabled={updateItem.isPending}>
                Cancel
              </Button>
              <Button tone="gold" onClick={handleAttackProfileSubmit} isLoading={updateItem.isPending}>
                {originalAttackProfileKey == null ? 'Add Profile' : 'Save Profile'}
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
              value={attackProfileDraft.name}
              onChange={(event) => handleAttackProfileNameChange(event.target.value)}
              error={attackProfileErrors.name}
              disabled={updateItem.isPending}
              autoFocus
            />
            <TextField
              floatingLabel
              label="Profile Key"
              value={attackProfileDraft.key}
              onChange={(event) => handleAttackProfileKeyChange(event.target.value)}
              error={attackProfileErrors.key}
              disabled={updateItem.isPending}
            />
          </div>

          <div className={styles.gridThree}>
            <SelectField
              floatingLabel
              label="Attack Kind"
              value={attackProfileDraft.attackKind}
              onChange={(event) => updateAttackProfileDraft('attackKind', event.target.value as AttackProfileDraft['attackKind'])}
              disabled={updateItem.isPending}
              options={ATTACK_KIND_OPTIONS}
            />
            <SelectField
              floatingLabel
              label="Default Aspect"
              value={attackProfileDraft.defaultAspect}
              onChange={(event) => updateAttackProfileDraft('defaultAspect', event.target.value)}
              disabled={updateItem.isPending}
              options={ATTACK_PROFILE_ASPECT_OPTIONS}
            />
            <SelectField
              mode="multiple"
              floatingLabel
              label="Allowed Skills"
              value={attackProfileDraft.allowedSkillKeys}
              onChange={(value) => updateAttackProfileDraft('allowedSkillKeys', value as string[])}
              disabled={updateItem.isPending}
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
              value={attackProfileDraft.modifier ?? ''}
              valueMode="number"
              onChange={(value) => updateAttackProfileDraft('modifier', value as number | undefined)}
              error={attackProfileErrors.modifier}
              disabled={updateItem.isPending}
              placeholder="0"
            />
            <TextField
              floatingLabel
              label="Harm"
              type="number"
              value={attackProfileDraft.harm ?? ''}
              valueMode="number"
              onChange={(value) => updateAttackProfileDraft('harm', value as number | undefined)}
              error={attackProfileErrors.harm}
              disabled={updateItem.isPending}
              placeholder="0"
            />
            <TextField
              floatingLabel
              label="Range Label"
              value={attackProfileDraft.rangeLabel}
              onChange={(event) => updateAttackProfileDraft('rangeLabel', event.target.value)}
              disabled={updateItem.isPending}
              placeholder="Close, 30 ft, across the room..."
            />
          </div>

          <TagInputField
            floatingLabel
            label="Tags"
            value={attackProfileDraft.tags}
            onChange={(value) => updateAttackProfileDraft('tags', value as string[])}
            disabled={updateItem.isPending}
            placeholder="Type a tag and press comma or enter..."
          />

          <TextAreaField
            floatingLabel
            label="Notes"
            value={attackProfileDraft.notes}
            onChange={(event) => updateAttackProfileDraft('notes', event.target.value)}
            disabled={updateItem.isPending}
            placeholder="Optional internal notes about this profile..."
          />
        </div>
      </Modal>
    </div>
  );
};

export default ItemEditor;
