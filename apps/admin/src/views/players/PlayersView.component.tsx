'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardBody, CardHeader, Input, SelectField, Table, type TableColumn } from '@tapestry/ui';
import type { PlayerWithAuth } from '@tapestry/types';
import { usePlayerList } from '@/lib/player-admin';
import styles from './PlayersView.module.scss';

const PAGE_SIZE = 20;

type RoleFilter = '' | 'player' | 'storyweaver';

function formatDate(value?: string | Date) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function PlayersView() {
  const router = useRouter();

  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('');
  const [page, setPage] = useState(1);

  // Build filter string for API
  const filterOptions = useMemo(() => {
    const filters: string[] = [];

    if (roleFilter) {
      // Filter by role: roles array contains the selected role
      filters.push(`roles;{"$in":"${roleFilter}"}`);
    }

    return filters.length > 0 ? filters.join('|') : undefined;
  }, [roleFilter]);

  // Fetch players with current filters
  const { data, isLoading, isError } = usePlayerList({
    pageNumber: page,
    pageLimit: PAGE_SIZE,
    keyword,
    filterOptions,
    sortOptions: '-createdAt',
  });

  const players = data?.payload ?? [];
  const totalCount = data?.metadata?.totalCount ?? 0;

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [keyword, roleFilter]);

  const columns: TableColumn<PlayerWithAuth>[] = [
    {
      key: 'displayName',
      title: 'Display Name',
      dataIndex: 'displayName',
      render: (value, row) => (
        <div className={styles.primaryCell}>
          <strong>{String(value || row.auth?.email || '—')}</strong>
        </div>
      ),
    },
    {
      key: 'email',
      title: 'Email',
      render: (_, row) => <span className={styles.email}>{row.auth?.email || '—'}</span>,
    },
    {
      key: 'roles',
      title: 'Roles',
      dataIndex: 'roles',
      render: (value) => {
        const roles = Array.isArray(value) ? value : [];
        return (
          <div className={styles.roleList}>
            {roles.map((role) => (
              <span key={role} className={styles.roleBadge} data-role={role}>
                {role}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'isActive',
      title: 'Status',
      render: (_, row) => (
        <span className={styles.statusBadge} data-active={row.auth?.isActive ?? true}>
          {row.auth?.isActive !== false ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      title: 'Joined',
      dataIndex: 'createdAt',
      align: 'right',
      render: (value) => formatDate(value as string | Date),
    },
  ];

  const handleSearch = () => {
    setKeyword(keywordInput);
    setPage(1);
  };

  const handleClearFilters = () => {
    setKeywordInput('');
    setKeyword('');
    setRoleFilter('');
    setPage(1);
  };

  if (isError) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <h2>Error loading players</h2>
          <p>There was a problem loading the player list. Please try again.</p>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerCopy}>
          <p className={styles.eyebrow}>Platform Admin</p>
          <h1 className={styles.title}>Players</h1>
          <p className={styles.subtitle}>Browse and manage player accounts, profiles, and associated resources.</p>
        </div>
      </div>

      <Card className={styles.filtersCard}>
        <CardHeader className={styles.filtersHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Filters</h2>
            <p className={styles.sectionSubtitle}>Search and filter the player list.</p>
          </div>
        </CardHeader>

        <CardBody className={styles.filtersBody}>
          <div className={styles.filtersGrid}>
            <Input
              label="Search"
              placeholder="Search by display name or email..."
              value={keywordInput}
              onChange={(event) => setKeywordInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleSearch();
                }
              }}
            />

            <SelectField
              label="Role"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
              options={[
                { label: 'All roles', value: '' },
                { label: 'Player', value: 'player' },
                { label: 'Storyweaver', value: 'storyweaver' },
              ]}
            />
          </div>

          <div className={styles.filterActions}>
            <Button tone="gold" onClick={handleSearch}>
              Apply Filters
            </Button>
            <Button variant="outline" tone="neutral" onClick={handleClearFilters}>
              Clear
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <Table
          columns={columns}
          rows={players}
          rowKey="_id"
          loading={isLoading}
          loadingMessage="Loading players..."
          emptyTitle="No players found"
          emptyMessage="No players match your current filters. Try adjusting your search criteria."
          onRowClick={(row) => router.push(`/players/${row._id}`)}
          pagination={{
            page,
            pageSize: PAGE_SIZE,
            total: totalCount,
            onPageChange: setPage,
          }}
        />
      </Card>
    </div>
  );
}
