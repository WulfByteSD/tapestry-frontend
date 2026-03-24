'use client';

import React, { useState, useRef } from 'react';
import clsx from 'clsx';
import { Select, SelectProps, SelectOption } from './Select.component';
import styles from './TextField.module.scss';

export type SelectFieldProps = SelectProps & {
  label?: string;
  hint?: string;
  helpText?: string;
  error?: string;
  floatingLabel?: boolean;
  options?: SelectOption[];
};

export function SelectField({ id, label, hint, helpText, error, className, floatingLabel = false, options, children, ...selectProps }: SelectFieldProps) {
  const displayHint = helpText ?? hint;
  const selectRef = useRef<HTMLSelectElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const hasError = Boolean(error) || Boolean(selectProps.hasError);
  const hasValue = Boolean(selectProps.value);
  const isFloating = isFocused || hasValue;

  const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
    setIsFocused(true);
    selectProps.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    setIsFocused(false);
    selectProps.onBlur?.(e);
  };

  if (floatingLabel && label) {
    return (
      <div className={clsx(styles.field, className)}>
        <div className={clsx(styles.floatingWrap, isFloating && styles.floating, hasError && styles.hasError)}>
          <Select ref={selectRef} id={id} {...selectProps} hasError={hasError} onFocus={handleFocus} onBlur={handleBlur} className={styles.floatingInput} options={options}>
            {children}
          </Select>
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

      <Select id={id} {...selectProps} hasError={hasError} options={options}>
        {children}
      </Select>

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
