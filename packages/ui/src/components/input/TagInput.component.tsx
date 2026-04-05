'use client';

import React, { useState, useRef, KeyboardEvent, FocusEvent, ChangeEvent, useMemo } from 'react';
import clsx from 'clsx';
import styles from './TagInput.module.scss';

export type TagInputProps<T = string> = {
  id?: string;
  value: T[] | T | string;
  onChange: (value: T[]) => void;
  onBlur?: (event: FocusEvent<HTMLDivElement>) => void;
  onFocus?: (event: FocusEvent<HTMLDivElement>) => void;
  disabled?: boolean;
  placeholder?: string;
  hasError?: boolean;
  /** Function to convert string input to tag value (for objects) */
  parseTag?: (input: string) => T;
  /** Function to convert tag value to display string */
  getTagLabel?: (tag: T) => string;
  /** Function to convert tag value to unique key */
  getTagKey?: (tag: T, index: number) => string | number;
  /** Separator character(s) for creating new tags (default: comma) */
  separator?: string | RegExp;
  /** Allow duplicate tags */
  allowDuplicates?: boolean;
  className?: string;
};

/**
 * Normalizes the incoming value to an array of tags
 */
function normalizeValue<T>(value: T[] | T | string | null | undefined, parseTag?: (input: string) => T): T[] {
  // Handle null/undefined
  if (value == null) {
    return [];
  }

  // Already an array
  if (Array.isArray(value)) {
    return value;
  }

  // String value - try to split by commas
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }

    // Split by comma and parse each part
    const parts = trimmed
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);

    if (parseTag) {
      try {
        return parts.map(parseTag);
      } catch (error) {
        console.warn('Failed to parse string value as tags:', error);
        return [];
      }
    }

    return parts as T[];
  }

  // Single non-string, non-array value - wrap in array
  return [value];
}

export function TagInput<T = string>({
  id,
  value: rawValue,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  placeholder = 'Type and press comma or enter...',
  hasError = false,
  parseTag,
  getTagLabel,
  getTagKey,
  separator = ',',
  allowDuplicates = false,
  className,
}: TagInputProps<T>) {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Default implementations for string tags
  const defaultParseTag = (input: string): T => input as T;
  const defaultGetTagLabel = (tag: T): string => String(tag);
  const defaultGetTagKey = (tag: T, index: number): string | number => `${tag}-${index}`;

  const actualParseTag = parseTag ?? defaultParseTag;
  const actualGetTagLabel = getTagLabel ?? defaultGetTagLabel;
  const actualGetTagKey = getTagKey ?? defaultGetTagKey;

  // Normalize the value to always be an array
  const value = useMemo(() => normalizeValue(rawValue, parseTag), [rawValue, parseTag]);

  const addTag = (input: string) => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    try {
      const newTag = actualParseTag(trimmedInput);
      const tagLabel = actualGetTagLabel(newTag);

      // Check for duplicates if not allowed
      if (!allowDuplicates) {
        const isDuplicate = value.some((existingTag) => actualGetTagLabel(existingTag) === tagLabel);
        if (isDuplicate) {
          setInputValue('');
          return;
        }
      }

      onChange([...value, newTag]);
      setInputValue('');
    } catch (error) {
      // If parsing fails, don't add the tag
      console.warn('Failed to parse tag:', error);
    }
  };

  const removeTag = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;

    // Check if separator was typed
    const separatorRegex = typeof separator === 'string' ? new RegExp(`[${separator}]`) : separator;

    if (separatorRegex.test(newValue)) {
      // Split by separator and add all non-empty parts
      const parts = newValue.split(separatorRegex);
      parts.forEach((part) => {
        if (part.trim()) {
          addTag(part);
        }
      });
    } else {
      setInputValue(newValue);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addTag(inputValue);
    } else if (event.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      event.preventDefault();
      removeTag(value.length - 1);
    }
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    // Add any remaining input as a tag on blur
    if (inputValue.trim()) {
      addTag(inputValue);
    }
    setIsFocused(false);
    onBlur?.(event);
  };

  return (
    <div
      ref={containerRef}
      className={clsx(styles.tagInput, isFocused && styles.focused, hasError && styles.hasError, disabled && styles.disabled, className)}
      onClick={handleContainerClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
      tabIndex={-1}
    >
      <div className={styles.tagsContainer}>
        {value?.map((tag, index) => (
          <div key={actualGetTagKey(tag, index)} className={styles.tag}>
            <span className={styles.tagLabel}>{actualGetTagLabel(tag)}</span>
            {!disabled && (
              <button
                type="button"
                className={styles.tagRemove}
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(index);
                }}
                aria-label={`Remove ${actualGetTagLabel(tag)}`}
              >
                ×
              </button>
            )}
          </div>
        ))}
        <input
          ref={inputRef}
          id={id}
          type="text"
          className={styles.input}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={value.length === 0 ? placeholder : ''}
        />
      </div>
    </div>
  );
}
