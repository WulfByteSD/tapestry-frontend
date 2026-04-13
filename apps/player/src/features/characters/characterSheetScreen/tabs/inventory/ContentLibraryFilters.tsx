'use client';

import { Input, MultiSelect, Select, TextField } from '@tapestry/ui';
import type { SelectOption } from '@tapestry/ui';
import type { InventoryCategory, SettingDefinition } from '@tapestry/types';
import styles from './ContentLibraryModal.module.scss';

// ── Filter state model ─────────────────────────────────────────────────────

export type LibraryFilters = {
  categories: InventoryCategory[];
  search: string;
  rangeMode: 'none' | 'protection' | 'harm';
  protectionMin: string;
  protectionMax: string;
  harmMin: string;
  harmMax: string;
};

export const DEFAULT_FILTERS: LibraryFilters = {
  categories: [],
  search: '',
  rangeMode: 'none',
  protectionMin: '',
  protectionMax: '',
  harmMin: '',
  harmMax: '',
};

// ── Constants ──────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS: SelectOption[] = [
  { value: 'weapon', label: 'Weapon' },
  { value: 'armor', label: 'Armor' },
  { value: 'gear', label: 'Gear' },
  { value: 'consumable', label: 'Consumable' },
  { value: 'tool', label: 'Tool' },
  { value: 'currency', label: 'Currency' },
  { value: 'quest', label: 'Quest' },
  { value: 'other', label: 'Other' },
];

const RANGE_MODES = [
  { value: 'none', label: 'None' },
  { value: 'protection', label: 'Protection' },
  { value: 'harm', label: 'Harm' },
] as const;

// ── Component ──────────────────────────────────────────────────────────────

type Props = {
  filters: LibraryFilters;
  onChange: (next: LibraryFilters) => void;
  settings: SettingDefinition[];
  settingKey: string;
  onSettingChange: (key: string) => void;
  settingLocked: boolean;
  settingsLoading: boolean;
};

export function ContentLibraryFilters({ filters, onChange, settings, settingKey, onSettingChange, settingLocked, settingsLoading }: Props) {
  function set<K extends keyof LibraryFilters>(key: K, value: LibraryFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  function handleRangeMode(mode: LibraryFilters['rangeMode']) {
    onChange({
      ...filters,
      rangeMode: mode,
      // Clear the inactive side's values so they don't linger
      protectionMin: mode === 'protection' ? filters.protectionMin : '',
      protectionMax: mode === 'protection' ? filters.protectionMax : '',
      harmMin: mode === 'harm' ? filters.harmMin : '',
      harmMax: mode === 'harm' ? filters.harmMax : '',
    });
  }

  const activeMin = filters.rangeMode === 'protection' ? filters.protectionMin : filters.harmMin;
  const activeMax = filters.rangeMode === 'protection' ? filters.protectionMax : filters.harmMax;

  function setActiveMin(val: string) {
    if (filters.rangeMode === 'protection') set('protectionMin', val);
    else set('harmMin', val);
  }

  function setActiveMax(val: string) {
    if (filters.rangeMode === 'protection') set('protectionMax', val);
    else set('harmMax', val);
  }

  const rangeLabel = filters.rangeMode === 'protection' ? 'Protection range' : 'Harm range';

  return (
    <div className={styles.filters}>
      {/* Row 1: Setting + Search */}
      <div className={styles.filterRow}>
        <div className={styles.filterGroup}>
          <label className={styles.label}>Setting</label>
          <Select value={settingKey} onChange={(e) => onSettingChange(e.target.value)} disabled={settingLocked || settingsLoading}>
            {settings.map((s: SettingDefinition) => (
              <option key={s.key} value={s.key}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>

        <div className={styles.filterGroup}>
          <TextField label="Search" value={filters.search} onChange={(e) => set('search', e.target.value)} placeholder="Shortsword, potion, armor..." />
        </div>
      </div>

      {/* Row 2: Category multi-select + Range mode toggle */}
      <div className={styles.filterRow}>
        <div className={styles.filterGroup}>
          <label className={styles.label}>Category</label>
          <MultiSelect value={filters.categories} onChange={(vals) => set('categories', vals as InventoryCategory[])} options={CATEGORY_OPTIONS} placeholder="All categories" />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.label}>Stat filter</label>
          <div className={styles.rangeToggle} role="group" aria-label="Stat filter mode">
            {RANGE_MODES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={`${styles.rangeSegment} ${filters.rangeMode === value ? styles.rangeSegmentActive : ''}`}
                onClick={() => handleRangeMode(value)}
                aria-pressed={filters.rangeMode === value}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Range inputs — visible only when a range mode is active */}
      {filters.rangeMode !== 'none' && (
        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label className={styles.label}>{rangeLabel}</label>
            <div className={styles.rangeInputs}>
              <Input
                type="number"
                placeholder="Min"
                value={activeMin}
                onChange={(e) => setActiveMin((e as React.ChangeEvent<HTMLInputElement>).target.value)}
                min={0}
                aria-label={`${rangeLabel} minimum`}
              />
              <span className={styles.rangeSep}>to</span>
              <Input
                type="number"
                placeholder="Max"
                value={activeMax}
                onChange={(e) => setActiveMax((e as React.ChangeEvent<HTMLInputElement>).target.value)}
                min={0}
                aria-label={`${rangeLabel} maximum`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
