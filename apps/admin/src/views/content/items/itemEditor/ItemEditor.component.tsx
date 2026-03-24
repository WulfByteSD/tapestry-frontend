'use client';
import React, { useEffect, useMemo } from 'react';
import { useDeleteItem, useItem, useUpdateItem } from '@/lib/content-admin';
import { AttackProfile, GrantedAbilityRef, InventoryCategory, ItemDefinition } from '@tapestry/types';
import { Button, Card, CardBody, CardHeader, Form, FormField, FormGroup, Loader, TagInputField, TextAreaField, TextField, useAlert, useForm } from '@tapestry/ui';
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
    </div>
  );
};

export default ItemEditor;
