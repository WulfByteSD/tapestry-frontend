'use client';

import React, { useState, useRef } from 'react';
import clsx from 'clsx';
import { Select, SelectProps, SelectOption } from './Select.component';
import { MultiSelect } from './MultiSelect.component';
import styles from './TextField.module.scss';

type SelectMode = 'single' | 'multiple';

type BaseSelectFieldProps = {
  label?: string;
  hint?: string;
  className?: string;
  helpText?: string;
  error?: string;
  floatingLabel?: boolean;
  options?: SelectOption[];
};

type SingleSelectFieldProps = BaseSelectFieldProps &
  SelectProps & {
    mode?: 'single';
  };

type MultiSelectFieldProps = BaseSelectFieldProps & {
  mode: 'multiple';
  value?: (string | number)[];
  onChange?: (value: (string | number)[]) => void;
  onBlur?: (event: React.FocusEvent<HTMLDivElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLDivElement>) => void;
  id?: string;
  disabled?: boolean;
  placeholder?: string;
  hasError?: boolean;
};

export type SelectFieldProps = SingleSelectFieldProps | MultiSelectFieldProps;

export function SelectField(props: SelectFieldProps) {
  const { label, hint, helpText, error, className, floatingLabel = false, options, mode = 'single' } = props;

  const displayHint = helpText ?? hint;
  const hasError = Boolean(error) || Boolean(props.hasError);

  // Multi-select mode
  if (mode === 'multiple') {
    const { id, value = [], onChange, onFocus, onBlur, disabled, placeholder } = props as MultiSelectFieldProps;
    const multiSelectRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value.length > 0;
    const isFloating = isFocused || hasValue;

    const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleChange = (newValue: (string | number)[]) => {
      onChange?.(newValue);
    };

    if (floatingLabel && label) {
      return (
        <div className={clsx(styles.field, className)}>
          <div className={clsx(styles.floatingWrap, isFloating && styles.floating, hasError && styles.hasError)}>
            <MultiSelect
              id={id}
              value={value}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              disabled={disabled}
              placeholder={placeholder}
              hasError={hasError}
              options={options || []}
              className={styles.floatingInput}
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

        <MultiSelect
          id={id}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          hasError={hasError}
          options={options || []}
        />

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

  // Single-select mode (original behavior)
  const { id, children, ...selectProps } = props as SingleSelectFieldProps;
  const selectRef = useRef<HTMLSelectElement>(null);
  const [isFocused, setIsFocused] = useState(false);
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
