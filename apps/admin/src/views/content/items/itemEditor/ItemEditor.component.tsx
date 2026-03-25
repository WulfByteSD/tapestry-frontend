'use client';
import React, { useEffect, useMemo } from 'react';
import { useDeleteItem, useItem, useUpdateItem } from '@/lib/content-admin';
import { AttackProfile, GrantedAbilityRef, InventoryCategory, ItemDefinition } from '@tapestry/types';
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
  SelectField,
  TagInputField,
  TextAreaField,
  TextField,
  useAlert,
  useForm,
} from '@tapestry/ui';
import { useRouter } from 'next/navigation';

import styles from './ItemEditor.module.scss';

type ItemEditorProps = {
  id?: string;
};

const ItemEditor = ({ id }: ItemEditorProps) => {
  const router = useRouter();
  const { addAlert } = useAlert();

  const itemQuery = useItem(id);
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();

  const form = useForm<Omit<ItemDefinition, '_id' | 'createdAt' | 'updatedAt'>>({
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

  const handleSave = async () => {
    if (!id || !form.isValid) return;

    try {
      await updateItem.mutateAsync(id, form.values);

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

  const title = useMemo(() => {
    if (!form.getValue('name')) return 'Item Editor';
    return form.getValue('name');
  }, [form.getValue('name')]);
  useEffect(() => {
    if (itemQuery.data?.payload) {
      const { payload } = itemQuery.data;
      form.setValues({
        ...payload,
      });
    }
  }, [itemQuery.data]);
  if (itemQuery.isLoading || !form) {
    return (
      <div className={styles.page}>
        <Card>
          <CardBody className={styles.stateCard}>
            <Loader caption="Loading item…" />
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
          <h1 className={styles.title}>{title}</h1>
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
                    options={[
                      { label: 'Woven Realms', value: 'woven-realms' },
                      { label: 'Neon Lights', value: 'neon-lights' },
                    ]}
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
                    options={[
                      { label: 'Weapon', value: 'weapon' },
                      { label: 'Armor', value: 'armor' },
                      { label: 'Gear', value: 'gear' },
                      { label: 'Consumable', value: 'consumable' },
                      { label: 'Tool', value: 'tool' },
                      { label: 'Currency', value: 'currency' },
                      { label: 'Quest', value: 'quest' },
                      { label: 'Other', value: 'other' },
                    ]}
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
                    options={[
                      { label: 'Draft', value: 'draft' },
                      { label: 'Published', value: 'published' },
                      { label: 'Archived', value: 'archived' },
                    ]}
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
                    value={String(field.value ?? '')}
                    onChange={(value) => field.onChange(value ? Number(value) : undefined)}
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
                    disabled={updateItem.isPending || !form.getValue('equippable')}
                    placeholder="Select slot..."
                    options={[
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
                    ]}
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
    </div>
  );
};

export default ItemEditor;
