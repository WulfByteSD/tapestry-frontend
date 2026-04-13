'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardBody, CardHeader, Input, Loader, Modal, SelectField, Table } from '@tapestry/ui';
import type { TableColumn, TableRowAction } from '@tapestry/ui';
import type { ItemDefinition, SettingDefinition } from '@tapestry/types';
import { useDeleteItem, useItems } from '@/lib/content-admin';
import { ImportCsvModal } from '@/features/content/_components/importCsvModal';
import { ExportCsvModal } from '@/features/content/_components/exportCsvModal';
import styles from './ItemsView.module.scss';

const PAGE_SIZE = 10;

type ItemStatusFilter = '' | 'draft' | 'published' | 'archived';

function formatDate(value?: string) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

type ItemsListPageProps = {
  selectedSetting?: SettingDefinition;
  /** Called when the user clicks a row. When absent, falls back to router navigation. */
  onRowClick?: (id: string, name: string) => void;
  /** Called when the user clicks "New Item". When absent, falls back to router navigation. */
  onNewItem?: () => void;
};

export default function ItemsListView({ selectedSetting, onRowClick, onNewItem }: ItemsListPageProps) {
  const router = useRouter();
  const deleteItem = useDeleteItem();

  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<ItemStatusFilter>('');
  const [page, setPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ItemDefinition | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const filterOptions = useMemo(() => {
    let filterOptions = '';
    // if there is a selected setting, add it to the filter, $in the settingKeys array
    if (selectedSetting) {
      filterOptions += `settingKeys;{"$in":"${selectedSetting.key}"}`;
    }
    if (statusFilter) {
      if (filterOptions) filterOptions += '|';
      filterOptions += `status;${statusFilter}`;
    }
    return filterOptions || undefined;
  }, [statusFilter, selectedSetting]);

  const itemsQuery = useItems({
    pageNumber: page,
    pageLimit: PAGE_SIZE,
    keyword,
    filterOptions,
    sortOptions: '-updatedAt',
  });

  useEffect(() => {
    setPage(1);
  }, [keyword, statusFilter]);

  const items = itemsQuery.data?.payload ?? [];
  const metadata = itemsQuery.data?.metadata;
  const totalCount = metadata?.totalCount ?? 0;

  const columns = useMemo<TableColumn<ItemDefinition>[]>(
    () => [
      {
        key: 'name',
        title: 'Name',
        dataIndex: 'name',
        render: (value) => (
          <div className={styles.primaryCell}>
            <strong>{String(value ?? '—')}</strong>
          </div>
        ),
      },
      {
        key: 'key',
        title: 'Key',
        dataIndex: 'key',
        render: (value) => <code className={styles.code}>{String(value ?? '—')}</code>,
      },
      {
        key: 'category',
        title: 'Category',
        dataIndex: 'category',
      },
      {
        key: 'settings',
        title: 'Settings',
        render: (_, row) => <div className={styles.settingList}>{(row.settingKeys ?? []).length > 0 ? row.settingKeys.join(', ') : '—'}</div>,
      },
      {
        key: 'status',
        title: 'Status',
        dataIndex: 'status',
        render: (value) => (
          <span className={styles.statusBadge} data-status={String(value ?? '').toLowerCase()}>
            {String(value ?? '—')}
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

  const handleDeleteClick = (row: ItemDefinition) => {
    setItemToDelete(row);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      await deleteItem.mutateAsync(itemToDelete._id);
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const rowActions = useMemo<TableRowAction<ItemDefinition>[]>(
    () => [
      {
        key: 'delete',
        label: 'Delete',
        tone: 'danger',
        disabled: deleteItem.isPending,
        onClick: handleDeleteClick,
      },
    ],
    [deleteItem.isPending]
  );

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerCopy}>
          <p className={styles.eyebrow}>Content Admin</p>
          <h1 className={styles.title}>Items</h1>
          <p className={styles.subtitle}>Browse, filter, open, and remove item definitions from the content library.</p>
        </div>

        <div className={styles.headerActions}>
          <Button variant="ghost" tone="neutral" onClick={() => setImportModalOpen(true)}>
            Import CSV
          </Button>
          <Button variant="ghost" tone="neutral" onClick={() => setExportModalOpen(true)}>
            Export CSV
          </Button>
          <Button variant="outline" tone="neutral" onClick={() => (onNewItem ? onNewItem() : router.push('/content/items/new'))}>
            New Item
          </Button>
        </div>
      </div>

      <Card className={styles.filtersCard}>
        <CardHeader className={styles.filtersHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Filters</h2>
            <p className={styles.sectionSubtitle}>Narrow the item list before drilling into a record.</p>
          </div>
        </CardHeader>

        <CardBody className={styles.filtersBody}>
          <div className={styles.filtersGrid}>
            <Input label="Search" placeholder="Search by name, key, notes, tags..." value={keywordInput} onChange={(event) => setKeywordInput(event.target.value)} />

            <SelectField
              label="Status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as ItemStatusFilter)}
              options={[
                { label: 'All statuses', value: '' },
                { label: 'Published', value: 'published' },
                { label: 'Draft', value: 'draft' },
                { label: 'Archived', value: 'archived' },
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
          <Table<ItemDefinition>
            columns={columns}
            rows={items}
            rowKey="_id"
            loading={itemsQuery.isLoading || itemsQuery.isFetching}
            loadingComponent={<Loader label="Loading items" />}
            onRowClick={(row) => (onRowClick ? onRowClick(row._id, row.name) : router.push(`/content/items/${row._id}`))}
            rowActions={rowActions}
            emptyTitle="No items found"
            emptyMessage="Try adjusting your filters or create a new item."
            pagination={{
              page,
              pageSize: PAGE_SIZE,
              total: totalCount,
              onPageChange: setPage,
            }}
            toolbar={
              <div className={styles.tableToolbar}>
                <div className={styles.tableSummary}>
                  <strong>{totalCount}</strong>
                  <span>total items</span>
                </div>
              </div>
            }
          />
        </CardBody>
      </Card>

      <Modal
        open={deleteModalOpen}
        title="Delete Item"
        onCancel={handleDeleteCancel}
        onOk={handleDeleteConfirm}
        confirmLoading={deleteItem.isPending}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ tone: 'danger' }}
      >
        <p>
          Are you sure you want to delete <strong>{itemToDelete?.name}</strong>?
        </p>
        <p>This action cannot be undone.</p>
      </Modal>

      <ImportCsvModal open={importModalOpen} onClose={() => setImportModalOpen(false)} resource="items" />
      <ExportCsvModal open={exportModalOpen} onClose={() => setExportModalOpen(false)} resource="items" initialSettingKey={selectedSetting?.key} />
    </div>
  );
}
