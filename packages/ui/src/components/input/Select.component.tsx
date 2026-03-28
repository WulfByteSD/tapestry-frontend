'use client';

import React from 'react';
import clsx from 'clsx';
import { FormControlShell, type FormControlSize } from './FormControlShell.component';
import styles from './Select.module.scss';

export type SelectSize = FormControlSize;

export type SelectOption = {
  label: string;
  value: string | number;
  disabled?: boolean;
};

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  size?: SelectSize;
  hasError?: boolean;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  options?: SelectOption[];
  hideDisplayWhenEmpty?: boolean;
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { size = 'md', hasError = false, leftSlot, rightSlot, className, options, children, disabled, hideDisplayWhenEmpty = false, value, defaultValue, ...rest },
  ref
) {
  const content = options
    ? options.map((option) => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))
    : children;

  const currentValue = value ?? defaultValue;
  const isEmpty = currentValue === undefined || currentValue === null || currentValue === '';

  return (
    <FormControlShell size={size as any} hasError={hasError} disabled={disabled} leftSlot={leftSlot} rightSlot={rightSlot} className={className}>
      <select
        ref={ref}
        className={clsx(styles.select, hideDisplayWhenEmpty && isEmpty && styles.displayHiddenWhenEmpty)}
        disabled={disabled}
        value={value}
        defaultValue={defaultValue}
        data-empty={isEmpty ? 'true' : 'false'}
        {...rest}
      >
        {content}
      </select>
    </FormControlShell>
  );
});
