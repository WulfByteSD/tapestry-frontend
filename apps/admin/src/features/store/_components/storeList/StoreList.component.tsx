'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardBody, CardHeader, Input, Loader, Modal, SelectField, Table } from '@tapestry/ui';
import type { TableColumn, TableRowAction } from '@tapestry/ui';
import type { CommerceProduct } from '@tapestry/types';
import { useDeleteStoreProduct, useStoreProducts } from '../../_hooks/useStoreProducts';
import { buildStoreFilterOptions, formatDate, formatPriceLabel, getGrantSummary, STORE_PAGE_SIZE } from '../../store.helpers';
import type { StoreStatusFilter, StoreVisibilityFilter } from '../../store.types';
import styles from './StoreList.module.scss';

type StoreListProps = {
  onRowClick?: (id: string, label: string) => void;
  onNewProduct?: () => void;
};

function getProductLabel(product: CommerceProduct) {
  return product.title || product.slug || product.key || 'Product';
}

export default function StoreList({ onRowClick, onNewProduct }: StoreListProps) {
  const router = useRouter();
  const deleteProduct = useDeleteStoreProduct();

  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<StoreStatusFilter>('');
  const [visibilityFilter, setVisibilityFilter] = useState<StoreVisibilityFilter>('');
  const [page, setPage] = useState(1);
  const [productToDelete, setProductToDelete] = useState<CommerceProduct | null>(null);

  const filterOptions = useMemo(() => buildStoreFilterOptions(statusFilter, visibilityFilter), [statusFilter, visibilityFilter]);

  const productsQuery = useStoreProducts({
    pageNumber: page,
    pageLimit: STORE_PAGE_SIZE,
    keyword,
    filterOptions,
    sortOptions: '-updatedAt',
  });

  useEffect(() => {
    setPage(1);
  }, [keyword, statusFilter, visibilityFilter]);

  const products = productsQuery.data?.payload ?? [];
  const totalCount = productsQuery.data?.metadata?.totalCount ?? 0;

  const columns = useMemo<TableColumn<CommerceProduct>[]>(
    () => [
      {
        key: 'title',
        title: 'Product',
        dataIndex: 'title',
        render: (_value, row) => (
          <div className={styles.primaryCell}>
            <strong>{row.title || '--'}</strong>
            <span>{row.subtitle || row.summary || row.slug}</span>
          </div>
        ),
      },
      {
        key: 'key',
        title: 'Key',
        dataIndex: 'key',
        render: (value) => <code className={styles.code}>{String(value ?? '--')}</code>,
      },
      {
        key: 'pricing',
        title: 'Price',
        render: (_value, row) => <span className={styles.priceLabel}>{formatPriceLabel(row)}</span>,
      },
      {
        key: 'fulfillment',
        title: 'Fulfillment',
        render: (_value, row) => (
          <div className={styles.fulfillmentCell}>
            <strong>{row.fulfillment.kind}</strong>
            <span>{getGrantSummary(row)}</span>
          </div>
        ),
      },
      {
        key: 'status',
        title: 'Status',
        dataIndex: 'status',
        render: (value) => (
          <span className={styles.statusBadge} data-status={String(value ?? '').toLowerCase()}>
            {String(value ?? '--')}
          </span>
        ),
      },
      {
        key: 'visibility',
        title: 'Visibility',
        dataIndex: 'visibility',
        render: (value) => (
          <span className={styles.visibilityBadge} data-visibility={String(value ?? '').toLowerCase()}>
            {String(value ?? '--')}
          </span>
        ),
      },
      {
        key: 'updatedAt',
        title: 'Updated',
        dataIndex: 'updatedAt',
        align: 'right',
        render: (value) => formatDate(typeof value === 'string' ? value : undefined),
      },
    ],
    []
  );

  const rowActions = useMemo<TableRowAction<CommerceProduct>[]>(
    () => [
      {
        key: 'delete',
        label: 'Delete',
        tone: 'danger',
        disabled: deleteProduct.isPending,
        onClick: (row) => setProductToDelete(row),
      },
    ],
    [deleteProduct.isPending]
  );

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerCopy}>
          <p className={styles.eyebrow}>Commerce Admin</p>
          <h1 className={styles.title}>Store</h1>
          <p className={styles.subtitle}>Manage the product catalog, visibility, and fulfillment grants that power the commerce store.</p>
        </div>

        <div className={styles.headerActions}>
          <Button variant="ghost" tone="neutral" onClick={() => router.push('/resources')}>
            Manage Resources
          </Button>
          <Button variant="outline" tone="neutral" onClick={() => (onNewProduct ? onNewProduct() : router.push('/products/new'))}>
            New Product
          </Button>
        </div>
      </div>

      <Card className={styles.filtersCard}>
        <CardHeader className={styles.filtersHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Filters</h2>
            <p className={styles.sectionSubtitle}>Narrow the product list before opening an editor or cleaning up stale entries.</p>
          </div>
        </CardHeader>
        <CardBody className={styles.filtersBody}>
          <div className={styles.filtersGrid}>
            <Input label="Search" placeholder="Search by title, key, slug, description, or tags..." value={keywordInput} onChange={(event) => setKeywordInput(event.target.value)} />
            <SelectField
              label="Status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StoreStatusFilter)}
              options={[
                { label: 'All statuses', value: '' },
                { label: 'Draft', value: 'draft' },
                { label: 'Published', value: 'published' },
                { label: 'Archived', value: 'archived' },
              ]}
            />
            <SelectField
              label="Visibility"
              value={visibilityFilter}
              onChange={(event) => setVisibilityFilter(event.target.value as StoreVisibilityFilter)}
              options={[
                { label: 'All visibility', value: '' },
                { label: 'Public', value: 'public' },
                { label: 'Unlisted', value: 'unlisted' },
                { label: 'Private', value: 'private' },
              ]}
            />
          </div>

          <div className={styles.filterActions}>
            <Button
              tone="gold"
              onClick={() => {
                setKeyword(keywordInput.trim());
                setPage(1);
              }}
            >
              Apply Filters
            </Button>

            <Button
              variant="ghost"
              tone="neutral"
              onClick={() => {
                setKeywordInput('');
                setKeyword('');
                setStatusFilter('');
                setVisibilityFilter('');
                setPage(1);
              }}
            >
              Clear
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card className={styles.tableCard}>
        <CardBody className={styles.tableBody}>
          <Table<CommerceProduct>
            columns={columns}
            rows={products}
            rowKey="_id"
            loading={productsQuery.isLoading || productsQuery.isFetching}
            loadingComponent={<Loader caption="Loading products..." />}
            onRowClick={(row) => (onRowClick ? onRowClick(row._id, getProductLabel(row)) : router.push(`/products/${row._id}`))}
            rowActions={rowActions}
            emptyTitle="No products found"
            emptyMessage="Try adjusting your filters or create a new product."
            pagination={{
              page,
              pageSize: STORE_PAGE_SIZE,
              total: totalCount,
              onPageChange: setPage,
            }}
            toolbar={
              <div className={styles.tableToolbar}>
                <div className={styles.tableSummary}>
                  <strong>{totalCount}</strong>
                  <span>total products</span>
                </div>
              </div>
            }
          />
        </CardBody>
      </Card>

      <Modal
        open={Boolean(productToDelete)}
        title="Delete Product"
        onCancel={() => setProductToDelete(null)}
        onOk={async () => {
          if (!productToDelete) return;
          await deleteProduct.mutateAsync(productToDelete._id);
          setProductToDelete(null);
        }}
        confirmLoading={deleteProduct.isPending}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ tone: 'danger' }}
      >
        <p>
          Are you sure you want to delete <strong>{productToDelete?.title}</strong>?
        </p>
        <p>This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
