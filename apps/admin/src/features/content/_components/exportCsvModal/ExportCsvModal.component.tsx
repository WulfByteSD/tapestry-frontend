'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Loader, Modal, SelectField, useAlert } from '@tapestry/ui';
import { getSettings } from '@tapestry/api-client';
import { api } from '@/lib/api';
import { exportContentCsv, useExportCount } from '@/lib/content-admin';
import type { ContentAdminResource } from '@/lib/content-admin/contentAdmin.types';
import type { InventoryCategory } from '@tapestry/types';
import styles from './ExportCsvModal.module.scss';

// ── Constants ──────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS: { label: string; value: InventoryCategory }[] = [
  { label: 'Weapon', value: 'weapon' },
  { label: 'Armor', value: 'armor' },
  { label: 'Gear', value: 'gear' },
  { label: 'Consumable', value: 'consumable' },
  { label: 'Tool', value: 'tool' },
  { label: 'Currency', value: 'currency' },
  { label: 'Quest', value: 'quest' },
  { label: 'Other', value: 'other' },
];

type StatusFilter = '' | 'draft' | 'published' | 'archived';

// ── Count callout severity ─────────────────────────────────────────────────

type CountSeverity = 'none' | 'caution' | 'warning' | 'danger';

function getCountSeverity(count: number): CountSeverity {
  if (count >= 1000) return 'danger';
  if (count >= 500) return 'warning';
  if (count >= 200) return 'caution';
  return 'none';
}

// ── Props ──────────────────────────────────────────────────────────────────

type ExportCsvModalProps = {
  open: boolean;
  onClose: () => void;
  resource: ContentAdminResource;
  initialSettingKey?: string;
};

// ── Filter string builder ──────────────────────────────────────────────────

function buildExportFilterString(settingKey: string, categories: InventoryCategory[], status: StatusFilter): string | undefined {
  const parts: string[] = [];

  if (settingKey) {
    parts.push(`settingKeys;{"$in":"${settingKey}"}`);
  }

  if (categories.length === 1) {
    parts.push(`category;${categories[0]}`);
  } else if (categories.length > 1) {
    parts.push(`category;{"$in":"${categories.join(',')}"}`);
  }

  if (status) {
    parts.push(`status;${status}`);
  }

  return parts.length > 0 ? parts.join('|') : undefined;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ExportCsvModal({ open, onClose, resource, initialSettingKey = '' }: ExportCsvModalProps) {
  const { addAlert } = useAlert();
  const [isExporting, setIsExporting] = useState(false);
  const [settingKey, setSettingKey] = useState(initialSettingKey);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [status, setStatus] = useState<StatusFilter>('');

  // Sync settingKey when initialSettingKey changes (e.g. parent setting selection changes)
  // Only on modal open to avoid overriding user edits mid-session
  const [lastInitialKey, setLastInitialKey] = useState(initialSettingKey);
  if (open && initialSettingKey !== lastInitialKey) {
    setSettingKey(initialSettingKey);
    setLastInitialKey(initialSettingKey);
  }

  // ── Settings list ──────────────────────────────────────────────────────

  const settingsQuery = useQuery({
    queryKey: ['content:settings:export'],
    queryFn: () => getSettings(api, { pageLimit: 50, sortOptions: 'name' }),
    enabled: open,
  });

  const settings = settingsQuery.data?.payload ?? [];

  // ── Filter string + count ──────────────────────────────────────────────

  const filterOptions = useMemo(() => buildExportFilterString(settingKey, categories, status), [settingKey, categories, status]);

  const countQuery = useExportCount(resource, filterOptions);
  const count = countQuery.data?.payload?.count ?? null;

  // ── Category toggle ────────────────────────────────────────────────────

  function toggleCategory(cat: InventoryCategory) {
    setCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  }

  // ── Export ─────────────────────────────────────────────────────────────

  async function handleExport() {
    setIsExporting(true);
    try {
      await exportContentCsv(resource, filterOptions);
      addAlert({
        type: 'success',
        message: 'Export complete',
        description: 'Your CSV file has been downloaded.',
      });
      onClose();
    } catch {
      addAlert({
        type: 'error',
        message: 'Export failed',
        description: 'Could not download the CSV. Please try again.',
      });
    } finally {
      setIsExporting(false);
    }
  }

  // ── Derived state ──────────────────────────────────────────────────────

  const severity = count !== null ? getCountSeverity(count) : 'none';
  const exportDisabled = isExporting || countQuery.isLoading || count === 0 || count === null;

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Export CSV"
      width={600}
      destroyOnClose
      footer={
        <div className={styles.footer}>
          <Button variant="ghost" tone="neutral" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button variant="solid" tone="gold" onClick={handleExport} disabled={exportDisabled}>
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>
      }
    >
      <div className={styles.content}>
        <p className={styles.description}>
          Configure filters to narrow the export. Leave all filters empty to export <strong>all {resource}</strong> regardless of setting, category, or status.
        </p>

        {/* ── Filters ── */}
        <div className={styles.filtersGrid}>
          <SelectField
            label="Setting"
            value={settingKey}
            onChange={(e) => setSettingKey(e.target.value)}
            options={[{ label: 'All settings', value: '' }, ...settings.map((s) => ({ label: s.name, value: s.key }))]}
            disabled={settingsQuery.isLoading}
          />

          <SelectField
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            options={[
              { label: 'All statuses', value: '' },
              { label: 'Published', value: 'published' },
              { label: 'Draft', value: 'draft' },
              { label: 'Archived', value: 'archived' },
            ]}
          />
        </div>

        {/* ── Category filter (items only) ── */}
        {resource === 'items' && (
          <div className={styles.categorySection}>
            <p className={styles.categoryLabel}>Category</p>
            <div className={styles.categoryGrid}>
              {CATEGORY_OPTIONS.map((opt) => (
                <label key={opt.value} className={styles.categoryChip} data-active={categories.includes(opt.value)}>
                  <input type="checkbox" className={styles.categoryCheckbox} checked={categories.includes(opt.value)} onChange={() => toggleCategory(opt.value)} />
                  {opt.label}
                </label>
              ))}
            </div>
            {categories.length > 0 && (
              <button type="button" className={styles.clearCategories} onClick={() => setCategories([])}>
                Clear category filter
              </button>
            )}
          </div>
        )}

        {/* ── Count callout ── */}
        <div className={styles.countArea}>
          {countQuery.isLoading ? (
            <div className={styles.countLoading}>
              <Loader size="sm" tone="gold" />
              <span>Counting records…</span>
            </div>
          ) : count === 0 ? (
            <div className={styles.countCallout} data-severity="empty">
              No records match your filters — nothing to export.
            </div>
          ) : count !== null ? (
            <div className={styles.countCallout} data-severity={severity}>
              {severity === 'none' && (
                <>
                  <strong>{count.toLocaleString()}</strong> {count === 1 ? 'record' : 'records'} will be exported.
                </>
              )}
              {severity === 'caution' && (
                <>
                  This export will include <strong>{count.toLocaleString()}</strong> records. The file may be large.
                </>
              )}
              {severity === 'warning' && (
                <>
                  Large export: <strong>{count.toLocaleString()}</strong> records. Confirm before proceeding.
                </>
              )}
              {severity === 'danger' && (
                <>
                  Very large export — <strong>{count.toLocaleString()}</strong> records. This may take time and produce a large file.
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
