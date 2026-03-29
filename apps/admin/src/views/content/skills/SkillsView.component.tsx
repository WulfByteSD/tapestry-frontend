'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardBody, CardHeader, Input, Loader, Modal, SelectField, Table } from '@tapestry/ui';
import type { TableColumn, TableRowAction } from '@tapestry/ui';
import type { SkillDefinition, SettingDefinition } from '@tapestry/types';
import { useDeleteSkill, useSkills } from '@/lib/content-admin';
import styles from './SkillsView.module.scss';

const PAGE_SIZE = 10;

type SkillStatusFilter = '' | 'draft' | 'published' | 'archived';
type SkillCategoryFilter = '' | 'social' | 'combat' | 'technical' | 'knowledge' | 'survival' | 'magic' | 'other';

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

type SkillsListPageProps = {
  selectedSetting?: SettingDefinition;
};

export default function SkillsListView({ selectedSetting }: SkillsListPageProps) {
  const router = useRouter();
  const deleteSkill = useDeleteSkill();

  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<SkillStatusFilter>('');
  const [categoryFilter, setCategoryFilter] = useState<SkillCategoryFilter>('');
  const [page, setPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<SkillDefinition | null>(null);

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

  const skillsQuery = useSkills({
    pageNumber: page,
    pageLimit: PAGE_SIZE,
    keyword,
    filterOptions,
    sortOptions: '-updatedAt',
  });

  useEffect(() => {
    setPage(1);
  }, [keyword, statusFilter, categoryFilter]);

  const skills = skillsQuery.data?.payload ?? [];
  const metadata = skillsQuery.data?.metadata;
  const totalCount = metadata?.totalCount ?? 0;

  const columns = useMemo<TableColumn<SkillDefinition>[]>(
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
        key: 'defaultAspect',
        title: 'Aspect',
        dataIndex: 'defaultAspect',
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

  const handleDeleteClick = (row: SkillDefinition) => {
    setSkillToDelete(row);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!skillToDelete) return;

    try {
      await deleteSkill.mutateAsync(skillToDelete._id);
      setDeleteModalOpen(false);
      setSkillToDelete(null);
    } catch (error) {
      console.error('Failed to delete skill:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSkillToDelete(null);
  };

  const rowActions = useMemo<TableRowAction<SkillDefinition>[]>(
    () => [
      {
        key: 'delete',
        label: 'Delete',
        tone: 'danger',
        disabled: deleteSkill.isPending,
        onClick: handleDeleteClick,
      },
    ],
    [deleteSkill.isPending]
  );

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerCopy}>
          <p className={styles.eyebrow}>Content Admin</p>
          <h1 className={styles.title}>Skills</h1>
          <p className={styles.subtitle}>Browse, filter, open, and remove skill definitions from the content library.</p>
        </div>

        <div className={styles.headerActions}>
          <Button variant="outline" tone="neutral" onClick={() => router.push('/content/skills/new')}>
            New Skill
          </Button>
        </div>
      </div>

      <Card className={styles.filtersCard}>
        <CardHeader className={styles.filtersHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Filters</h2>
            <p className={styles.sectionSubtitle}>Narrow the skill list before drilling into a record.</p>
          </div>
        </CardHeader>

        <CardBody className={styles.filtersBody}>
          <div className={styles.filtersGrid}>
            <Input label="Search" placeholder="Search by name, key, notes, tags..." value={keywordInput} onChange={(event) => setKeywordInput(event.target.value)} />

            <SelectField
              label="Status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as SkillStatusFilter)}
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
              onChange={(event) => setCategoryFilter(event.target.value as SkillCategoryFilter)}
              options={[
                { label: 'All categories', value: '' },
                { label: 'Social', value: 'social' },
                { label: 'Combat', value: 'combat' },
                { label: 'Technical', value: 'technical' },
                { label: 'Knowledge', value: 'knowledge' },
                { label: 'Survival', value: 'survival' },
                { label: 'Magic', value: 'magic' },
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
          <Table<SkillDefinition>
            columns={columns}
            rows={skills}
            rowKey="_id"
            loading={skillsQuery.isLoading || skillsQuery.isFetching}
            loadingComponent={<Loader label="Loading skills" />}
            onRowClick={(row) => router.push(`/content/skills/${row._id}`)}
            rowActions={rowActions}
            emptyTitle="No skills found"
            emptyMessage="Try adjusting your filters or create a new skill."
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
                  <span>total skills</span>
                </div>
              </div>
            }
          />
        </CardBody>
      </Card>

      <Modal
        open={deleteModalOpen}
        title="Delete Skill"
        onCancel={handleDeleteCancel}
        onOk={handleDeleteConfirm}
        confirmLoading={deleteSkill.isPending}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ tone: 'danger' }}
      >
        <p>
          Are you sure you want to delete <strong>{skillToDelete?.name}</strong>?
        </p>
        <p>This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
