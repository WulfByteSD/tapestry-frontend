'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardBody, CardHeader, Input, Loader, Modal, SelectField, Table } from '@tapestry/ui';
import type { TableColumn, TableRowAction } from '@tapestry/ui';
import type { AbilityDefinition, SettingDefinition } from '@tapestry/types';
import { useDeleteAbility, useAbilities } from '@/lib/content-admin';
import { ImportCsvModal } from '@/features/content/_components/importCsvModal';
import styles from './AbilitiesView.module.scss';

const PAGE_SIZE = 10;

type AbilityStatusFilter = '' | 'draft' | 'published' | 'archived';
type AbilityCategoryFilter = '' | 'spell' | 'technique' | 'augment' | 'program' | 'prayer' | 'mutation' | 'feature' | 'other';

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

type AbilitiesViewProps = {
  selectedSetting?: SettingDefinition;
};

export default function AbilitiesView({ selectedSetting }: AbilitiesViewProps) {
  const router = useRouter();
  const deleteAbility = useDeleteAbility();

  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<AbilityStatusFilter>('');
  const [categoryFilter, setCategoryFilter] = useState<AbilityCategoryFilter>('');
  const [page, setPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [abilityToDelete, setAbilityToDelete] = useState<AbilityDefinition | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

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
    if (categoryFilter) {
      if (filterOptions) filterOptions += '|';
      filterOptions += `category;${categoryFilter}`;
    }
    return filterOptions || undefined;
  }, [statusFilter, categoryFilter, selectedSetting]);

  const abilitiesQuery = useAbilities({
    pageNumber: page,
    pageLimit: PAGE_SIZE,
    keyword,
    filterOptions,
    sortOptions: '-updatedAt',
  });

  useEffect(() => {
    setPage(1);
  }, [keyword, statusFilter, categoryFilter]);

  const abilities = abilitiesQuery.data?.payload ?? [];
  const metadata = abilitiesQuery.data?.metadata;
  const totalCount = metadata?.totalCount ?? 0;

  const columns = useMemo<TableColumn<AbilityDefinition>[]>(
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
        render: (value) => String(value ?? '—'),
      },
      {
        key: 'activation',
        title: 'Activation',
        dataIndex: 'activation',
        render: (value) => String(value ?? '—'),
      },
      {
        key: 'usageModel',
        title: 'Usage',
        dataIndex: 'usageModel',
        render: (value) => String(value ?? '—'),
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

  const handleDeleteClick = (row: AbilityDefinition) => {
    setAbilityToDelete(row);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!abilityToDelete) return;

    try {
      await deleteAbility.mutateAsync(abilityToDelete._id);
      setDeleteModalOpen(false);
      setAbilityToDelete(null);
    } catch (error) {
      console.error('Failed to delete ability:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setAbilityToDelete(null);
  };

  const rowActions = useMemo<TableRowAction<AbilityDefinition>[]>(
    () => [
      {
        key: 'delete',
        label: 'Delete',
        tone: 'danger',
        disabled: deleteAbility.isPending,
        onClick: handleDeleteClick,
      },
    ],
    [deleteAbility.isPending]
  );

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerCopy}>
          <p className={styles.eyebrow}>Content Admin</p>
          <h1 className={styles.title}>Abilities</h1>
          <p className={styles.subtitle}>Browse, filter, open, and remove ability definitions from the content library.</p>
        </div>

        <div className={styles.headerActions}>
          <Button variant="ghost" tone="neutral" onClick={() => setImportModalOpen(true)}>
            Import CSV
          </Button>
          <Button variant="outline" tone="neutral" onClick={() => router.push('/content/abilities/new')}>
            New Ability
          </Button>
        </div>
      </div>

      <Card className={styles.filtersCard}>
        <CardHeader className={styles.filtersHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Filters</h2>
            <p className={styles.sectionSubtitle}>Narrow the ability list before drilling into a record.</p>
          </div>
        </CardHeader>

        <CardBody className={styles.filtersBody}>
          <div className={styles.filtersGrid}>
            <Input label="Search" placeholder="Search by name, key, notes, tags..." value={keywordInput} onChange={(event) => setKeywordInput(event.target.value)} />

            <SelectField
              label="Status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as AbilityStatusFilter)}
              options={[
                { label: 'All statuses', value: '' },
                { label: 'Published', value: 'published' },
                { label: 'Draft', value: 'draft' },
                { label: 'Archived', value: 'archived' },
              ]}
            />

            <SelectField
              label="Category"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value as AbilityCategoryFilter)}
              options={[
                { label: 'All categories', value: '' },
                { label: 'Spell', value: 'spell' },
                { label: 'Technique', value: 'technique' },
                { label: 'Augment', value: 'augment' },
                { label: 'Program', value: 'program' },
                { label: 'Prayer', value: 'prayer' },
                { label: 'Mutation', value: 'mutation' },
                { label: 'Feature', value: 'feature' },
                { label: 'Other', value: 'other' },
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
                setCategoryFilter('');
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
          <Table<AbilityDefinition>
            columns={columns}
            rows={abilities}
            rowKey="_id"
            loading={abilitiesQuery.isLoading || abilitiesQuery.isFetching}
            loadingComponent={<Loader label="Loading abilities" />}
            onRowClick={(row) => router.push(`/content/abilities/${row._id}`)}
            rowActions={rowActions}
            emptyTitle="No abilities found"
            emptyMessage="Try adjusting your filters or create a new ability."
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
                  <span>total abilities</span>
                </div>
              </div>
            }
          />
        </CardBody>
      </Card>

      <Modal
        open={deleteModalOpen}
        title="Delete Ability"
        onCancel={handleDeleteCancel}
        onOk={handleDeleteConfirm}
        confirmLoading={deleteAbility.isPending}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ tone: 'danger' }}
      >
        <p>
          Are you sure you want to delete <strong>{abilityToDelete?.name}</strong>?
        </p>
        <p>This action cannot be undone.</p>
      </Modal>

      <ImportCsvModal open={importModalOpen} onClose={() => setImportModalOpen(false)} resource="abilities" />
    </div>
  );
}
