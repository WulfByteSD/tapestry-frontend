'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import type { SelectOption, SelectSize } from './Select.component';
import { FormControlShell } from './FormControlShell.component';
import styles from './MultiSelect.module.scss';
// MultiSelect.component.tsx
export type MultiSelectProps = {
  id?: string;
  value: (string | number)[];
  onChange: (value: (string | number)[]) => void;
  onBlur?: (event: React.FocusEvent<HTMLDivElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLDivElement>) => void;
  disabled?: boolean;
  placeholder?: string;
  hasError?: boolean;
  options: SelectOption[];
  className?: string;
  size?: SelectSize;
  showPlaceholder?: boolean;
  'aria-describedby'?: string;
};
export function MultiSelect({
  id,
  value = [],
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  placeholder = 'Select options...',
  hasError = false,
  options,
  className,
  size = 'md',
  showPlaceholder = true,
  'aria-describedby': ariaDescribedBy,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleOption = (optionValue: string | number) => {
    if (disabled) return;

    if (value.includes(optionValue)) {
      onChange(value.filter((entry) => entry !== optionValue));
      return;
    }

    onChange([...value, optionValue]);
  };

  const selectedLabels = useMemo(
    () => value.map((selectedValue) => options.find((entry) => entry.value === selectedValue)?.label ?? null).filter(Boolean) as string[],
    [options, value]
  );

  const firstSelectedLabel = selectedLabels[0];
  const additionalSelectionCount = Math.max(0, selectedLabels.length - 1);
  const additionalSelectionLabel = additionalSelectionCount > 0 ? `+${additionalSelectionCount} other ${additionalSelectionCount === 1 ? 'value' : 'values'}` : null;

  return (
    <div ref={containerRef} className={styles.multiSelect}>
      <FormControlShell size={size} hasError={hasError} disabled={disabled} focused={isFocused || isOpen} className={className}>
        <div
          id={id}
          className={clsx(styles.trigger, disabled && styles.triggerDisabled)}
          onClick={() => {
            if (!disabled) {
              setIsOpen((current) => !current);
            }
          }}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={ariaDescribedBy}
        >
          {selectedLabels.length > 0 ? (
            <div className={styles.selectionSummary}>
              <span className={styles.selectionPrimary}>{firstSelectedLabel}</span>
              {additionalSelectionLabel ? <span className={styles.selectionSecondary}>{additionalSelectionLabel}</span> : null}
            </div>
          ) : showPlaceholder ? (
            <span className={styles.placeholder}>{placeholder}</span>
          ) : (
            <span className={styles.placeholderHidden} aria-hidden="true" />
          )}

          <div className={styles.arrow} aria-hidden="true">
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </FormControlShell>

      {isOpen && (
        <div className={styles.dropdown} role="listbox" aria-multiselectable="true">
          {options.map((option) => {
            const isSelected = value.includes(option.value);
            const isDisabled = option.disabled || false;

            return (
              <div
                key={option.value}
                className={clsx(styles.option, isSelected && styles.selected, isDisabled && styles.optionDisabled)}
                onClick={(event) => {
                  event.stopPropagation();
                  if (!isDisabled) {
                    handleToggleOption(option.value);
                  }
                }}
              >
                <div className={styles.checkbox}>
                  {isSelected && (
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className={styles.optionLabel}>{option.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
