'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { LibraryResource } from '@tapestry/types';
import { Button, Card, CardBody, Form, Loader, Tabs, deriveApiErrorMessage, useAlert, useForm } from '@tapestry/ui';
import { createDefaultResourceFormValues, resourceFormValidators, toResourceFormValues, toResourcePayload } from '../../resource.helpers';
import type { ResourceEditorFormValues } from '../../resource.types';
import { useCreateStoreResource, useDeleteStoreResource, useStoreResource, useUpdateStoreResource, useUploadStoreResourceFile } from '../../_hooks/useStoreResources';
import DeleteResourceModal from './modals/DeleteResourceModal.component';
import { useResourceReleaseUpload } from './hooks/useResourceReleaseUpload';
import styles from './ResourceEditor.module.scss';
import { useResourceEditorTabs } from './resourceEditor.tabs';

type ResourceEditorProps = {
  id?: string;
  onCreated?: (id: string, label: string) => void;
  onDeleted?: () => void;
  onCancel?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  onLabelChange?: (label: string) => void;
};

function deriveResourceLabel(values: Pick<ResourceEditorFormValues, 'title' | 'slug' | 'key'>) {
  return values.title.trim() || values.slug.trim() || values.key.trim() || 'Resource';
}

function deriveResourceLabelFromRecord(resource: Pick<LibraryResource, 'title' | 'slug' | 'key'>) {
  return resource.title?.trim() || resource.slug?.trim() || resource.key?.trim() || 'Resource';
}

export default function ResourceEditor({ id, onCreated, onDeleted, onCancel, onDirtyChange, onLabelChange }: ResourceEditorProps) {
  const router = useRouter();
  const { addAlert } = useAlert();
  const isNew = !id;
  const loadedSnapshotRef = useRef<string | null>(null);
  const onDirtyChangeRef = useRef(onDirtyChange);
  const onLabelChangeRef = useRef(onLabelChange);
  const hostedInWorkspace = Boolean(onCancel || onCreated || onDeleted || onDirtyChange || onLabelChange);

  const resourceQuery = useStoreResource(id);
  const createResource = useCreateStoreResource();
  const updateResource = useUpdateStoreResource();
  const deleteResource = useDeleteStoreResource();
  const uploadResourceFile = useUploadStoreResourceFile();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const form = useForm<ResourceEditorFormValues>({
    initialValues: createDefaultResourceFormValues(),
    validators: resourceFormValidators,
    onSubmit: async (values, api) => {
      const payload = toResourcePayload(values);

      try {
        if (isNew) {
          const result = await createResource.mutateAsync(payload);
          const label = deriveResourceLabel(values);
          addAlert({
            type: 'success',
            message: 'Resource created',
            description: 'The canonical library resource has been created successfully.',
          });
          if (onCreated) {
            onCreated(result.payload, label);
          } else {
            router.push(`/resources/${result.payload}`);
          }
          return;
        }

        const result = await updateResource.mutateAsync({
          id: id!,
          payload,
        });

        api.replaceValues(toResourceFormValues(result.payload));
        loadedSnapshotRef.current = `${result.payload._id}:${result.payload.updatedAt}`;
        onLabelChange?.(deriveResourceLabelFromRecord(result.payload));

        addAlert({
          type: 'success',
          message: 'Resource saved',
          description: 'Your library resource changes have been saved successfully.',
        });
      } catch (error) {
        addAlert({
          type: 'error',
          message: isNew ? 'Create failed' : 'Save failed',
          description: deriveApiErrorMessage(error, isNew ? 'Failed to create resource.' : 'Failed to save resource.'),
        });
      }
    },
  });

  useEffect(() => {
    onDirtyChangeRef.current = onDirtyChange;
  }, [onDirtyChange]);

  useEffect(() => {
    onLabelChangeRef.current = onLabelChange;
  }, [onLabelChange]);

  useEffect(() => {
    onDirtyChangeRef.current?.(form.isDirty);
  }, [form.isDirty]);

  const { beforeUpload, fileList, handleFileChange, handleFileRemove, isUploading, resetForNewResource, syncWithValues, uploadPreviewUrl, uploadResourceType } =
    useResourceReleaseUpload({
      addAlert,
      form,
      uploadResourceFile,
    });

  const resetToCurrentSnapshot = useCallback(() => {
    if (isNew) {
      const defaults = createDefaultResourceFormValues();
      form.replaceValues(defaults);
      resetForNewResource();
      return;
    }

    const resource = resourceQuery.data?.payload;
    if (!resource) {
      form.reset();
      return;
    }

    const nextValues = toResourceFormValues(resource);
    form.replaceValues(nextValues);
    syncWithValues(nextValues);
    onLabelChangeRef.current?.(deriveResourceLabel(nextValues));
  }, [form, isNew, resetForNewResource, resourceQuery.data?.payload, syncWithValues]);

  useEffect(() => {
    const resource = resourceQuery.data?.payload;
    if (!resource) return;

    const nextSnapshot = `${resource._id}:${resource.updatedAt}`;
    if (loadedSnapshotRef.current === nextSnapshot) return;

    const nextValues = toResourceFormValues(resource);
    form.replaceValues(nextValues);
    syncWithValues(nextValues);
    loadedSnapshotRef.current = nextSnapshot;
    onLabelChangeRef.current?.(deriveResourceLabelFromRecord(resource));
  }, [form, resourceQuery.data?.payload, syncWithValues]);

  const disabled = createResource.isPending || updateResource.isPending || deleteResource.isPending;
  const resourceTitle = form.values.title || (isNew ? 'New Resource' : 'Edit Resource');
  const resourceLabel = form.values.title || form.values.slug || form.values.key;
  const tabItems = useResourceEditorTabs({
    form,
    disabled,
    fileList,
    onFileChange: handleFileChange,
    onFileRemove: handleFileRemove,
    beforeUpload,
    isUploading,
    uploadPreviewUrl,
    uploadResourceType,
  });

  const handleDelete = useCallback(async () => {
    if (!id) return;

    try {
      await deleteResource.mutateAsync(id);
      addAlert({
        type: 'success',
        message: 'Resource deleted',
        description: 'The library resource has been deleted successfully.',
      });
      if (onDeleted) {
        onDeleted();
      } else {
        router.push('/resources');
      }
    } catch (error) {
      addAlert({
        type: 'error',
        message: 'Delete failed',
        description: deriveApiErrorMessage(error, 'Failed to delete resource.'),
      });
    }
  }, [addAlert, deleteResource, id, onDeleted, router]);

  if (!isNew && resourceQuery.isLoading) {
    return (
      <div className={styles.page}>
        <Card>
          <CardBody className={styles.stateCard}>
            <Loader caption="Loading resource..." />
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!isNew && (resourceQuery.isError || !resourceQuery.data?.payload)) {
    return (
      <div className={styles.page}>
        <Card>
          <CardBody className={styles.stateCard}>
            <div className={styles.stateTitle}>Resource not found</div>
            <p className={styles.stateText}>This resource could not be loaded. It may have been removed or the id is invalid.</p>
            <div className={styles.stateActions}>
              <Button variant="outline" tone="neutral" onClick={() => (onCancel ? onCancel() : router.push('/resources'))}>
                {hostedInWorkspace ? 'Close Tab' : 'Back to Resources'}
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
          <p className={styles.eyebrow}>Library Admin</p>
          <h1 className={styles.title}>{resourceTitle}</h1>
          <p className={styles.subtitle}>
            {isNew
              ? 'Create the canonical library resource, upload its Cloudinary-backed document, and prepare it for future commerce grants.'
              : 'Update the canonical library resource record, its delivery metadata, and the imagery used around it.'}
          </p>
        </div>

        <div className={styles.headerActions}>
          <Button variant="ghost" tone="neutral" onClick={() => (onCancel ? onCancel() : router.push('/resources'))}>
            {hostedInWorkspace ? 'Close Tab' : 'Back to Resources'}
          </Button>
          {!hostedInWorkspace ? (
            <Button variant="ghost" tone="neutral" onClick={() => router.push('/products')}>
              Back to Products
            </Button>
          ) : null}
        </div>
      </div>

      <Form form={form} className={styles.form}>
        <Tabs items={tabItems} defaultActiveKey="basics" variant="pills" fit="equal" contentClassName={styles.tabsContent} />

        <div className={styles.footer}>
          <div className={styles.footerActions}>
            <Button type="submit" variant="solid" tone="gold" disabled={disabled || !form.isValid || isUploading}>
              {createResource.isPending ? 'Creating...' : updateResource.isPending ? 'Saving...' : isNew ? 'Create Resource' : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" tone="neutral" onClick={resetToCurrentSnapshot} disabled={disabled}>
              Reset
            </Button>
          </div>

          {!isNew ? (
            <div className={styles.footerDanger}>
              <Button type="button" variant="outline" tone="danger" onClick={() => setDeleteModalOpen(true)} disabled={disabled}>
                Delete Resource
              </Button>
            </div>
          ) : null}
        </div>
      </Form>

      <DeleteResourceModal
        open={deleteModalOpen}
        resourceLabel={resourceLabel}
        loading={deleteResource.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
