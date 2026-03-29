'use client';

import React, { useEffect, useState } from 'react';
import { useCreateSkill, useDeleteSkill, useSkill, useUpdateSkill } from '@/lib/content-admin';
import { Button, Card, CardBody, Loader, Modal, useAlert, useForm } from '@tapestry/ui';
import { useRouter } from 'next/navigation';
import { SkillEditorFormValues } from './editor.types';
import { getDefaultSkillFormValues } from './editor.helpers';
import { CoreDetailsSection } from './CoreDetailsSection';

import styles from './SkillEditor.module.scss';

type SkillEditorProps = {
  id?: string;
};

const SkillEditor = ({ id }: SkillEditorProps) => {
  const router = useRouter();
  const { addAlert } = useAlert();

  const isEditMode = Boolean(id);
  const skillQuery = useSkill(id);
  const createSkill = useCreateSkill();
  const updateSkill = useUpdateSkill();
  const deleteSkill = useDeleteSkill();

  const form = useForm<SkillEditorFormValues>({
    initialValues: getDefaultSkillFormValues(),
  });

  const skillTitle = form.values.name || (isEditMode ? 'Skill Editor' : 'New Skill');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (skillQuery.data?.payload) {
      const { _id, createdAt, updatedAt, ...nextValues } = skillQuery.data.payload;
      form.replaceValues({
        ...nextValues,
      });
    }
  }, [skillQuery.data?.payload]);

  const handleSave = async () => {
    if (!form.isValid) return;

    try {
      if (isEditMode && id) {
        await updateSkill.mutateAsync(id, form.values);

        addAlert({
          type: 'success',
          message: 'Skill saved',
          description: 'Your changes have been saved successfully.',
        });
      } else {
        const response = await createSkill.mutateAsync(form.values);

        addAlert({
          type: 'success',
          message: 'Skill created',
          description: 'The skill has been created successfully.',
        });

        // Navigate to the edit page with the new id
        if (response.payload) {
          router.push(`/content/skills/${response.payload}`);
        }
      }
    } catch (error) {
      addAlert({
        type: 'error',
        message: isEditMode ? 'Save failed' : 'Create failed',
        description: `Failed to ${isEditMode ? 'save' : 'create'} skill. Please try again.`,
      });
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;

    try {
      await deleteSkill.mutateAsync(id);

      addAlert({
        type: 'success',
        message: 'Skill deleted',
        description: 'The skill has been deleted successfully.',
      });

      setIsDeleteModalOpen(false);
      router.push('/content/skills');
    } catch (error) {
      addAlert({
        type: 'error',
        message: 'Delete failed',
        description: 'Failed to delete skill. Please try again.',
      });
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };

  if (isEditMode && skillQuery.isLoading) {
    return (
      <div className={styles.page}>
        <Card>
          <CardBody className={styles.stateCard}>
            <Loader caption="Loading skill..." />
          </CardBody>
        </Card>
      </div>
    );
  }

  if (isEditMode && (skillQuery.isError || !skillQuery.data?.payload)) {
    return (
      <div className={styles.page}>
        <Card>
          <CardBody className={styles.stateCard}>
            <div className={styles.stateTitle}>Skill not found</div>
            <p className={styles.stateText}>This skill could not be loaded. It may have been removed or the id is invalid.</p>
            <div className={styles.stateActions}>
              <Button variant="outline" tone="neutral" onClick={() => router.push('/content/skills')}>
                Back to Skills
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  const isSaving = isEditMode ? updateSkill.isPending : createSkill.isPending;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerCopy}>
          <p className={styles.eyebrow}>Content Admin</p>
          <h1 className={styles.title}>{skillTitle}</h1>
          <p className={styles.subtitle}>
            {isEditMode ? 'Edit the skill definition, then save your changes back to the content library.' : 'Create a new skill definition for the content library.'}
          </p>
        </div>

        <div className={styles.headerActions}>
          <Button variant="ghost" tone="neutral" onClick={() => router.push('/content/skills')}>
            Back to Skills
          </Button>
        </div>
      </div>

      <CoreDetailsSection form={form} disabled={isSaving} />

      <div className={styles.footer}>
        <div className={styles.footerActions}>
          <Button variant="solid" tone="gold" onClick={handleSave} disabled={isSaving || !form.isValid}>
            {isSaving ? (isEditMode ? 'Saving...' : 'Creating...') : isEditMode ? 'Save Changes' : 'Create Skill'}
          </Button>
          <Button variant="outline" tone="neutral" onClick={() => form.reset()} disabled={isSaving}>
            Reset
          </Button>
        </div>
        {isEditMode && (
          <div className={styles.footerDanger}>
            <Button variant="outline" tone="danger" onClick={handleDeleteClick} disabled={deleteSkill.isPending}>
              Delete Skill
            </Button>
          </div>
        )}
      </div>

      <Modal
        open={isDeleteModalOpen}
        title="Delete Skill"
        onCancel={handleDeleteCancel}
        onOk={handleDeleteConfirm}
        confirmLoading={deleteSkill.isPending}
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

export default SkillEditor;
