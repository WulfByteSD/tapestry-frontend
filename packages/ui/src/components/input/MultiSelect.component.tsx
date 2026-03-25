'use client';

import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import type { SelectOption } from './Select.component';
import styles from './MultiSelect.module.scss';

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
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleToggleOption = (optionValue: string | number) => {
    if (disabled) return;

    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const handleRemoveValue = (valueToRemove: string | number) => {
    if (disabled) return;
    onChange(value.filter((v) => v !== valueToRemove));
  };

  const handleContainerClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    setIsFocused(false);
    onBlur?.(event);
  };

  const getSelectedLabels = () => {
    return value
      .map((v) => {
        const option = options.find((opt) => opt.value === v);
        return option ? { value: v, label: option.label } : null;
      })
      .filter(Boolean) as { value: string | number; label: string }[];
  };

  const selectedLabels = getSelectedLabels();

  return (
    <div
      ref={containerRef}
      className={clsx(styles.multiSelect, isOpen && styles.open, isFocused && styles.focused, hasError && styles.hasError, disabled && styles.disabled, className)}
      onClick={handleContainerClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
      tabIndex={disabled ? -1 : 0}
    >
      <div className={styles.tagsContainer}>
        {selectedLabels.length > 0 ? (
          selectedLabels.map((item) => (
            <div key={item.value} className={styles.tag}>
              <span className={styles.tagLabel}>{item.label}</span>
              {!disabled && (
                <button
                  type="button"
                  className={styles.tagRemove}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveValue(item.value);
                  }}
                  aria-label={`Remove ${item.label}`}
                >
                  ×
                </button>
              )}
            </div>
          ))
        ) : (
          <span className={styles.placeholder}>{placeholder}</span>
        )}
        <div className={styles.arrow}>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div ref={dropdownRef} className={styles.dropdown}>
          {options.map((option) => {
            const isSelected = value.includes(option.value);
            const isDisabled = option.disabled || false;

            return (
              <div
                key={option.value}
                className={clsx(styles.option, isSelected && styles.selected, isDisabled && styles.optionDisabled)}
                onClick={(e) => {
                  e.stopPropagation();
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
