'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal, Button, Loader } from '@tapestry/ui';
import { api } from '@/lib/api';
import { buildFilterString, getItems, getSettings } from '@tapestry/api-client';
import type { CharacterSheet, InventoryCategory, ItemDefinition } from '@tapestry/types';
import { ContentLibraryFilters, DEFAULT_FILTERS, type LibraryFilters } from './ContentLibraryFilters';
import { ContentLibraryItemCard } from './ContentLibraryItemCard';
import styles from './ContentLibraryModal.module.scss';

// ── Constants ──────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;
const LARGE_BATCH = 200;

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Build a server-side category filterOptions fragment.
 * Single value: "category;weapon"
 * Multiple values: 'category;{"$in":"weapon,armor"}'   (matches admin $in convention)
 */
function buildCategoryFragment(categories: InventoryCategory[]): string | null {
  if (categories.length === 0) return null;
  if (categories.length === 1) return `category;${categories[0]}`;
  return `category;{"$in":"${categories.join(',')}"}`;
}

function getItemHarm(item: ItemDefinition): number | null {
  const harm = item.attackProfiles?.[0]?.harm;
  return typeof harm === 'number' ? harm : null;
}

// ── Component ──────────────────────────────────────────────────────────────

type Props = {
  open: boolean;
  onClose: () => void;
  sheet: CharacterSheet;
  onAddItem: (item: ItemDefinition, settingKey: string) => void;
};

export function ContentLibraryModal({ open, onClose, sheet, onAddItem }: Props) {
  const [selectedSettingKey, setSelectedSettingKey] = useState(sheet.settingKey ?? '');
  const [filters, setFilters] = useState<LibraryFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  // ── Settings ───────────────────────────────────────────────────────────

  const settingsQuery = useQuery({
    queryKey: ['content:settings'],
    queryFn: () => getSettings(api, { pageLimit: 50, sortOptions: 'name' }),
  });

  const settings = settingsQuery.data?.payload ?? [];

  useEffect(() => {
    if (sheet.settingKey) {
      setSelectedSettingKey(sheet.settingKey);
      return;
    }
    if (!selectedSettingKey && settings.length > 0) {
      setSelectedSettingKey(settings[0].key);
    }
  }, [sheet.settingKey, selectedSettingKey, settings]);

  const effectiveSettingKey = sheet.settingKey || selectedSettingKey || settings[0]?.key || '';

  // ── Query strategy ─────────────────────────────────────────────────────
  // clientMode = true when range or text search is active.
  // In clientMode we fetch a large batch and do client-side filtering + pagination.
  // Otherwise we use server-side pagination with smaller pages.

  const rangeActive = filters.rangeMode !== 'none';
  const searchActive = filters.search.trim() !== '';
  const clientMode = rangeActive || searchActive;

  const baseFilterString = buildFilterString({ settingKeys: [effectiveSettingKey], status: 'published' });
  const categoryFragment = buildCategoryFragment(filters.categories);
  const filterOptions = [baseFilterString, categoryFragment].filter(Boolean).join('|') || undefined;

  const itemsQuery = useQuery({
    queryKey: ['content:items:library', filterOptions, clientMode, clientMode ? 1 : page],
    enabled: open && !!effectiveSettingKey,
    queryFn: () =>
      getItems(api, {
        filterOptions,
        sortOptions: 'category;name',
        pageLimit: clientMode ? LARGE_BATCH : PAGE_SIZE,
        pageNumber: clientMode ? 1 : page,
      }),
  });

  // Reset to page 1 whenever any filter changes
  function applyFilters(next: LibraryFilters) {
    setFilters(next);
    setPage(1);
  }

  function handleSettingChange(key: string) {
    setSelectedSettingKey(key);
    setPage(1);
  }

  // ── Data derivation ────────────────────────────────────────────────────

  const rawItems = itemsQuery.data?.payload ?? [];
  const serverMetadata = itemsQuery.data?.metadata;

  // Client-side text search
  const searchFiltered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    if (!q) return rawItems;
    return rawItems.filter((item) => {
      const haystack = [item.name, item.key, item.category, item.notes ?? '', ...(item.tags ?? [])].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [rawItems, filters.search]);

  // Client-side range filter (only runs when rangeActive)
  const rangeFiltered = useMemo(() => {
    if (!rangeActive) return searchFiltered;

    const minStr = filters.rangeMode === 'protection' ? filters.protectionMin : filters.harmMin;
    const maxStr = filters.rangeMode === 'protection' ? filters.protectionMax : filters.harmMax;
    const min = minStr !== '' ? Number(minStr) : null;
    const max = maxStr !== '' ? Number(maxStr) : null;

    return searchFiltered.filter((item) => {
      const val = filters.rangeMode === 'protection' ? (item.protection ?? null) : getItemHarm(item);
      if (val === null) return false;
      if (min !== null && val < min) return false;
      if (max !== null && val > max) return false;
      return true;
    });
  }, [searchFiltered, rangeActive, filters.rangeMode, filters.protectionMin, filters.protectionMax, filters.harmMin, filters.harmMax]);

  // Pagination math
  const totalCount = clientMode ? rangeFiltered.length : (serverMetadata?.totalCount ?? rawItems.length);
  const totalPages = clientMode ? Math.max(1, Math.ceil(rangeFiltered.length / PAGE_SIZE)) : Math.max(1, serverMetadata?.pages ?? 1);

  const displayedItems = clientMode ? rangeFiltered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : rangeFiltered;

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <Modal open={open} onCancel={onClose} footer={null} title="Add from Content Library" width={820} destroyOnClose>
      <div className={styles.root}>
        <ContentLibraryFilters
          filters={filters}
          onChange={applyFilters}
          settings={settings}
          settingKey={effectiveSettingKey}
          onSettingChange={handleSettingChange}
          settingLocked={!!sheet.settingKey}
          settingsLoading={settingsQuery.isLoading}
        />

        {itemsQuery.isLoading ? (
          <div className={styles.empty}>
            <Loader size="md" tone="gold" label="Loading items..." />
          </div>
        ) : displayedItems.length === 0 ? (
          <div className={styles.empty}>No items matched your filters.</div>
        ) : (
          <div className={styles.list}>
            {displayedItems.map((item) => (
              <ContentLibraryItemCard key={item._id} item={item} onAdd={() => onAddItem(item, effectiveSettingKey)} />
            ))}
          </div>
        )}

        {/* Pagination bar — visible when there are results */}
        {!itemsQuery.isLoading && totalCount > 0 && (
          <div className={styles.pagination}>
            {totalPages > 1 && (
              <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                ← Prev
              </Button>
            )}

            <span className={styles.pageInfo}>
              {totalPages > 1 && `Page ${page} of ${totalPages} · `}
              {totalCount} {totalCount === 1 ? 'item' : 'items'}
              {clientMode && rangeActive && <> (filtered)</>}
            </span>

            {totalPages > 1 && (
              <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                Next →
              </Button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
