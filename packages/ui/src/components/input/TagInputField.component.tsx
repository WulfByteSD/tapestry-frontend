'use client';

import React, { useState } from 'react';
import clsx from 'clsx';
import { TagInput, TagInputProps } from './TagInput.component';
import styles from './TagInputField.module.scss';

export type TagInputFieldProps<T = string> = TagInputProps<T> & {
  label?: string;
  hint?: string;
  helpText?: string;
  error?: string;
  floatingLabel?: boolean;
};

export function TagInputField<T = string>({ id, label, hint, helpText, error, className, floatingLabel = false, ...tagInputProps }: TagInputFieldProps<T>) {
  const displayHint = helpText ?? hint;
  const hasError = Boolean(error) || Boolean(tagInputProps.hasError);
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = tagInputProps.value && tagInputProps.value.length > 0;
  const isFloating = isFocused || hasValue;

  const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    setIsFocused(true);
    tagInputProps.onFocus?.(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    setIsFocused(false);
    tagInputProps.onBlur?.(event);
  };

  if (floatingLabel && label) {
    return (
      <div className={clsx(styles.field, className)}>
        <div className={clsx(styles.floatingWrap, isFloating && styles.floating, hasError && styles.hasError)}>
          <TagInput
            id={id}
            {...tagInputProps}
            hasError={hasError}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={styles.floatingInput}
            placeholder={isFloating ? tagInputProps.placeholder : undefined}
          />
          <label className={styles.floatingLabel} htmlFor={id}>
            {label}
          </label>
        </div>

        {error ? (
          <div className={styles.error} role="alert">
            {error}
          </div>
        ) : displayHint ? (
          <div className={styles.hint}>{displayHint}</div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={clsx(styles.field, className)}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}

      <TagInput id={id} {...tagInputProps} hasError={hasError} />

      {error ? (
        <div className={styles.error} role="alert">
          {error}
        </div>
      ) : displayHint ? (
        <div className={styles.hint}>{displayHint}</div>
      ) : null}
    </div>
  );
}
