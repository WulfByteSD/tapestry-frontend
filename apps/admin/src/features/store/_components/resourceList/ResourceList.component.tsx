'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardBody, CardHeader, Input, Loader, Modal, SelectField, Table } from '@tapestry/ui';
import type { TableColumn, TableRowAction } from '@tapestry/ui';
import type { LibraryResource } from '@tapestry/types';
import { useDeleteStoreResource, useStoreResources } from '../../_hooks/useStoreResources';
import { buildResourceFilterOptions, formatDate, RESOURCE_PAGE_SIZE } from '../../resource.helpers';
import type { ResourceAccessPolicyFilter, ResourceStatusFilter } from '../../resource.types';
import styles from './ResourceList.module.scss';

type ResourceListProps = {
  onRowClick?: (id: string, label: string) => void;
  onNewResource?: () => void;
};

function getResourceLabel(resource: LibraryResource) {
  return resource.title || resource.slug || resource.key || 'Resource';
}

export default function ResourceList({ onRowClick, onNewResource }: ResourceListProps) {
  const router = useRouter();
  const deleteResource = useDeleteStoreResource();

  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<ResourceStatusFilter>('');
  const [accessPolicyFilter, setAccessPolicyFilter] = useState<ResourceAccessPolicyFilter>('');
  const [page, setPage] = useState(1);
  const [resourceToDelete, setResourceToDelete] = useState<LibraryResource | null>(null);

  const filterOptions = useMemo(() => buildResourceFilterOptions(statusFilter, accessPolicyFilter), [statusFilter, accessPolicyFilter]);

  const resourcesQuery = useStoreResources({
    pageNumber: page,
    pageLimit: RESOURCE_PAGE_SIZE,
    keyword,
    filterOptions,
    sortOptions: '-updatedAt',
  });

  useEffect(() => {
    setPage(1);
  }, [keyword, statusFilter, accessPolicyFilter]);

  const resources = (resourcesQuery.data?.payload ?? []) as LibraryResource[];
  const totalCount = resourcesQuery.data?.metadata?.totalCount ?? 0;

  const columns = useMemo<TableColumn<LibraryResource>[]>(
    () => [
      {
        key: 'title',
        title: 'Resource',
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
        key: 'kind',
        title: 'Kind',
        render: (_value, row) => (
          <div className={styles.kindCell}>
            <strong>{row.kind}</strong>
            <span>{row.format}</span>
          </div>
        ),
      },
      {
        key: 'accessPolicy',
        title: 'Access',
        dataIndex: 'accessPolicy',
        render: (value) => (
          <span className={styles.accessBadge} data-policy={String(value ?? '').toLowerCase()}>
            {String(value ?? '--')}
          </span>
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
        key: 'updatedAt',
        title: 'Updated',
        dataIndex: 'updatedAt',
        align: 'right',
        render: (value) => formatDate(typeof value === 'string' ? value : undefined),
      },
    ],
    []
  );

  const rowActions = useMemo<TableRowAction<LibraryResource>[]>(
    () => [
      {
        key: 'delete',
        label: 'Delete',
        tone: 'danger',
        disabled: deleteResource.isPending,
        onClick: (row) => setResourceToDelete(row),
      },
    ],
    [deleteResource.isPending]
  );

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerCopy}>
          <p className={styles.eyebrow}>Library Admin</p>
          <h1 className={styles.title}>Resources</h1>
          <p className={styles.subtitle}>Create the canonical library resources that commerce products will grant to players later.</p>
        </div>

        <div className={styles.headerActions}>
          <Button variant="ghost" tone="neutral" onClick={() => router.push('/products')}>
            Back to Products
          </Button>
          <Button variant="outline" tone="neutral" onClick={() => (onNewResource ? onNewResource() : router.push('/resources/new'))}>
            New Resource
          </Button>
        </div>
      </div>

      <Card className={styles.filtersCard}>
        <CardHeader className={styles.filtersHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Filters</h2>
            <p className={styles.sectionSubtitle}>Narrow the resource list before editing or linking them into commerce products.</p>
          </div>
        </CardHeader>
        <CardBody className={styles.filtersBody}>
          <div className={styles.filtersGrid}>
            <Input label="Search" placeholder="Search by title, key, slug, summary, or tags..." value={keywordInput} onChange={(event) => setKeywordInput(event.target.value)} />
            <SelectField
              label="Status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as ResourceStatusFilter)}
              options={[
                { label: 'All statuses', value: '' },
                { label: 'Draft', value: 'draft' },
                { label: 'Published', value: 'published' },
                { label: 'Archived', value: 'archived' },
              ]}
            />
            <SelectField
              label="Access Policy"
              value={accessPolicyFilter}
              onChange={(event) => setAccessPolicyFilter(event.target.value as ResourceAccessPolicyFilter)}
              options={[
                { label: 'All access policies', value: '' },
                { label: 'Public', value: 'public' },
                { label: 'Entitlement', value: 'entitlement' },
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
                setAccessPolicyFilter('');
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
          <Table<LibraryResource>
            columns={columns}
            rows={resources}
            rowKey="_id"
            loading={resourcesQuery.isLoading || resourcesQuery.isFetching}
            loadingComponent={<Loader caption="Loading resources..." />}
            onRowClick={(row) => (onRowClick ? onRowClick(row._id, getResourceLabel(row)) : router.push(`/resources/${row._id}`))}
            rowActions={rowActions}
            emptyTitle="No resources found"
            emptyMessage="Create a canonical library resource so the store has something to grant later."
            pagination={{
              page,
              pageSize: RESOURCE_PAGE_SIZE,
              total: totalCount,
              onPageChange: setPage,
            }}
            toolbar={
              <div className={styles.tableToolbar}>
                <div className={styles.tableSummary}>
                  <strong>{totalCount}</strong>
                  <span>total resources</span>
                </div>
              </div>
            }
          />
        </CardBody>
      </Card>

      <Modal
        open={Boolean(resourceToDelete)}
        title="Delete Resource"
        onCancel={() => setResourceToDelete(null)}
        onOk={async () => {
          if (!resourceToDelete) return;
          await deleteResource.mutateAsync(resourceToDelete._id);
          setResourceToDelete(null);
        }}
        confirmLoading={deleteResource.isPending}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ tone: 'danger' }}
      >
        <p>
          Are you sure you want to delete <strong>{resourceToDelete?.title}</strong>?
        </p>
        <p>This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
