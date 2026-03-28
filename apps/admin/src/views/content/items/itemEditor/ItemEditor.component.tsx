'use client';

import React, { useEffect, useMemo } from 'react';
import { useAbilities, useDeleteItem, useItem, useUpdateItem } from '@/lib/content-admin';
import { AttackProfile, GrantedAbilityRef } from '@tapestry/types';
import { Button, Card, CardBody, Loader, useAlert, useForm } from '@tapestry/ui';
import { useRouter } from 'next/navigation';
import { ItemEditorFormValues } from './editor.types';
import { useAttackProfileEditor } from './useAttackProfileEditor';
import { AttackProfileModal } from './AttackProfileModal';
import { useGrantedAbilityEditor } from './useGrantedAbilityEditor';
import { GrantedAbilityModal } from './GrantedAbilityModal';
import { CoreDetailsSection } from './CoreDetailsSection';
import { AttackProfilesSection } from './AttackProfilesSection';
import { GrantedAbilitiesSection } from './GrantedAbilitiesSection';

import styles from './ItemEditor.module.scss';

type ItemEditorProps = {
  id?: string;
};

const ItemEditor = ({ id }: ItemEditorProps) => {
  const router = useRouter();
  const { addAlert } = useAlert();

  const itemQuery = useItem(id);
  const abilitiesQuery = useAbilities({ pageNumber: 1, pageLimit: 500, sortOptions: 'name' });
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();

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

  const attackProfileEditor = useAttackProfileEditor({
    itemId: id,
    formValues: form.values,
    onProfilesChange: (profiles) => form.setValue('attackProfiles', profiles),
    replaceFormValues: form.replaceValues,
  });

  const grantedAbilityEditor = useGrantedAbilityEditor({
    itemId: id,
    formValues: form.values,
    onAbilitiesChange: (abilities) => form.setValue('grantedAbilities', abilities),
    replaceFormValues: form.replaceValues,
  });

  const itemTitle = form.values.name || 'Item Editor';
  const attackProfiles = form.values.attackProfiles ?? [];
  const grantedAbilities = form.values.grantedAbilities ?? [];

  const abilitiesLookup = useMemo(() => {
    const map = new Map();
    (abilitiesQuery.data?.payload ?? []).forEach((ability) => {
      map.set(ability._id, ability);
    });
    return map;
  }, [abilitiesQuery.data?.payload]);

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
          <Button variant="ghost" tone="neutral" onClick={() => router.push('/content/items')}>
            Back to Items
          </Button>
        </div>
      </div>

      <CoreDetailsSection form={form} disabled={updateItem.isPending} />

      <AttackProfilesSection
        attackProfiles={attackProfiles}
        onAddProfile={attackProfileEditor.openCreateModal}
        onEditProfile={attackProfileEditor.openEditModal}
        disabled={attackProfileEditor.isPending}
      />

      <GrantedAbilitiesSection
        grantedAbilities={grantedAbilities}
        abilitiesLookup={abilitiesLookup}
        onAddAbility={grantedAbilityEditor.openCreateModal}
        onEditAbility={grantedAbilityEditor.openEditModal}
        disabled={grantedAbilityEditor.isPending}
      />

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

      <AttackProfileModal attackProfileEditor={attackProfileEditor} currentSettingKeys={form.values.settingKeys ?? []} />

      <GrantedAbilityModal grantedAbilityEditor={grantedAbilityEditor} currentSettingKeys={form.values.settingKeys ?? []} />
    </div>
  );
};

export default ItemEditor;
