'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardBody, Form, Loader, Tabs, deriveApiErrorMessage, useAlert, useForm, type SelectOption } from '@tapestry/ui';
import type { CommerceProduct, CreateProductInput } from '@tapestry/types';
import {
  createLibraryResourceOptionLabel,
  useCreateStoreProduct,
  useDeleteStoreProduct,
  useLibraryResources,
  useStoreProduct,
  useUpdateStoreProduct,
} from '../../_hooks/useStoreProducts';
import { createDefaultProductFormValues, productFormValidators, toProductFormValues, toProductPayload } from '../../store.helpers';
import type { ProductEditorFormValues } from '../../store.types';
import DeleteProductModal from './modals/DeleteProductModal.component';
import styles from './ProductEditor.module.scss';
import { useProductEditorTabs } from './productEditor.tabs';

type ProductEditorProps = {
  id?: string;
  onCreated?: (id: string, label: string) => void;
  onDeleted?: () => void;
  onCancel?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  onLabelChange?: (label: string) => void;
};

function deriveProductLabel(values: Pick<ProductEditorFormValues, 'title' | 'slug' | 'key'>) {
  return values.title.trim() || values.slug.trim() || values.key.trim() || 'Product';
}

function deriveProductLabelFromRecord(product: Pick<CommerceProduct, 'title' | 'slug' | 'key'>) {
  return product.title?.trim() || product.slug?.trim() || product.key?.trim() || 'Product';
}

export default function ProductEditor({ id, onCreated, onDeleted, onCancel, onDirtyChange, onLabelChange }: ProductEditorProps) {
  const router = useRouter();
  const { addAlert } = useAlert();
  const isNew = !id;
  const loadedSnapshotRef = useRef<string | null>(null);
  const onDirtyChangeRef = useRef(onDirtyChange);
  const onLabelChangeRef = useRef(onLabelChange);
  const hostedInWorkspace = Boolean(onCancel || onCreated || onDeleted || onDirtyChange || onLabelChange);

  const productQuery = useStoreProduct(id);
  const libraryResourcesQuery = useLibraryResources({
    pageNumber: 1,
    pageLimit: 200,
    sortOptions: 'title',
  });
  const createProduct = useCreateStoreProduct();
  const updateProduct = useUpdateStoreProduct();
  const deleteProduct = useDeleteStoreProduct();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const form = useForm<ProductEditorFormValues>({
    initialValues: createDefaultProductFormValues(),
    validators: productFormValidators,
    onSubmit: async (values, api) => {
      const payload = toProductPayload(values);

      try {
        if (isNew) {
          const result = await createProduct.mutateAsync(payload);
          const label = deriveProductLabel(values);
          addAlert({
            type: 'success',
            message: 'Product created',
            description: 'The store product has been created successfully.',
          });
          if (onCreated) {
            onCreated(result.payload, label);
          } else {
            router.push(`/products/${result.payload}`);
          }
          return;
        }

        const result = await updateProduct.mutateAsync({
          id: id!,
          payload: payload as Partial<CreateProductInput>,
        });

        api.replaceValues(toProductFormValues(result.payload));
        loadedSnapshotRef.current = `${result.payload._id}:${result.payload.updatedAt}`;
        onLabelChange?.(deriveProductLabelFromRecord(result.payload));

        addAlert({
          type: 'success',
          message: 'Product saved',
          description: 'Your store changes have been saved successfully.',
        });
      } catch (error) {
        addAlert({
          type: 'error',
          message: isNew ? 'Create failed' : 'Save failed',
          description: deriveApiErrorMessage(error, isNew ? 'Failed to create product.' : 'Failed to save product.'),
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

  useEffect(() => {
    const product = productQuery.data?.payload;
    if (!product) return;

    const nextSnapshot = `${product._id}:${product.updatedAt}`;
    if (loadedSnapshotRef.current === nextSnapshot) return;

    form.replaceValues(toProductFormValues(product));
    loadedSnapshotRef.current = nextSnapshot;
    onLabelChangeRef.current?.(deriveProductLabelFromRecord(product));
  }, [form, productQuery.data?.payload]);

  const disabled = createProduct.isPending || updateProduct.isPending || deleteProduct.isPending;
  const resourceOptions = useMemo<SelectOption[]>(
    () =>
      (libraryResourcesQuery.data?.payload ?? []).map((resource) => ({
        label: createLibraryResourceOptionLabel(resource),
        value: resource._id,
      })),
    [libraryResourcesQuery.data?.payload]
  );

  const productTitle = form.values.title || (isNew ? 'New Product' : 'Edit Product');
  const productLabel = form.values.title || form.values.slug || form.values.key;

  const tabItems = useProductEditorTabs({
    form,
    disabled,
    resourceOptions,
    resourceQueryState: libraryResourcesQuery,
  });

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteProduct.mutateAsync(id);
      addAlert({
        type: 'success',
        message: 'Product deleted',
        description: 'The store product has been deleted successfully.',
      });
      if (onDeleted) {
        onDeleted();
      } else {
        router.push('/products');
      }
    } catch (error) {
      addAlert({
        type: 'error',
        message: 'Delete failed',
        description: deriveApiErrorMessage(error, 'Failed to delete product.'),
      });
    }
  };

  if (!isNew && productQuery.isLoading) {
    return (
      <div className={styles.page}>
        <Card>
          <CardBody className={styles.stateCard}>
            <Loader caption="Loading product..." />
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!isNew && (productQuery.isError || !productQuery.data?.payload)) {
    return (
      <div className={styles.page}>
        <Card>
          <CardBody className={styles.stateCard}>
            <div className={styles.stateTitle}>Product not found</div>
            <p className={styles.stateText}>This product could not be loaded. It may have been removed or the id is invalid.</p>
            <div className={styles.stateActions}>
              <Button variant="outline" tone="neutral" onClick={() => (onCancel ? onCancel() : router.push('/products'))}>
                {hostedInWorkspace ? 'Close Tab' : 'Back to Store'}
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
          <p className={styles.eyebrow}>Commerce Admin</p>
          <h1 className={styles.title}>{productTitle}</h1>
          <p className={styles.subtitle}>
            {isNew
              ? 'Create a product record, define its pricing, and wire the fulfillment grants that unlock library access.'
              : 'Update the product catalog entry, its storefront visibility, and any downstream fulfillment grants.'}
          </p>
        </div>

        <div className={styles.headerActions}>
          {hostedInWorkspace ? null : (
            <Button variant="ghost" tone="neutral" onClick={() => router.push('/resources')}>
              Manage Resources
            </Button>
          )}
          <Button variant="ghost" tone="neutral" onClick={() => (onCancel ? onCancel() : router.push('/products'))}>
            {hostedInWorkspace ? 'Close Tab' : 'Back to Store'}
          </Button>
        </div>
      </div>

      <Form form={form} className={styles.form}>
        <Tabs items={tabItems} defaultActiveKey="basics" variant="pills" fit="equal" contentClassName={styles.tabsContent} />

        <div className={styles.footer}>
          <div className={styles.footerActions}>
            <Button type="submit" variant="solid" tone="gold" disabled={disabled || !form.isValid}>
              {createProduct.isPending ? 'Creating...' : updateProduct.isPending ? 'Saving...' : isNew ? 'Create Product' : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" tone="neutral" onClick={() => form.reset()} disabled={disabled}>
              Reset
            </Button>
          </div>

          {!isNew ? (
            <div className={styles.footerDanger}>
              <Button type="button" variant="outline" tone="danger" onClick={() => setDeleteModalOpen(true)} disabled={disabled}>
                Delete Product
              </Button>
            </div>
          ) : null}
        </div>
      </Form>

      <DeleteProductModal open={deleteModalOpen} productLabel={productLabel} loading={deleteProduct.isPending} onConfirm={handleDelete} onClose={() => setDeleteModalOpen(false)} />
    </div>
  );
}
