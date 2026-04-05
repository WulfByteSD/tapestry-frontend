'use client';

import React, { useEffect, useState } from 'react';
import { useCreateAbility, useDeleteAbility, useAbility, useUpdateAbility } from '@/lib/content-admin';
import { Button, Card, CardBody, Loader, Modal, useAlert, useForm } from '@tapestry/ui';
import { useRouter } from 'next/navigation';
import { AbilityEditorFormValues } from './editor.types';
import { getDefaultAbilityFormValues } from './editor.helpers';
import { CoreDetailsSection } from './CoreDetailsSection';

import styles from './AbilityEditor.module.scss';

type AbilityEditorProps = {
  id?: string;
};

const AbilityEditor = ({ id }: AbilityEditorProps) => {
  const router = useRouter();
  const { addAlert } = useAlert();

  const isEditMode = Boolean(id);
  const abilityQuery = useAbility(id);
  const createAbility = useCreateAbility();
  const updateAbility = useUpdateAbility();
  const deleteAbility = useDeleteAbility();

  const form = useForm<AbilityEditorFormValues>({
    initialValues: getDefaultAbilityFormValues(),
  });

  const abilityTitle = form.values.name || (isEditMode ? 'Ability Editor' : 'New Ability');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (abilityQuery.data?.payload) {
      const { _id, createdAt, updatedAt, ...nextValues } = abilityQuery.data.payload;
      form.replaceValues({
        ...nextValues,
      });
    }
  }, [abilityQuery.data?.payload]);

  const handleSave = async () => {
    if (!form.isValid) return;

    try {
      if (isEditMode && id) {
        await updateAbility.mutateAsync(id, form.values);

        addAlert({
          type: 'success',
          message: 'Ability saved',
          description: 'Your changes have been saved successfully.',
        });
      } else {
        const response = await createAbility.mutateAsync(form.values);

        addAlert({
          type: 'success',
          message: 'Ability created',
          description: 'The ability has been created successfully.',
        });

        // Navigate to the edit page with the new id
        if (response.payload) {
          router.push(`/content/abilities/${response.payload}`);
        }
      }
    } catch (error) {
      addAlert({
        type: 'error',
        message: isEditMode ? 'Save failed' : 'Create failed',
        description: `Failed to ${isEditMode ? 'save' : 'create'} ability. Please try again.`,
      });
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;

    try {
      await deleteAbility.mutateAsync(id);

      addAlert({
        type: 'success',
        message: 'Ability deleted',
        description: 'The ability has been deleted successfully.',
      });

      setIsDeleteModalOpen(false);
      router.push('/content/abilities');
    } catch (error) {
      addAlert({
        type: 'error',
        message: 'Delete failed',
        description: 'Failed to delete ability. Please try again.',
      });
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };

  if (isEditMode && abilityQuery.isLoading) {
    return (
      <div className={styles.page}>
        <Card>
          <CardBody className={styles.stateCard}>
            <Loader caption="Loading ability..." />
          </CardBody>
        </Card>
      </div>
    );
  }

  if (isEditMode && (abilityQuery.isError || !abilityQuery.data?.payload)) {
    return (
      <div className={styles.page}>
        <Card>
          <CardBody className={styles.stateCard}>
            <div className={styles.stateTitle}>Ability not found</div>
            <p className={styles.stateText}>This ability could not be loaded. It may have been removed or the id is invalid.</p>
            <div className={styles.stateActions}>
              <Button variant="outline" tone="neutral" onClick={() => router.push('/content/abilities')}>
                Back to Abilities
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  const isSaving = isEditMode ? updateAbility.isPending : createAbility.isPending;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerCopy}>
          <p className={styles.eyebrow}>Content Admin</p>
          <h1 className={styles.title}>{abilityTitle}</h1>
          <p className={styles.subtitle}>
            {isEditMode ? 'Edit the ability definition, then save your changes back to the content library.' : 'Create a new ability definition for the content library.'}
          </p>
        </div>

        <div className={styles.headerActions}>
          <Button variant="ghost" tone="neutral" onClick={() => router.push('/content/abilities')}>
            Back to Abilities
          </Button>
        </div>
      </div>

      <CoreDetailsSection form={form} disabled={isSaving} />

      <div className={styles.footer}>
        <div className={styles.footerActions}>
          <Button variant="solid" tone="gold" onClick={handleSave} disabled={isSaving || !form.isValid}>
            {isSaving ? (isEditMode ? 'Saving...' : 'Creating...') : isEditMode ? 'Save Changes' : 'Create Ability'}
          </Button>
          <Button variant="outline" tone="neutral" onClick={() => form.reset()} disabled={isSaving}>
            Reset
          </Button>
        </div>
        {isEditMode && (
          <div className={styles.footerDanger}>
            <Button variant="outline" tone="danger" onClick={handleDeleteClick} disabled={deleteAbility.isPending}>
              Delete Ability
            </Button>
          </div>
        )}
      </div>

      <Modal
        open={isDeleteModalOpen}
        title="Delete Ability"
        onCancel={handleDeleteCancel}
        onOk={handleDeleteConfirm}
        confirmLoading={deleteAbility.isPending}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ tone: 'danger' }}
      >
        <p>
          Are you sure you want to delete <strong>{form.values.name}</strong>?
        </p>
        <p>This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default AbilityEditor;
